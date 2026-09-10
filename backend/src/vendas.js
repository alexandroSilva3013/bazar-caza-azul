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

router.post("/", autenticarToken, async (req, res) => {
  const cliente = await pool.connect();

  try {
    const {
      usuario_id,
      forma_pagamento,
      itens
    } = req.body;

    if (!usuario_id || !Array.isArray(itens) || itens.length === 0) {
      return res.status(400).json({
        erro: "Usuário e itens da venda são obrigatórios."
      });
    }

    await cliente.query("BEGIN");

    let valorTotal = 0;

    for (const item of itens) {
      const produto = await cliente.query(
        "SELECT id, preco, quantidade FROM produtos WHERE id = $1",
        [item.produto_id]
      );

      if (produto.rows.length === 0) {
        throw new Error("Produto não encontrado.");
      }

      const produtoBanco = produto.rows[0];

      if (Number(produtoBanco.quantidade) < Number(item.quantidade)) {
        throw new Error("Quantidade insuficiente em estoque.");
      }

      valorTotal +=
        Number(produtoBanco.preco) * Number(item.quantidade);
    }

    const venda = await cliente.query(
      `INSERT INTO vendas
       (usuario_id, valor_total, forma_pagamento, status)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [
        usuario_id,
        valorTotal,
        forma_pagamento || null,
        "Pendente"
      ]
    );

    const vendaId = venda.rows[0].id;

    for (const item of itens) {
      const produto = await cliente.query(
        "SELECT preco FROM produtos WHERE id = $1",
        [item.produto_id]
      );

      const precoUnitario = Number(produto.rows[0].preco);

      await cliente.query(
        `INSERT INTO itens_venda
         (venda_id, produto_id, quantidade, preco_unitario)
         VALUES ($1, $2, $3, $4)`,
        [
          vendaId,
          item.produto_id,
          item.quantidade,
          precoUnitario
        ]
      );

      await cliente.query(
        `UPDATE produtos
         SET quantidade = quantidade - $1
         WHERE id = $2`,
        [
          item.quantidade,
          item.produto_id
        ]
      );
    }

    await cliente.query("COMMIT");

    res.status(201).json({
      mensagem: "Venda registrada com sucesso!",
      venda: venda.rows[0]
    });

  } catch (error) {
    await cliente.query("ROLLBACK");

    console.error("Erro ao registrar venda:", error);

    res.status(500).json({
      erro: error.message || "Erro ao registrar venda."
    });
  } finally {
    cliente.release();
  }
});


module.exports = router;