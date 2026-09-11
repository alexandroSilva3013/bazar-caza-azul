import { useRef, useState } from "react";
import { ProductImage } from "./ProductImage";

// Re-encode locally to keep phone photos small and remove photo metadata.
async function preparePhoto(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("Escolha um arquivo de imagem.");
  if (file.size > 20 * 1024 * 1024) throw new Error("Escolha uma foto de até 20 MB.");
  const objectUrl = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = objectUrl;
    await image.decode();
    const scale = Math.min(1, 1200 / Math.max(image.naturalWidth, image.naturalHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Não foi possível preparar a foto.");
    context.fillStyle = "white";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    for (const quality of [0.85, 0.7, 0.55, 0.4]) {
      const photo = canvas.toDataURL("image/jpeg", quality);
      if (photo.length <= 700000) return photo;
    }
    throw new Error("Esta foto é muito detalhada. Escolha uma foto menor.");
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export function ProductPhotoPicker({ value, onChange, onBusyChange }: {
  value: string;
  onChange: (photo: string) => void;
  onBusyChange: (busy: boolean) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const processing = useRef(false);
  async function selectPhoto(file?: File) {
    if (!file || processing.current) return;
    processing.current = true;
    setBusy(true); onBusyChange(true); setError("");
    try { onChange(await preparePhoto(file)); }
    catch (error) {
      setError(error instanceof Error && error.name !== "EncodingError" ? error.message : "Não foi possível abrir essa foto. Tente uma imagem JPG, PNG ou WebP.");
    } finally { processing.current = false; setBusy(false); onBusyChange(false); }
  }
  return <div className="space-y-3">
    <label htmlFor="product-photo-file" className="block font-medium">Foto do produto</label>
    <input id="product-photo-file" type="file" accept="image/*" disabled={busy}
      className="block w-full min-w-0 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-primary file:px-4 file:py-3 file:text-white"
      onChange={event => { const file = event.target.files?.[0]; event.target.value = ""; void selectPhoto(file); }} />
    <label className="inline-flex items-center justify-center rounded-xl border border-primary px-4 py-3 text-primary cursor-pointer">
      Tirar foto no celular
      <input type="file" accept="image/*" capture="environment" disabled={busy} className="sr-only"
        onChange={event => { const file = event.target.files?.[0]; event.target.value = ""; void selectPhoto(file); }} />
    </label>
    <p className="text-sm text-muted-foreground">Escolha uma foto do computador ou da galeria do celular. A foto será salva junto com o produto.</p>
    {busy && <p role="status">Preparando foto...</p>}
    {error && <p role="alert" className="text-destructive">{error}</p>}
    <div className="h-32 w-32 overflow-hidden rounded-xl bg-muted"><ProductImage src={value} alt="Prévia do produto" className="w-full h-full object-cover" /></div>
    {value && <button type="button" disabled={busy} onClick={() => onChange("")} className="text-sm text-destructive underline">Remover foto</button>}
    <details>
      <summary className="cursor-pointer text-sm text-muted-foreground">Usar um link de foto</summary>
      <label htmlFor="product-image-url" className="sr-only">Link da foto</label>
      <input id="product-image-url" type="url" disabled={busy} value={value.startsWith("data:") ? "" : value}
        onChange={event => { setError(""); onChange(event.target.value); }} placeholder="https://..."
        className="mt-2 w-full px-4 py-3 bg-muted rounded-xl border border-border" />
    </details>
  </div>;
}
