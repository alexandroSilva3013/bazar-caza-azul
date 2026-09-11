const express = require("express");
const router = express.Router();

const pool = require("./db");
const autenticarToken = require("./auth");
const adminOuVendedor = require("./adminOuVendedor");

router.get("/", autenticarToken, adminOuVendedor, async (req, res) => {
  try {
    const resultado = await pool.query(`
      SELECT
        v.id,
        v.usuario_id,
        u.nome AS cliente,
        v.valor_total,
        v.forma_pagamento,
        v.data_venda,
        v.origem,
        v.status
      FROM vendas v
      LEFT JOIN usuarios u ON u.id = v.usuario_id
      ORDER BY v.id DESC
    `);

    for (const venda of resultado.rows) {
      const itens = await pool.query(`
        SELECT
          iv.produto_id,
          iv.quantidade,
          iv.preco_unitario,
          p.nome,
          p.descricao,
          p.categoria,
          p.condicao,
          p.imagem,
          p.status
        FROM itens_venda iv
        INNER JOIN produtos p ON p.id = iv.produto_id
        WHERE iv.venda_id = $1
        ORDER BY iv.id
      `, [venda.id]);

      venda.itens = itens.rows;
    }

    res.json(resultado.rows);

  } catch (error) {
    console.error("Erro ao listar vendas:", error);

    res.status(500).json({
      erro: "Erro ao listar vendas."
    });
  }
});

router.get(["/minhas", "/minhas/reservas"], autenticarToken, async (req, res) => {
  try {
    const usuarioId = Number(req.usuario.id);
    if (!Number.isSafeInteger(usuarioId) || usuarioId <= 0) return res.status(401).json({ erro: "Sessão inválida." });
    const resultado = await pool.query(`
      SELECT
        v.id,
        v.usuario_id,
        u.nome AS cliente,
        v.valor_total,
        v.forma_pagamento,
        v.data_venda,
        v.origem,
        v.status
      FROM vendas v
      LEFT JOIN usuarios u ON u.id = v.usuario_id
      WHERE v.usuario_id = $1 AND v.origem = $2
      ORDER BY v.id DESC
    `, [usuarioId, req.path === "/minhas/reservas" ? "reserva" : "compra"]);

    for (const venda of resultado.rows) {
      const itens = await pool.query(`
        SELECT
          iv.produto_id,
          iv.quantidade,
          iv.preco_unitario,
          p.nome,
          p.descricao,
          p.categoria,
          p.condicao,
          p.imagem,
          p.status
        FROM itens_venda iv
        INNER JOIN produtos p ON p.id = iv.produto_id
        WHERE iv.venda_id = $1
        ORDER BY iv.id
      `, [venda.id]);

      venda.itens = itens.rows;
    }

    res.json(resultado.rows);

  } catch (error) {
    console.error("Erro ao listar vendas:", error);

    res.status(500).json({
      erro: "Erro ao listar vendas."
    });
  }
});

