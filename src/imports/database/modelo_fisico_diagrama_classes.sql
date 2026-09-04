-- ============================================================
--  MODELO FÍSICO – BANCO DE DADOS
--  Projeto: Vitrine Digital – Bazar Solidário Casa Azul
--  Banco:   PostgreSQL 14+
--  Baseado: Diagrama de Classes + Diagrama de Casos de Uso
-- ============================================================

-- ── PREPARAÇÃO ───────────────────────────────────────────────

DROP TABLE IF EXISTS relatorio_geral     CASCADE;
DROP TABLE IF EXISTS relatorio_vendas    CASCADE;
DROP TABLE IF EXISTS item                CASCADE;
DROP TABLE IF EXISTS compra              CASCADE;
DROP TABLE IF EXISTS whatsapp            CASCADE;
DROP TABLE IF EXISTS produto             CASCADE;
DROP TABLE IF EXISTS categoria           CASCADE;
DROP TABLE IF EXISTS administrador       CASCADE;
DROP TABLE IF EXISTS vendedor            CASCADE;
DROP TABLE IF EXISTS cliente             CASCADE;
DROP TABLE IF EXISTS pessoa              CASCADE;
DROP TABLE IF EXISTS endereco            CASCADE;

-- ── 1. ENDERECO ───────────────────────────────────────────────
-- Entidade independente; referenciada por PESSOA

CREATE TABLE endereco (
    id_endereco     SERIAL          PRIMARY KEY,
    logradouro      VARCHAR(200)    NOT NULL,
    numero          VARCHAR(10),
    complemento     VARCHAR(100),
    bairro          VARCHAR(100),
    cidade          VARCHAR(100)    NOT NULL,
    estado          CHAR(2)         NOT NULL,
    cep             VARCHAR(10)
);

-- ── 2. PESSOA ─────────────────────────────────────────────────
-- Superclasse: Cliente, Vendedor e Administrador herdam desta tabela

CREATE TABLE pessoa (
    id_usuario      SERIAL          PRIMARY KEY,
    nome            VARCHAR(150)    NOT NULL,
    email           VARCHAR(200)    NOT NULL UNIQUE,
    senha_hash      VARCHAR(255)    NOT NULL,
    telefone        VARCHAR(25),
    tipo_perfil     VARCHAR(20)     NOT NULL DEFAULT 'cliente'
                        CHECK (tipo_perfil IN ('cliente','vendedor','administrador')),
    id_endereco     INT             REFERENCES endereco(id_endereco) ON DELETE SET NULL,
    created_at      TIMESTAMP        DEFAULT CURRENT_TIMESTAMP
);

-- ── 3. CLIENTE ────────────────────────────────────────────────
-- Especialização de PESSOA (herança via PK/FK compartilhada)

CREATE TABLE cliente (
    id_cliente      INT             PRIMARY KEY
                        REFERENCES pessoa(id_usuario) ON DELETE CASCADE,
    data_cadastro   TIMESTAMP        DEFAULT CURRENT_TIMESTAMP
);

-- ── 4. VENDEDOR ───────────────────────────────────────────────
-- Especialização de PESSOA (herança via PK/FK compartilhada)

CREATE TABLE vendedor (
    id_vendedor     INT             PRIMARY KEY
                        REFERENCES pessoa(id_usuario) ON DELETE CASCADE,
    data_cadastro   TIMESTAMP        DEFAULT CURRENT_TIMESTAMP
);

-- ── 5. ADMINISTRADOR ──────────────────────────────────────────
-- Especialização de PESSOA (herança via PK/FK compartilhada)

CREATE TABLE administrador (
    id_admin        INT             PRIMARY KEY
                        REFERENCES pessoa(id_usuario) ON DELETE CASCADE,
    data_acesso     TIMESTAMP        DEFAULT CURRENT_TIMESTAMP
);

-- ── 6. CATEGORIA ──────────────────────────────────────────────
-- Classificação dos produtos; gerenciada pelo Administrador

