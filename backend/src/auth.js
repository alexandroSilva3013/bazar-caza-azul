const jwt = require("jsonwebtoken");

function autenticarToken(req, res, next) {
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

    req.usuario = usuario;
    next();

  } catch (error) {
    return res.status(401).json({
      erro: "Token inválido ou expirado."
    });
  }
}

module.exports = autenticarToken;