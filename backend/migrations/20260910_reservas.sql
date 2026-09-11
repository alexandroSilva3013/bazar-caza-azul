ALTER TABLE public.vendas
ADD COLUMN IF NOT EXISTS origem VARCHAR(10) NOT NULL DEFAULT 'compra'
CHECK (origem IN ('compra', 'reserva'));
