const express = require("express");
const pool = require("./db");
const autenticarToken = require("./auth");
const adminOuVendedor = require("./adminOuVendedor");
const validProductImage = require("./productImage");

const router = express.Router();
router.param("id", (req, res, next, id) => {
  if (!/^[1-9]\d*$/.test(id) || !Number.isSafeInteger(Number(id))) return res.status(400).json({ erro: "Produto inválido." });
  next();
});
function validarProduto(req, res, next) {
  const { nome, preco, quantidade, status } = req.body || {};
  if (typeof nome !== "string" || !nome.trim() || nome.length > 150 ||
      typeof preco !== "number" || !Number.isFinite(preco) || preco < 0 || preco > 99999999.99 ||
      (quantidade !== undefined && (!Number.isInteger(quantidade) || quantidade < 0 || quantidade > 2147483647)) ||
      (req.method === "POST" && quantidade === undefined) ||
      !["disponivel", "reservado", "vendido", "indisponivel"].includes(status)) {
    return res.status(400).json({ erro: "Informe nome, preço, quantidade e status válidos." });
  }
  if (!validProductImage(req.body.imagem)) return res.status(400).json({ erro: "Foto inválida. Escolha novamente a imagem ou informe um link http:// ou https://." });
  if (req.method === "PUT" && quantidade !== undefined &&
      (!Number.isInteger(req.body.quantidade_anterior) || req.body.quantidade_anterior < 0)) {
    return res.status(400).json({ erro: "Reabra o produto antes de alterar o estoque." });
  }
  next();
}

// LISTAR TODOS OS PRODUTOS
router.get("/", async (req, res) => {
  try {
    const resultado = await pool.query(
      "SELECT * FROM produtos ORDER BY id DESC"
    );

    res.json(resultado.rows);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      erro: "Erro ao buscar produtos."
    });
  }
});

// CADASTRAR NOVO PRODUTO
router.post("/", autenticarToken, adminOuVendedor, validarProduto, async (req, res) => {
  try {
    const {
      nome,
      descricao,
      categoria,
      preco,
      quantidade,
      status,
      condicao,
      imagem
    } = req.body;

    if (!nome || preco === undefined) {
      return res.status(400).json({
        erro: "Nome e preço são obrigatórios."
      });
    }

  const resultado = await pool.query(
      `INSERT INTO produtos
       (nome, descricao, categoria, preco, quantidade, status, condicao, imagem)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [nome, descricao, categoria, preco, quantidade, status, condicao, imagem]
    );

    res.status(201).json({
      mensagem: "Produto cadastrado com sucesso!",
      produto: resultado.rows[0]
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      erro: "Erro ao cadastrar produto."
    });
  }
});

// EDITAR PRODUTO
router.put("/:id", autenticarToken, adminOuVendedor, validarProduto, async (req, res) => {
  try {
    const { id } = req.params;

    const { nome, descricao, categoria, preco, quantidade, status, condicao, imagem } = req.body;

    const resultado = await pool.query(
      `UPDATE produtos
       SET nome = $1,
           descricao = $2,
           categoria = $3,
           preco = $4,
           quantidade = COALESCE($5, quantidade),
           status = $6,
           condicao = $7,
           imagem = $8
       WHERE id = $9 AND ($10::integer IS NULL OR quantidade = $10)
       RETURNING *`,
      [
  nome,
  descricao || null,
  categoria || null,
  preco,
  quantidade,
  status || "disponivel",
  condicao || null,
  imagem || null,
  id,
  quantidade === undefined ? null : req.body.quantidade_anterior
]
    );

    if (resultado.rows.length === 0) {
      const exists = await pool.query("SELECT id FROM produtos WHERE id = $1", [id]);
      if (exists.rows.length) return res.status(409).json({ erro: "O estoque mudou enquanto você editava. Reabra o produto e confira a quantidade antes de salvar." });
      return res.status(404).json({
        erro: "Produto não encontrado."
      });
    }

    res.json({
      mensagem: "Produto atualizado com sucesso!",
      produto: resultado.rows[0]
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      erro: "Erro ao atualizar produto."
    });
  }
});

// EXCLUIR PRODUTO
router.delete("/:id", autenticarToken, adminOuVendedor, async (req, res) => {  try {
    const { id } = req.params;

    const resultado = await pool.query(
      "DELETE FROM produtos WHERE id = $1 RETURNING *",
      [id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        erro: "Produto não encontrado."
      });
    }

    res.json({
      mensagem: "Produto excluído com sucesso!",
      produto: resultado.rows[0]
    });

  } catch (error) {
    if (error.code === "23503") return res.status(409).json({ erro: "Este produto possui vendas vinculadas e não pode ser excluído." });
    console.error(error);

    res.status(500).json({
      erro: "Erro ao excluir produto."
    });
  }
});

module.exports = router;
