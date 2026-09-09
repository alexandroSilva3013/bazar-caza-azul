const express = require("express");
const bcrypt = require("bcrypt");
const pool = require("./db");
const jwt = require("jsonwebtoken");
const autenticarToken = require("./auth");
const somenteAdmin = require("./admin");

const router = express.Router();

// CADASTRAR USUÁRIO
router.post("/", async (req, res) => {
  try {
    const { nome, email, senha } = req.body;
const tipo = "usuario";

    if (!nome || !email || !senha) {
      return res.status(400).json({
        erro: "Nome, e-mail e senha são obrigatórios."
      });
    }

    // Verificar se o e-mail já está cadastrado
    const usuarioExistente = await pool.query(
      "SELECT id FROM usuarios WHERE email = $1",
      [email]
    );

    if (usuarioExistente.rows.length > 0) {
      return res.status(409).json({
        erro: "Este e-mail já está cadastrado."
      });
    }

    // Proteger a senha antes de salvar
    const senhaCriptografada = await bcrypt.hash(senha, 10);

    const resultado = await pool.query(
      `INSERT INTO usuarios
       (nome, email, senha, tipo)
       VALUES ($1, $2, $3, $4)
       RETURNING id, nome, email, tipo, criado_em`,
      [
        nome,
        email,
        senhaCriptografada,
        tipo || "usuario"
      ]
    );

    res.status(201).json({
      mensagem: "Usuário cadastrado com sucesso!",
      usuario: resultado.rows[0]
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      erro: "Erro ao cadastrar usuário."
    });
  }
});

// LISTAR USUÁRIOS
router.get("/", autenticarToken, somenteAdmin, async (req, res) => {
  try {
    const resultado = await pool.query(
      `SELECT id, nome, email, tipo, criado_em
       FROM usuarios
       ORDER BY id DESC`
    );

    res.json(resultado.rows);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      erro: "Erro ao buscar usuários."
    });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({
        erro: "E-mail e senha são obrigatórios."
      });
    }

    const resultado = await pool.query(
      "SELECT * FROM usuarios WHERE email = $1",
      [email]
    );

    if (resultado.rows.length === 0) {
      return res.status(401).json({
        erro: "E-mail ou senha inválidos."
      });
    }

    const usuario = resultado.rows[0];

    const senhaCorreta = await bcrypt.compare(
      senha,
      usuario.senha
    );

    if (!senhaCorreta) {
      return res.status(401).json({
        erro: "E-mail ou senha inválidos."
      });
    }

    const token = jwt.sign(
      {
        id: usuario.id,
        email: usuario.email,
        tipo: usuario.tipo
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "8h"
      }
    );

    res.json({
      mensagem: "Login realizado com sucesso!",
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        tipo: usuario.tipo
      },
      token
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      erro: "Erro ao realizar login."
    });
  }
});

// PERFIL DO USUÁRIO LOGADO
router.get("/perfil", autenticarToken, async (req, res) => {
  try {
    const resultado = await pool.query(
      `SELECT id, nome, email, tipo, criado_em
       FROM usuarios
       WHERE id = $1`,
      [req.usuario.id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        erro: "Usuário não encontrado."
      });
    }

    res.json({
      usuario: resultado.rows[0]
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      erro: "Erro ao buscar perfil."
    });
  }
});

module.exports = router;