CREATE TABLE categoria (
    id_categoria        SERIAL          PRIMARY KEY,
    nome_categoria      VARCHAR(80)     NOT NULL UNIQUE,
    descricao_categoria TEXT,
    created_at          TIMESTAMP        DEFAULT CURRENT_TIMESTAMP
);

-- Categorias iniciais
INSERT INTO categoria (nome_categoria, descricao_categoria) VALUES
    ('Feminino',   'Roupas e acessórios femininos'),
    ('Masculino',  'Roupas e acessórios masculinos'),
    ('Infantil',   'Roupas e itens infantis'),
    ('Calçados',   'Calçados em geral'),
    ('Livros',     'Livros e materiais de leitura'),
    ('Brinquedos', 'Brinquedos e jogos'),
    ('Acessórios', 'Bolsas, cintos, bijuterias e acessórios em geral');

-- ── 7. PRODUTO ────────────────────────────────────────────────
-- Catálogo digital; relacionado a CATEGORIA e VENDEDOR

CREATE TABLE produto (
    id_produto      SERIAL              PRIMARY KEY,
    nome            VARCHAR(150)        NOT NULL,
    descricao       TEXT,
    preco           DECIMAL(10,2)       NOT NULL CHECK (preco >= 0),
    estado          VARCHAR(100),
    foto            VARCHAR(255),
    status          VARCHAR(30)         NOT NULL DEFAULT 'disponivel'
                        CHECK (status IN ('disponivel','reservado','vendido','indisponivel')),
    id_categoria    INT                 NOT NULL
                        REFERENCES categoria(id_categoria) ON DELETE RESTRICT,
    id_vendedor     INT
                        REFERENCES vendedor(id_vendedor) ON DELETE SET NULL,
    created_at      TIMESTAMP            DEFAULT CURRENT_TIMESTAMP
);

-- ── 8. WHATSAPP ───────────────────────────────────────────────
-- Sistema externo de comunicação; NÃO é usuário do sistema

CREATE TABLE whatsapp (
    id_whatsapp         SERIAL          PRIMARY KEY,
    numero              VARCHAR(25)     NOT NULL,
    mensagem_padrao     TEXT
);

-- Configuração padrão
INSERT INTO whatsapp (numero, mensagem_padrao) VALUES
    ('5511987654321',
     'Olá, Casa Azul! Gostaria de confirmar minha compra/reserva. Cliente: {nome} Telefone: {telefone} Produtos: {lista} Valor total: {total} Aguardo confirmação.');

-- ── 9. COMPRA ─────────────────────────────────────────────────
-- Pedido finalizado; pertence a um CLIENTE; notifica via WHATSAPP

CREATE TABLE compra (
    id_compra       SERIAL          PRIMARY KEY,
    data_compra     TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    valor_total     DECIMAL(10,2)   NOT NULL DEFAULT 0 CHECK (valor_total >= 0),
    status          VARCHAR(30)     NOT NULL DEFAULT 'Pendente'
                        CHECK (status IN ('Pendente','Reservada','Confirmada','Finalizada','Cancelada')),
    id_cliente      INT             NOT NULL
                        REFERENCES cliente(id_cliente) ON DELETE RESTRICT,
    id_whatsapp     INT
                        REFERENCES whatsapp(id_whatsapp) ON DELETE SET NULL
);

-- ── 10. ITEM ──────────────────────────────────────────────────
-- Linha de produto dentro de uma COMPRA
-- subtotal = quantidade × valor_unit (calculado via trigger ou aplicação)

CREATE TABLE item (
    id_item         SERIAL              PRIMARY KEY,
    quantidade      INT                 NOT NULL DEFAULT 1 CHECK (quantidade >= 1),
    valor_unit      DECIMAL(10,2)       NOT NULL CHECK (valor_unit >= 0),
    subtotal        DECIMAL(10,2)       NOT NULL,   -- quantidade × valor_unit
    id_compra       INT                 NOT NULL
                        REFERENCES compra(id_compra) ON DELETE CASCADE,
    id_produto      INT                 NOT NULL
                        REFERENCES produto(id_produto) ON DELETE RESTRICT,
    UNIQUE (id_compra, id_produto)
);

