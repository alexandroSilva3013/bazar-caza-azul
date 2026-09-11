const express = require("express");
const cors = require("cors");
require("dotenv").config();
const produtosRoutes = require("./produtos");
const usuariosRoutes = require("./usuarios");
const configuracoesRouter = require("./configuracoes");
const conteudosRouter = require("./conteudos");
const vendasRoutes = require("./vendas");
const pool = require("./db");

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173"
}));
app.disable("x-powered-by");
app.use("/api/produtos", express.json({ limit: "3mb" }));
app.use(express.json());
app.use((req, res, next) => {
  if (["POST", "PUT", "PATCH"].includes(req.method) && (!req.body || typeof req.body !== "object" || Array.isArray(req.body))) {
    return res.status(400).json({ erro: "Envie um objeto JSON válido." });
  }
  res.setHeader("X-Content-Type-Options", "nosniff");
  next();
});
app.use("/api/configuracoes", configuracoesRouter);
app.use("/api/conteudos", conteudosRouter);

app.use("/api/produtos", produtosRoutes);
app.use("/api/usuarios", usuariosRoutes);
app.use("/api/vendas", vendasRoutes);

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
      message: "Erro ao conectar com PostgreSQL"
    });
  }
});

app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);
  const status = error.type === "entity.too.large" ? 413 : error.type === "entity.parse.failed" ? 400 : 500;
  res.status(status).json({ erro: status === 413 ? "Dados enviados excedem o limite permitido." : status === 400 ? "JSON inválido." : "Erro interno do servidor." });
});

// Iniciar servidor
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
  });
}
module.exports = app;
