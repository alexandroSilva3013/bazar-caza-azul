const express = require("express");
const cors = require("cors");
require("dotenv").config();
const produtosRoutes = require("./produtos");
const usuariosRoutes = require("./usuarios");

const pool = require("./db");

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173"
}));
app.use(express.json());

app.use("/api/produtos", produtosRoutes);
app.use("/api/usuarios", usuariosRoutes);

// Rota de teste do servidor
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Backend do Bazar Solidário Casa Azul funcionando!"
  });
});

// Rota para testar a conexão com PostgreSQL
app.get("/api/db-test", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW() AS agora");

    res.json({
      status: "ok",
      message: "Conexão com PostgreSQL funcionando!",
      horarioBanco: result.rows[0].agora
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      status: "erro",
      message: "Erro ao conectar com PostgreSQL",
      error: error.message
    });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});