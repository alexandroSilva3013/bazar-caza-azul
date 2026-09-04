-- ============================================================
--  MODELO FÍSICO – BAZAR SOLIDÁRIO CASA AZUL
--  Banco de Dados: PostgreSQL (compatível com MySQL / SQLite)
--  Gerado a partir do protótipo React – App.tsx
-- ============================================================

-- ── 0. CONFIGURAÇÕES INICIAIS ───────────────────────────────

-- DROP ORDER (respeitar FK)
DROP TABLE IF EXISTS order_items        CASCADE;
DROP TABLE IF EXISTS orders             CASCADE;
DROP TABLE IF EXISTS reservations       CASCADE;
DROP TABLE IF EXISTS product_images     CASCADE;
DROP TABLE IF EXISTS products           CASCADE;
DROP TABLE IF EXISTS categories         CASCADE;
DROP TABLE IF EXISTS users              CASCADE;
DROP TABLE IF EXISTS admins             CASCADE;

-- ── 1. CATEGORIAS ───────────────────────────────────────────

CREATE TABLE categories (
    id          SERIAL          PRIMARY KEY,
    name        VARCHAR(60)     NOT NULL UNIQUE,
    created_at  TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP       NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE categories IS 'Categorias dos produtos do bazar';

INSERT INTO categories (name) VALUES
    ('Feminino'),
    ('Masculino'),
    ('Infantil'),
    ('Calçados'),
    ('Livros'),
    ('Brinquedos'),
    ('Acessórios');

-- ── 2. PRODUTOS ─────────────────────────────────────────────

CREATE TABLE products (
    id              SERIAL          PRIMARY KEY,
    name            VARCHAR(150)    NOT NULL,
    category_id     INT             NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    description     TEXT,
    condition       VARCHAR(100),   -- estado de conservação
    price           NUMERIC(10,2)   NOT NULL CHECK (price >= 0),
    status          VARCHAR(20)     NOT NULL DEFAULT 'available'
                        CHECK (status IN ('available','reserved','sold','unavailable')),
    image_url       TEXT,
    created_at      TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP       NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  products           IS 'Produtos disponíveis no bazar';
COMMENT ON COLUMN products.status    IS 'available | reserved | sold | unavailable';
COMMENT ON COLUMN products.condition IS 'Ex: Seminovo - Ótimo estado';

-- Imagens adicionais de um produto (galeria)
CREATE TABLE product_images (
    id          SERIAL  PRIMARY KEY,
    product_id  INT     NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    url         TEXT    NOT NULL,
    sort_order  SMALLINT NOT NULL DEFAULT 0
);

-- ── 3. USUÁRIOS ─────────────────────────────────────────────

CREATE TABLE users (
    id              SERIAL          PRIMARY KEY,
    name            VARCHAR(150)    NOT NULL,
    birth_date      DATE,
    email           VARCHAR(200)    NOT NULL UNIQUE,
    phone           VARCHAR(25),
    address         VARCHAR(200),
    city            VARCHAR(100),
    state           CHAR(2),        -- UF (SP, RJ, MG …)
    cep             VARCHAR(10),
    password_hash   VARCHAR(255)    NOT NULL,
    status          VARCHAR(10)     NOT NULL DEFAULT 'Ativo'
                        CHECK (status IN ('Ativo','Inativo')),
    created_at      TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP       NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  users              IS 'Clientes cadastrados no sistema';
COMMENT ON COLUMN users.password_hash IS 'Armazenar apenas hash (bcrypt/argon2), nunca senha em texto';

-- ── 4. ADMINISTRADORES ──────────────────────────────────────

CREATE TABLE admins (
    id              SERIAL          PRIMARY KEY,
    name            VARCHAR(150)    NOT NULL,
    email           VARCHAR(200)    NOT NULL UNIQUE,
    password_hash   VARCHAR(255)    NOT NULL,
    created_at      TIMESTAMP       NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE admins IS 'Usuários administrativos (acesso ao painel)';

-- Seed do admin demo
INSERT INTO admins (name, email, password_hash) VALUES
    ('Admin Casa Azul', 'vitrinevirtual2k26@gmail.com',
     '$2b$12$HASH_DO_BCRYPT_DA_SENHA_12345678');   -- substituir pelo hash real

-- ── 5. PEDIDOS (CARRINHO FINALIZADO) ────────────────────────

CREATE TABLE orders (
    id          SERIAL          PRIMARY KEY,
    user_id     INT             NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    total       NUMERIC(10,2)   NOT NULL CHECK (total >= 0),
    status      VARCHAR(20)     NOT NULL DEFAULT 'Pendente'
                    CHECK (status IN ('Pendente','Reservada','Confirmada','Finalizada','Cancelada')),
    notes       TEXT,                          -- observações do administrador
    ordered_at  TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP       NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  orders        IS 'Pedidos gerados ao finalizar o carrinho';
COMMENT ON COLUMN orders.status IS 'Pendente | Reservada | Confirmada | Finalizada | Cancelada';

-- ── 6. ITENS DO PEDIDO ──────────────────────────────────────

CREATE TABLE order_items (
    id          SERIAL          PRIMARY KEY,
    order_id    INT             NOT NULL REFERENCES orders(id)   ON DELETE CASCADE,
    product_id  INT             NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    quantity    SMALLINT        NOT NULL DEFAULT 1 CHECK (quantity >= 1),
    unit_price  NUMERIC(10,2)   NOT NULL,   -- snapshot do preço no momento da compra
    UNIQUE (order_id, product_id)
);

COMMENT ON TABLE  order_items           IS 'Produtos de cada pedido (snapshot de preço)';
COMMENT ON COLUMN order_items.unit_price IS 'Preço unitário no momento do pedido (imutável)';

-- ── 7. RESERVAS AVULSAS ─────────────────────────────────────

CREATE TABLE reservations (
    id          SERIAL      PRIMARY KEY,
    user_id     INT         NOT NULL REFERENCES users(id)     ON DELETE RESTRICT,
    product_id  INT         NOT NULL REFERENCES products(id)  ON DELETE RESTRICT,
    status      VARCHAR(30) NOT NULL DEFAULT 'Aguardando Confirmação'
                    CHECK (status IN (
                        'Aguardando Confirmação',
                        'Confirmada',
                        'Finalizada',
                        'Cancelada'
                    )),
    reserved_at TIMESTAMP   NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP   NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  reservations        IS 'Reservas individuais de produto (fluxo single-item)';
COMMENT ON COLUMN reservations.status IS 'Aguardando Confirmação | Confirmada | Finalizada | Cancelada';

-- ── 8. ÍNDICES DE PERFORMANCE ───────────────────────────────

CREATE INDEX idx_products_status       ON products(status);
CREATE INDEX idx_products_category     ON products(category_id);
CREATE INDEX idx_orders_user           ON orders(user_id);
CREATE INDEX idx_orders_status         ON orders(status);
CREATE INDEX idx_order_items_order     ON order_items(order_id);
CREATE INDEX idx_order_items_product   ON order_items(product_id);
CREATE INDEX idx_reservations_user     ON reservations(user_id);
CREATE INDEX idx_reservations_product  ON reservations(product_id);
CREATE INDEX idx_users_email           ON users(email);

-- ── 9. VIEWS ÚTEIS ──────────────────────────────────────────

-- Resumo de vendas por mês
CREATE VIEW vw_sales_by_month AS
SELECT
    DATE_TRUNC('month', o.ordered_at)   AS month,
    COUNT(DISTINCT o.id)                AS total_orders,
    SUM(oi.quantity)                    AS total_items,
    SUM(o.total)                        AS revenue
FROM orders o
JOIN order_items oi ON oi.order_id = o.id
WHERE o.status IN ('Confirmada','Finalizada')
GROUP BY 1
ORDER BY 1 DESC;

-- Estoque por categoria e status
CREATE VIEW vw_stock_by_category AS
SELECT
    c.name                                                          AS category,
    COUNT(*)                                                        AS total,
    COUNT(*) FILTER (WHERE p.status = 'available')                 AS available,
    COUNT(*) FILTER (WHERE p.status = 'reserved')                  AS reserved,
    COUNT(*) FILTER (WHERE p.status = 'sold')                      AS sold,
    COUNT(*) FILTER (WHERE p.status = 'unavailable')               AS unavailable
FROM products p
JOIN categories c ON c.id = p.category_id
GROUP BY c.name
ORDER BY c.name;

-- Detalhes de cada pedido com usuário
CREATE VIEW vw_orders_detail AS
SELECT
    o.id            AS order_id,
    u.name          AS customer_name,
    u.phone         AS customer_phone,
    u.email         AS customer_email,
    o.total,
    o.status,
    o.ordered_at,
    COUNT(oi.id)    AS item_count
FROM orders o
JOIN users       u  ON u.id  = o.user_id
JOIN order_items oi ON oi.order_id = o.id
GROUP BY o.id, u.name, u.phone, u.email, o.total, o.status, o.ordered_at
ORDER BY o.ordered_at DESC;

-- ── 10. TRIGGER – atualizar updated_at ──────────────────────

CREATE OR REPLACE FUNCTION fn_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE TRIGGER trg_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE TRIGGER trg_reservations_updated_at
    BEFORE UPDATE ON reservations
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

-- ── 11. DADOS DE EXEMPLO ─────────────────────────────────────

INSERT INTO users (name, birth_date, email, phone, address, city, state, cep, password_hash) VALUES
    ('Maria Silva',    '1990-03-15', 'maria@email.com',    '(11) 98765-4321', 'Rua das Flores, 456',   'São Paulo', 'SP', '01234-567', '$2b$12$HASH_MARIA'),
    ('João Santos',    '1985-07-22', 'joao@email.com',     '(11) 91234-5678', 'Av. Paulista, 1000',    'São Paulo', 'SP', '01310-100', '$2b$12$HASH_JOAO'),
    ('Ana Paula Costa','1995-11-08', 'ana.paula@email.com','(11) 99876-5432', 'Rua Augusta, 200',      'São Paulo', 'SP', '01305-000', '$2b$12$HASH_ANA'),
    ('Carlos Oliveira','1978-04-30', 'carlos@email.com',   '(11) 97654-3210', 'Alameda Santos, 50',    'São Paulo', 'SP', '01419-001', '$2b$12$HASH_CARLOS'),
    ('Fernanda Lima',  '2000-01-15', 'fernanda@email.com', '(11) 96543-2109', 'Rua Oscar Freire, 10',  'São Paulo', 'SP', '01426-001', '$2b$12$HASH_FERNANDA');

INSERT INTO products (name, category_id, description, condition, price, status, image_url) VALUES
    ('Vestido Floral Feminino',  1, 'Lindo vestido floral em tecido leve e confortável.',   'Seminovo - Ótimo estado',       35.00, 'available',   'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400'),
    ('Camisa Social Masculina',  2, 'Camisa social azul claro, ideal para trabalho.',        'Seminovo - Excelente estado',   28.00, 'available',   'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400'),
    ('Conjunto Infantil Colorido',3,'Conjunto infantil com blusa e calça, tamanho 6 anos.', 'Novo com etiqueta',             25.00, 'reserved',    'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=400'),
    ('Tênis Esportivo Nike',     4, 'Tênis Nike em excelente estado, numeração 40.',         'Seminovo - Pouco uso',          65.00, 'available',   'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400'),
    ('O Pequeno Príncipe',       5, 'Livro clássico em ótimo estado de conservação.',        'Seminovo - Muito bom',          15.00, 'available',   'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400'),
    ('Quebra-cabeça 500 Peças',  6, 'Quebra-cabeça completo com todas as peças.',            'Seminovo - Completo',           20.00, 'available',   'https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?w=400'),
    ('Bolsa Feminina Couro',     7, 'Bolsa de couro sintético em excelente estado.',         'Seminovo - Ótimo',              40.00, 'available',   'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400'),
    ('Jaqueta Jeans Feminina',   1, 'Jaqueta jeans versátil para diversas ocasiões.',        'Seminovo - Bom estado',         45.00, 'available',   'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400');

-- Pedido de exemplo
INSERT INTO orders (user_id, total, status, ordered_at) VALUES
    (1, 50.00, 'Confirmada',  '2024-01-10 14:30:00'),
    (1, 40.00, 'Finalizada',  '2024-01-05 10:00:00');

INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES
    (1, 1, 1, 35.00),
    (1, 5, 1, 15.00),
    (2, 7, 1, 40.00);

-- Reserva de exemplo
INSERT INTO reservations (user_id, product_id, status, reserved_at) VALUES
    (1, 2, 'Confirmada',              '2024-01-20 09:00:00'),
    (1, 4, 'Finalizada',              '2024-01-15 11:00:00');

-- ============================================================
--  FIM DO SCRIPT
-- ============================================================
