const express = require("express");
const pool = require("./db");
const autenticarToken = require("./auth");
const somenteAdmin = require("./admin");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const resultado = await pool.query(
      "SELECT whatsapp FROM configuracoes ORDER BY id ASC LIMIT 1"
    );

    res.json({
      whatsapp: resultado.rows[0]?.whatsapp || ""
    });
  } catch (error) {
    console.error("Erro ao buscar WhatsApp:", error);
    res.status(500).json({
      erro: "Erro ao buscar configuração."
    });
  }
});

router.put("/", autenticarToken, somenteAdmin, async (req, res) => {
  try {
    const { whatsapp } = req.body;

    if (!whatsapp) {
      return res.status(400).json({
        erro: "Informe o número do WhatsApp."
      });
    }

    const existente = await pool.query(
      "SELECT id FROM configuracoes ORDER BY id ASC LIMIT 1"
    );

    let resultado;

    if (existente.rows.length === 0) {
      resultado = await pool.query(
        `INSERT INTO configuracoes (whatsapp)
         VALUES ($1)
         RETURNING *`,
        [whatsapp]
      );
    } else {
      resultado = await pool.query(
        `UPDATE configuracoes
         SET whatsapp = $1
         WHERE id = $2
         RETURNING *`,
        [whatsapp, existente.rows[0].id]
      );
    }

    res.json({
      mensagem: "WhatsApp atualizado com sucesso!",
      configuracao: resultado.rows[0]
    });
  } catch (error) {
    console.error("Erro ao atualizar WhatsApp:", error);
    res.status(500).json({
      erro: "Erro ao atualizar configuração."
    });
  }
});

module.exports = router;