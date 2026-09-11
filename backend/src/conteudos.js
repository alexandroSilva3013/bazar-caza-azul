const express = require("express");
const pool = require("./db");
const autenticarToken = require("./auth");
const somenteAdmin = require("./admin");

const router = express.Router();
const TIPOS = ["banner", "mensagem", "popup", "campanha"];

function validar(body) {
  const { tipo, titulo, texto, imagem_url, link_url, ativo = true, inicio_em, fim_em } = body || {};
  if (!TIPOS.includes(tipo) || typeof titulo !== "string" || !titulo.trim() || titulo.length > 160 ||
      typeof texto !== "string" || texto.length > 2000 || (imagem_url != null && (typeof imagem_url !== "string" || imagem_url.length > 2048)) ||
      (link_url != null && (typeof link_url !== "string" || link_url.length > 2048)) || typeof ativo !== "boolean") {
    return "Informe tipo, título, texto e links válidos.";
  }
  for (const value of [imagem_url, link_url]) {
    if (!value) continue;
    try { if (!["http:", "https:"].includes(new URL(value).protocol)) return "Use links http ou https."; }
    catch { return "Informe um endereço completo e válido."; }
  }
  if (inicio_em && Number.isNaN(Date.parse(inicio_em))) return "Data inicial inválida.";
  if (fim_em && Number.isNaN(Date.parse(fim_em))) return "Data final inválida.";
  if (inicio_em && fim_em && Date.parse(fim_em) < Date.parse(inicio_em)) return "A data final deve ser posterior à inicial.";
  if (body.ordem !== undefined && (!Number.isInteger(body.ordem) || body.ordem < 0 || body.ordem > 2147483647)) return "Informe uma ordem inteira e positiva ou zero.";
  return null;
}

router.get("/", async (req, res) => {
  try {
    const { rows } = await pool.query(`SELECT id, tipo, titulo, texto, imagem_url, link_url, ativo, inicio_em, fim_em, ordem
      FROM conteudos_site WHERE ativo = TRUE AND (inicio_em IS NULL OR inicio_em <= NOW()) AND (fim_em IS NULL OR fim_em >= NOW()) ORDER BY ordem ASC, id DESC`);
    res.json(rows);
  } catch (error) { console.error("Erro ao buscar conteúdos:", error); res.status(500).json({ erro: "Erro ao buscar conteúdos." }); }
});

router.get("/admin", autenticarToken, somenteAdmin, async (req, res) => {
  try { const { rows } = await pool.query("SELECT * FROM conteudos_site ORDER BY ordem ASC, id DESC"); res.json(rows); }
  catch (error) { console.error("Erro ao buscar conteúdos:", error); res.status(500).json({ erro: "Erro ao buscar conteúdos." }); }
});

router.post("/", autenticarToken, somenteAdmin, async (req, res) => {
  const erro = validar(req.body); if (erro) return res.status(400).json({ erro });
  try {
    const b = req.body;
    const { rows } = await pool.query(`INSERT INTO conteudos_site (tipo,titulo,texto,imagem_url,link_url,ativo,inicio_em,fim_em,ordem)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`, [b.tipo,b.titulo.trim(),b.texto || "",b.imagem_url || null,b.link_url || null,b.ativo,b.inicio_em || null,b.fim_em || null,Number.isInteger(b.ordem) ? b.ordem : 0]);
    res.status(201).json({ mensagem: "Conteúdo criado com sucesso.", conteudo: rows[0] });
  } catch (error) { console.error("Erro ao criar conteúdo:", error); res.status(500).json({ erro: "Erro ao criar conteúdo." }); }
});

router.put("/:id", autenticarToken, somenteAdmin, async (req, res) => {
  if (!/^\d+$/.test(req.params.id)) return res.status(400).json({ erro: "Conteúdo inválido." });
  const erro = validar(req.body); if (erro) return res.status(400).json({ erro });
  try {
    const b = req.body;
    const { rows } = await pool.query(`UPDATE conteudos_site SET tipo=$1,titulo=$2,texto=$3,imagem_url=$4,link_url=$5,ativo=$6,inicio_em=$7,fim_em=$8,ordem=$9,atualizado_em=NOW() WHERE id=$10 RETURNING *`, [b.tipo,b.titulo.trim(),b.texto || "",b.imagem_url || null,b.link_url || null,b.ativo,b.inicio_em || null,b.fim_em || null,Number.isInteger(b.ordem) ? b.ordem : 0,Number(req.params.id)]);
    if (!rows[0]) return res.status(404).json({ erro: "Conteúdo não encontrado." });
    res.json({ mensagem: "Conteúdo atualizado com sucesso.", conteudo: rows[0] });
  } catch (error) { console.error("Erro ao atualizar conteúdo:", error); res.status(500).json({ erro: "Erro ao atualizar conteúdo." }); }
});

router.delete("/:id", autenticarToken, somenteAdmin, async (req, res) => {
  if (!/^\d+$/.test(req.params.id)) return res.status(400).json({ erro: "Conteúdo inválido." });
  try { const result = await pool.query("DELETE FROM conteudos_site WHERE id=$1", [Number(req.params.id)]); if (!result.rowCount) return res.status(404).json({ erro: "Conteúdo não encontrado." }); res.json({ mensagem: "Conteúdo removido com sucesso." }); }
  catch (error) { console.error("Erro ao remover conteúdo:", error); res.status(500).json({ erro: "Erro ao remover conteúdo." }); }
});

module.exports = router;
