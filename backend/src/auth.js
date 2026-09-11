const jwt = require("jsonwebtoken");
const pool = require("./db");

async function autenticarToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      erro: "Token não informado."
    });
  }

  const partes = authHeader.split(" ");

  if (partes.length !== 2 || partes[0] !== "Bearer") {
    return res.status(401).json({
      erro: "Token inválido."
    });
  }

  const token = partes[1];

  try {
    const usuario = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    if (!Number.isSafeInteger(Number(usuario.id)) || Number(usuario.id) <= 0) return res.status(401).json({ erro: "Sessão inválida." });
    const atual = await pool.query("SELECT id, email, tipo FROM usuarios WHERE id = $1", [usuario.id]);
    if (!atual.rows.length) return res.status(401).json({ erro: "Sessão inválida." });
    req.usuario = atual.rows[0];
    next();

  } catch (error) {
    return res.status(401).json({
      erro: "Token inválido ou expirado."
    });
  }
}

module.exports = autenticarToken;