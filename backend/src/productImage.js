function validProductImage(value) {
  if (value == null || value === "") return true;
  if (typeof value !== "string") return false;
  if (value.startsWith("data:")) {
    if (value.length > 700000 || !/^data:image\/jpeg;base64,[A-Za-z0-9+/]+={0,2}$/.test(value)) return false;
    const bytes = Buffer.from(value.slice(value.indexOf(",") + 1), "base64");
    return bytes.length >= 4 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[bytes.length - 2] === 0xff && bytes[bytes.length - 1] === 0xd9;
  }
  if (value.length > 2048) return false;
  try { return ["http:", "https:"].includes(new URL(value).protocol); }
  catch { return false; }
}
module.exports = validProductImage;