router.post(["/", "/reservas"], autenticarToken, async (req, res) => {
  let cliente;
  let transacaoAberta = false;
  try {
    const { forma_pagamento, itens } = req.body;
    const usuario_id = Number(req.usuario.id);
    if (!Number.isSafeInteger(usuario_id) || usuario_id <= 0) return res.status(401).json({ erro: "Sessão inválida." });
    const reserva = req.path === "/reservas";
    if (reserva && (!Array.isArray(itens) || itens.length !== 1 || itens[0]?.quantidade !== 1)) {
      return res.status(400).json({ erro: "Cada reserva deve conter uma unidade de um produto." });
    }
    if (!usuario_id || !Array.isArray(itens) || itens.length === 0) {
      return res.status(400).json({ erro: "Usuário e itens da venda são obrigatórios." });
    }
    const agrupados = new Map();
    for (const item of itens) {
      if (!item || !Number.isInteger(item.produto_id) || item.produto_id <= 0 ||
          !Number.isInteger(item.quantidade) || item.quantidade <= 0 || item.quantidade > 2147483647) {
        return res.status(400).json({ erro: "Produto e quantidade devem ser números inteiros positivos." });
      }
      const quantidade = (agrupados.get(item.produto_id) || 0) + item.quantidade;
      if (quantidade > 2147483647) {
        return res.status(400).json({ erro: "Quantidade solicitada excede o limite permitido." });
      }
      agrupados.set(item.produto_id, quantidade);
    }
    // Bloqueia os produtos na mesma ordem para evitar disputas entre carrinhos.
    const itensAgrupados = [...agrupados].sort((a, b) => a[0] - b[0])
      .map(([produto_id, quantidade]) => ({ produto_id, quantidade }));
    const precos = new Map();
    cliente = await pool.connect();
    await cliente.query("BEGIN");
    transacaoAberta = true;
    let valorTotal = 0;
    for (const item of itensAgrupados) {
      const produto = await cliente.query(
        "SELECT id, preco, quantidade, status FROM produtos WHERE id = $1 FOR UPDATE",
        [item.produto_id]
      );
      if (produto.rows.length === 0) {
        throw Object.assign(new Error("Produto não encontrado."), { statusCode: 404 });
      }
      const produtoBanco = produto.rows[0];
      if (produtoBanco.status !== "disponivel") throw Object.assign(new Error("Produto indisponível."), { statusCode: 409 });
      if (produtoBanco.quantidade === null || Number(produtoBanco.quantidade) < item.quantidade) {
        throw Object.assign(new Error("Quantidade insuficiente em estoque."), { statusCode: 409 });
      }
      precos.set(item.produto_id, Number(produtoBanco.preco));
      valorTotal += Number(produtoBanco.preco) * item.quantidade;
    }
    const venda = await cliente.query(
      `INSERT INTO vendas (usuario_id, valor_total, forma_pagamento, status, origem)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [usuario_id, valorTotal, forma_pagamento || null, reserva ? "Reservada" : "Pendente", reserva ? "reserva" : "compra"]
    );
    for (const item of itensAgrupados) {
      await cliente.query(
        `INSERT INTO itens_venda (venda_id, produto_id, quantidade, preco_unitario)
         VALUES ($1, $2, $3, $4)`,
        [venda.rows[0].id, item.produto_id, item.quantidade, precos.get(item.produto_id)]
      );
      await cliente.query(
        "UPDATE produtos SET quantidade = quantidade - $1 WHERE id = $2",
        [item.quantidade, item.produto_id]
      );
    }
    await cliente.query("COMMIT");
    transacaoAberta = false;
    res.status(201).json({ mensagem: "Venda registrada com sucesso!", venda: venda.rows[0] });
  } catch (error) {
    if (transacaoAberta) {
      try { await cliente.query("ROLLBACK"); }
      catch (rollbackError) { console.error("Erro ao desfazer venda:", rollbackError); }
    }
    console.error("Erro ao registrar venda:", error);
    res.status(error.statusCode || 500).json({ erro: error.statusCode ? error.message : "Erro ao registrar venda." });
  } finally {
    if (cliente) cliente.release();
  }
});


router.put("/:id/status", autenticarToken, adminOuVendedor, async (req, res) => {
  let cliente;
  let transacaoAberta = false;
  try {
    const { id } = req.params;
    if (!/^[1-9]\d*$/.test(id) || !Number.isSafeInteger(Number(id))) return res.status(400).json({ erro: "Venda inválida." });
    const { status } = req.body;

    const statusPermitidos = [
      "Pendente",
      "Reservada",
      "Confirmada",
      "Finalizada",
      "Cancelada"
    ];

    if (!statusPermitidos.includes(status)) {
      return res.status(400).json({
        erro: "Status inválido."
      });
    }

    cliente = await pool.connect();
    await cliente.query("BEGIN");
    transacaoAberta = true;

    const vendaAtual = await cliente.query(
      "SELECT id, status FROM vendas WHERE id = $1 FOR UPDATE",
      [id]
    );

    if (vendaAtual.rows.length === 0) {
      await cliente.query("ROLLBACK");
      transacaoAberta = false;
      return res.status(404).json({ erro: "Venda não encontrada." });
    }

    const statusAnterior = vendaAtual.rows[0].status;
    if ((statusAnterior === "Cancelada") !== (status === "Cancelada")) {
      const itens = await cliente.query(
        "SELECT produto_id, SUM(quantidade)::integer AS quantidade FROM itens_venda WHERE venda_id = $1 GROUP BY produto_id ORDER BY produto_id", [id]
      );
      for (const item of itens.rows) {
        const produto = await cliente.query("SELECT quantidade FROM produtos WHERE id = $1 FOR UPDATE", [item.produto_id]);
        if (!produto.rows.length || produto.rows[0].quantidade === null ||
            (statusAnterior === "Cancelada" && produto.rows[0].quantidade < item.quantidade)) {
          throw Object.assign(new Error("Estoque insuficiente para reativar a venda."), { statusCode: 409 });
        }
        await cliente.query("UPDATE produtos SET quantidade = quantidade + $1 WHERE id = $2",
          [status === "Cancelada" ? item.quantidade : -item.quantidade, item.produto_id]);
      }
    }

    const resultado = await cliente.query(
      `UPDATE vendas
       SET status = $1
       WHERE id = $2
       RETURNING id, status`,
      [status, id]
    );

    await cliente.query("COMMIT");
    transacaoAberta = false;

    res.json({
      mensagem: "Status atualizado com sucesso.",
      venda: resultado.rows[0]
    });

  } catch (error) {
    if (transacaoAberta) {
      try {
        await cliente.query("ROLLBACK");
      } catch (rollbackError) {
        console.error("Erro ao desfazer atualização da venda:", rollbackError);
      }
    }
    console.error("Erro ao atualizar status da venda:", error);

    res.status(error.statusCode || 500).json({
      erro: error.statusCode ? error.message : "Erro ao atualizar status da venda."
    });
  } finally {
    if (cliente) cliente.release();
  }
});



module.exports = router;