-- ── 11. RELATORIO_VENDAS ──────────────────────────────────────
-- Gerado pelo ADMINISTRADOR; registra dados de vendas

CREATE TABLE relatorio_vendas (
    id_relatorio_vendas     SERIAL          PRIMARY KEY,
    data_geracao            TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    tipo                    VARCHAR(50)     NOT NULL DEFAULT 'Vendas',
    id_admin                INT             NOT NULL
                                REFERENCES administrador(id_admin) ON DELETE RESTRICT
);

-- ── 12. RELATORIO_GERAL ───────────────────────────────────────
-- Gerado pelo ADMINISTRADOR; visão geral do sistema

CREATE TABLE relatorio_geral (
    id_relatorio_geral      SERIAL          PRIMARY KEY,
    data_geracao            TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    tipo                    VARCHAR(50)     NOT NULL DEFAULT 'Geral',
    id_admin                INT             NOT NULL
                                REFERENCES administrador(id_admin) ON DELETE RESTRICT
);

-- ── ÍNDICES ───────────────────────────────────────────────────

CREATE INDEX idx_pessoa_email        ON pessoa(email);
CREATE INDEX idx_pessoa_tipo         ON pessoa(tipo_perfil);
CREATE INDEX idx_produto_status      ON produto(status);
CREATE INDEX idx_produto_categoria   ON produto(id_categoria);
CREATE INDEX idx_produto_vendedor    ON produto(id_vendedor);
CREATE INDEX idx_compra_cliente      ON compra(id_cliente);
CREATE INDEX idx_compra_status       ON compra(status);
CREATE INDEX idx_item_compra         ON item(id_compra);
CREATE INDEX idx_item_produto        ON item(id_produto);

-- ── TRIGGER: subtotal automático ─────────────────────────────

CREATE OR REPLACE FUNCTION fn_calc_subtotal()
RETURNS TRIGGER AS $$
BEGIN
    NEW.subtotal := NEW.quantidade * NEW.valor_unit;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_item_subtotal
    BEFORE INSERT OR UPDATE OF quantidade, valor_unit ON item
    FOR EACH ROW EXECUTE FUNCTION fn_calc_subtotal();

-- ── TRIGGER: valor_total da compra ────────────────────────────

CREATE OR REPLACE FUNCTION fn_update_compra_total()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE compra
       SET valor_total = (
           SELECT COALESCE(SUM(subtotal), 0)
             FROM item
            WHERE id_compra = COALESCE(NEW.id_compra, OLD.id_compra)
       )
     WHERE id_compra = COALESCE(NEW.id_compra, OLD.id_compra);
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_compra_total
    AFTER INSERT OR UPDATE OR DELETE ON item
    FOR EACH ROW EXECUTE FUNCTION fn_update_compra_total();

-- ── DADOS DE EXEMPLO ─────────────────────────────────────────

-- Endereços
INSERT INTO endereco (logradouro, numero, bairro, cidade, estado, cep) VALUES
    ('Rua das Flores',    '456', 'Centro',        'São Paulo', 'SP', '01234-567'),
    ('Av. Paulista',      '1000','Bela Vista',     'São Paulo', 'SP', '01310-100'),
    ('Rua Augusta',       '200', 'Consolação',     'São Paulo', 'SP', '01305-000'),
    ('Alameda Santos',    '50',  'Jardins',        'São Paulo', 'SP', '01419-001'),
    ('Rua Oscar Freire',  '10',  'Cerqueira César','São Paulo', 'SP', '01426-001');

-- Pessoas
INSERT INTO pessoa (nome, email, senha_hash, telefone, tipo_perfil, id_endereco) VALUES
    ('Maria Silva',     'maria@email.com',     '$2b$12$HASH_MARIA',    '(11) 98765-4321', 'cliente',        1),
    ('João Santos',     'joao@email.com',      '$2b$12$HASH_JOAO',     '(11) 91234-5678', 'cliente',        2),
    ('Ana Paula Costa', 'ana.paula@email.com', '$2b$12$HASH_ANA',      '(11) 99876-5432', 'vendedor',       3),
    ('Carlos Oliveira', 'carlos@email.com',    '$2b$12$HASH_CARLOS',   '(11) 97654-3210', 'cliente',        4),
    ('Admin Casa Azul', 'vitrinevirtual2k26@gmail.com','$2b$12$HASH_ADMIN','(11) 00000-0000','administrador',5);

