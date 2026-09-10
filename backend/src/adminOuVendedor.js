function adminOuVendedor(req, res, next) {
  if (
    !req.usuario ||
    !["admin", "vendedor"].includes(req.usuario.tipo)
  ) {
    return res.status(403).json({
      erro: "Acesso permitido somente para administradores ou vendedores."
    });
  }

  next();
}

module.exports = adminOuVendedor;