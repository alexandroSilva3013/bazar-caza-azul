CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(120) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    telefone VARCHAR(30),
    trocar_senha BOOLEAN NOT NULL DEFAULT FALSE,
    versao_sessao INTEGER NOT NULL DEFAULT 0,
    tipo VARCHAR(30) DEFAULT 'usuario',
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS produtos (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    descricao TEXT,
    categoria VARCHAR(100),
    preco NUMERIC(10,2) NOT NULL,
    quantidade INTEGER DEFAULT 1,
    status VARCHAR(30) DEFAULT 'disponivel',
    condicao VARCHAR(150),
    imagem TEXT,
    imagens TEXT[] NOT NULL DEFAULT '{}',
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS doacoes (
    id SERIAL PRIMARY KEY,
    nome_doador VARCHAR(150),
    telefone VARCHAR(30),
    descricao TEXT,
    data_doacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS vendas (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id),
    valor_total NUMERIC(10,2) NOT NULL,
    forma_pagamento VARCHAR(50),
    data_venda TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    origem VARCHAR(10) NOT NULL DEFAULT 'compra' CHECK (origem IN ('compra', 'reserva')),
    status VARCHAR(30) DEFAULT 'Pendente'
);

CREATE TABLE IF NOT EXISTS itens_venda (
    id SERIAL PRIMARY KEY,
    venda_id INTEGER REFERENCES vendas(id) ON DELETE CASCADE,
    produto_id INTEGER REFERENCES produtos(id),
    quantidade INTEGER NOT NULL,
    preco_unitario NUMERIC(10,2) NOT NULL
);

CREATE TABLE IF NOT EXISTS configuracoes (
    id SERIAL PRIMARY KEY,
    whatsapp VARCHAR(20)
);

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