-- Especializações
INSERT INTO cliente     (id_cliente)  VALUES (1), (2), (4);
INSERT INTO vendedor    (id_vendedor) VALUES (3);
INSERT INTO administrador(id_admin)  VALUES (5);

-- Produtos
INSERT INTO produto (nome, descricao, preco, estado, foto, status, id_categoria, id_vendedor) VALUES
    ('Vestido Floral Feminino',   'Vestido floral em tecido leve.',         35.00, 'Seminovo - Ótimo',       'foto1.jpg', 'disponivel',   1, 3),
    ('Camisa Social Masculina',   'Camisa azul claro para trabalho.',       28.00, 'Seminovo - Excelente',   'foto2.jpg', 'disponivel',   2, 3),
    ('Conjunto Infantil Colorido','Blusa e calça, tamanho 6 anos.',         25.00, 'Novo com etiqueta',      'foto3.jpg', 'reservado',    3, 3),
    ('Tênis Esportivo Nike',      'Tênis Nike, numeração 40.',              65.00, 'Seminovo - Pouco uso',   'foto4.jpg', 'disponivel',   4, 3),
    ('O Pequeno Príncipe',        'Livro clássico em ótimo estado.',        15.00, 'Seminovo - Muito bom',   'foto5.jpg', 'disponivel',   5, 3),
    ('Quebra-cabeça 500 Peças',   'Completo com todas as peças.',           20.00, 'Seminovo - Completo',    'foto6.jpg', 'disponivel',   6, 3),
    ('Bolsa Feminina Couro',      'Bolsa de couro sintético.',              40.00, 'Seminovo - Ótimo',       'foto7.jpg', 'disponivel',   7, 3),
    ('Jaqueta Jeans Feminina',    'Jaqueta versátil para diversas ocasiões.',45.00,'Seminovo - Bom estado',  'foto8.jpg', 'disponivel',   1, 3);

-- Compras de exemplo
INSERT INTO compra (data_compra, status, id_cliente, id_whatsapp) VALUES
    ('2024-01-10 14:30:00', 'Confirmada', 1, 1),
    ('2024-01-05 10:00:00', 'Finalizada', 1, 1);

INSERT INTO item (quantidade, valor_unit, subtotal, id_compra, id_produto) VALUES
    (1, 35.00, 35.00, 1, 1),
    (1, 15.00, 15.00, 1, 5),
    (1, 40.00, 40.00, 2, 7);

-- Relatórios de exemplo
INSERT INTO relatorio_vendas (tipo, id_admin) VALUES ('Vendas Mensais', 5);
INSERT INTO relatorio_geral  (tipo, id_admin) VALUES ('Resumo Geral',   5);

-- ============================================================
--  RESUMO DAS TABELAS
-- ============================================================
--
--  ENDERECO          (id_endereco PK)
--  PESSOA            (id_usuario PK | id_endereco FK)
--  CLIENTE           (id_cliente PK/FK → PESSOA)
--  VENDEDOR          (id_vendedor PK/FK → PESSOA)
--  ADMINISTRADOR     (id_admin PK/FK → PESSOA)
--  CATEGORIA         (id_categoria PK)
--  PRODUTO           (id_produto PK | id_categoria FK | id_vendedor FK)
--  WHATSAPP          (id_whatsapp PK)
--  COMPRA            (id_compra PK | id_cliente FK | id_whatsapp FK)
--  ITEM              (id_item PK | id_compra FK | id_produto FK)
--  RELATORIO_VENDAS  (id_relatorio_vendas PK | id_admin FK)
--  RELATORIO_GERAL   (id_relatorio_geral PK | id_admin FK)
--
-- ============================================================
