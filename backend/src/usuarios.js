const express = require("express");
const bcrypt = require("bcrypt");
const pool = require("./db");
const jwt = require("jsonwebtoken");
const autenticarToken = require("./auth");
const somenteAdmin = require("./admin");

const router = express.Router();
router.param("id", (req, res, next, id) => {
  if (!/^[1-9]\d*$/.test(id) || !Number.isSafeInteger(Number(id))) return res.status(400).json({ erro: "Usuário inválido." });
  next();
});
function validarCadastroAdmin(req, res, next) {
  const { nome, email, senha } = req.body || {};
  if (typeof nome !== "string" || !nome.trim() || nome.length > 120 ||
      typeof email !== "string" || email.length > 150 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      (req.method === "POST" && (typeof senha !== "string" || senha.length < 6 || Buffer.byteLength(senha, "utf8") > 72))) {
    return res.status(400).json({ erro: "Informe nome e e-mail válidos e senha de 6 caracteres a 72 bytes." });
  }
  req.body.nome = nome.trim();
  next();
}

// CADASTRAR USUÁRIO
router.post("/", async (req, res) => {
  try {
    const { senha } = req.body;
    const nome = typeof req.body.nome === "string" ? req.body.nome.trim() : "";
    const email = typeof req.body.email === "string" ? req.body.email.trim() : "";
    const telefone = typeof req.body.telefone === "string" ? req.body.telefone.trim() : "";
    const digitosTelefone = telefone.replace(/\D/g, "");
    if (!/^[+\d\s().-]+$/.test(telefone) || telefone.length > 30 || digitosTelefone.length < 10 || digitosTelefone.length > 15) {
      return res.status(400).json({ erro: "Informe telefone com DDD (10 a 15 dígitos)." });
    }
    const tipo = "usuario";

    if (!nome || !email || typeof senha !== "string" || !senha) {
      return res.status(400).json({
        erro: "Nome, e-mail e senha são obrigatórios."
      });
    }

    if (nome.length > 120 || email.length > 150 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || senha.length < 6 || Buffer.byteLength(senha, "utf8") > 72) {
      return res.status(400).json({ erro: "Informe nome válido, e-mail válido e senha com pelo menos 6 caracteres e no máximo 72 bytes." });
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
       (nome, email, senha, tipo, telefone)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, nome, email, telefone, tipo, criado_em`,
      [
        nome,
        email,
        senhaCriptografada,
        tipo || "usuario",
        telefone
      ]
    );

    res.status(201).json({
      mensagem: "Usuário cadastrado com sucesso!",
      usuario: resultado.rows[0]
    });

  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({ erro: "Este e-mail já está cadastrado." });
    }
    console.error(error);

    res.status(500).json({
      erro: "Erro ao cadastrar usuário."
    });
  }
});

// LISTAR USUÁRIOS

// CADASTRAR USUÁRIO PELO ADMIN
router.post("/admin", autenticarToken, somenteAdmin, validarCadastroAdmin, async (req, res) => {
  try {
    const { nome, email, senha, tipo } = req.body;

    if (!nome || !email || !senha || !tipo) {
      return res.status(400).json({
        erro: "Nome, e-mail, senha e tipo são obrigatórios."
      });
    }

    const tiposPermitidos = ["usuario", "vendedor", "admin"];

    if (!tiposPermitidos.includes(tipo)) {
      return res.status(400).json({
        erro: "Tipo de usuário inválido."
      });
    }

    const usuarioExistente = await pool.query(
      "SELECT id FROM usuarios WHERE email = $1",
      [email]
    );

    if (usuarioExistente.rows.length > 0) {
      return res.status(409).json({
        erro: "Este e-mail já está cadastrado."
      });
    }

    const senhaCriptografada = await bcrypt.hash(senha, 10);

    const resultado = await pool.query(
      `INSERT INTO usuarios
       (nome, email, senha, tipo)
       VALUES ($1, $2, $3, $4)
       RETURNING id, nome, email, telefone, tipo, criado_em`,
      [nome, email, senhaCriptografada, tipo]
    );

    res.status(201).json({
      mensagem: "Usuário cadastrado com sucesso!",
      usuario: resultado.rows[0]
    });

  } catch (error) {
    if (error.code === "23505") return res.status(409).json({ erro: "Este e-mail já está cadastrado." });
    console.error(error);

    res.status(500).json({
      erro: "Erro ao cadastrar usuário."
    });
  }
});

router.get("/", autenticarToken, somenteAdmin, async (req, res) => {
  try {
    const resultado = await pool.query(
      `SELECT id, nome, email, telefone, tipo, criado_em
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

    if (typeof email !== "string" || typeof senha !== "string" || !email || !senha || email.length > 150 || Buffer.byteLength(senha, "utf8") > 72) {
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
        telefone: usuario.telefone,
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
      `SELECT id, nome, email, telefone, tipo, criado_em
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

// EXCLUIR USUÁRIO - SOMENTE ADMIN
router.delete("/:id", autenticarToken, somenteAdmin, async (req, res) => {
  try {
    const { id } = req.params;

       if (Number(id) === Number(req.usuario.id)) {
          return res.status(400).json({
           erro: "Você não pode excluir sua própria conta."
          });
        }
    const usuario = await pool.query(
      "SELECT id, tipo FROM usuarios WHERE id = $1",
      [id]
    );

    if (usuario.rows.length === 0) {
      return res.status(404).json({
        erro: "Usuário não encontrado."
      });
    }

    await pool.query(
      "DELETE FROM usuarios WHERE id = $1",
      [id]
    );

    res.json({
      mensagem: "Usuário excluído com sucesso."
    });

  } catch (error) {
    if (error.code === "23503") return res.status(409).json({ erro: "Este usuário possui vendas vinculadas e não pode ser excluído." });
    console.error("Erro ao excluir usuário:", error);

    res.status(500).json({
      erro: "Erro ao excluir usuário."
    });
  }
});

// EDITAR USUÁRIO - SOMENTE ADMIN
router.put("/:id", autenticarToken, somenteAdmin, validarCadastroAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, email, tipo } = req.body;
    if (Number(id) === Number(req.usuario.id) && tipo !== "admin") return res.status(409).json({ erro: "Você não pode remover seu próprio acesso de administrador." });

    if (!nome || !email || !tipo) {
      return res.status(400).json({
        erro: "Nome, e-mail e tipo são obrigatórios."
      });
    }

    const tiposPermitidos = ["usuario", "vendedor", "admin"];

    if (!tiposPermitidos.includes(tipo)) {
      return res.status(400).json({
        erro: "Tipo de usuário inválido."
      });
    }

    const usuario = await pool.query(
      "SELECT id FROM usuarios WHERE id = $1",
      [id]
    );

    if (usuario.rows.length === 0) {
      return res.status(404).json({
        erro: "Usuário não encontrado."
      });
    }

    const emailExistente = await pool.query(
      "SELECT id FROM usuarios WHERE email = $1 AND id <> $2",
      [email, id]
    );

    if (emailExistente.rows.length > 0) {
      return res.status(409).json({
        erro: "Este e-mail já está sendo usado por outro usuário."
      });
    }

    const resultado = await pool.query(
      `UPDATE usuarios
       SET nome = $1, email = $2, tipo = $3
       WHERE id = $4
       RETURNING id, nome, email, telefone, tipo, criado_em`,
      [nome, email, tipo, id]
    );

    res.json({
      mensagem: "Usuário atualizado com sucesso.",
      usuario: resultado.rows[0]
    });

  } catch (error) {
    if (error.code === "23505") return res.status(409).json({ erro: "Este e-mail já está cadastrado." });
    console.error("Erro ao editar usuário:", error);

    res.status(500).json({
      erro: "Erro ao editar usuário."
    });
  }
});


module.exports = router;
