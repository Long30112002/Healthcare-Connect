-- Thêm các cột cho refund
ALTER TABLE payments ADD COLUMN IF NOT EXISTS refunded_by UUID;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS refunded_by_role VARCHAR(50);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS refunded_at TIMESTAMP;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS refund_reason VARCHAR(255);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS refund_method VARCHAR(50);

-- Index
CREATE INDEX IF NOT EXISTS idx_payments_refunded_by ON payments(refunded_by);
CREATE INDEX IF NOT EXISTS idx_payments_refunded_at ON payments(refunded_at);