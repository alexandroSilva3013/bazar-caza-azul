CREATE TABLE IF NOT EXISTS conteudos_site (
    id SERIAL PRIMARY KEY,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('banner','mensagem','popup','campanha')),
    titulo VARCHAR(160) NOT NULL,
    texto TEXT NOT NULL DEFAULT '',
    imagem_url TEXT,
    link_url TEXT,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    inicio_em TIMESTAMP,
    fim_em TIMESTAMP,
    ordem INTEGER NOT NULL DEFAULT 0,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
