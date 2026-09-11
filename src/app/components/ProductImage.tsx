import { useState } from "react";
import { ImageOff } from "lucide-react";

interface ProductImageProps {
  src?: string | null;
  alt: string;
  className?: string;
}

export function ProductImage({ src, alt, className = "" }: ProductImageProps) {
  const source = src?.trim() || "";
  const [failedSource, setFailedSource] = useState<string | null>(null);

  if (!source || failedSource === source) {
    const message = source ? "Foto indisponível" : "Sem foto";
    return (
      <div role="img" aria-label={`${alt}: ${message.toLowerCase()}`} title={message}
        className={`flex flex-col items-center justify-center gap-1 bg-muted text-muted-foreground p-1 text-center ${className}`}>
        <ImageOff aria-hidden="true" className="w-1/3 max-w-8 h-auto shrink-0" />
        <span translate="no" className="text-[10px] leading-tight">{message}</span>
      </div>
    );
  }

  return <img key={source} src={source} alt={alt} className={className}
    onError={() => setFailedSource(source)} />;
}
