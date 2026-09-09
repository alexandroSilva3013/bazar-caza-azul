const express = require("express");
const pool = require("./db");
const autenticarToken = require("./auth");
const somenteAdmin = require("./admin");

const router = express.Router();

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
router.post("/", autenticarToken, somenteAdmin, async (req, res) => {
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
router.put("/:id", autenticarToken, somenteAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const { nome, descricao, categoria, preco, quantidade, status, condicao, imagem } = req.body;

    const resultado = await pool.query(
      `UPDATE produtos
       SET nome = $1,
           descricao = $2,
           categoria = $3,
           preco = $4,
           quantidade = $5,
           status = $6,
           condicao = $7,
           imagem = $8
       WHERE id = $9
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
  id
]
    );

    if (resultado.rows.length === 0) {
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
router.delete("/:id", autenticarToken, somenteAdmin, async (req, res) => {
  try {
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
    console.error(error);

    res.status(500).json({
      erro: "Erro ao excluir produto."
    });
  }
});

module.exports = router;