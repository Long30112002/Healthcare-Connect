ALTER TABLE payments DROP COLUMN IF EXISTS refunded_by;
ALTER TABLE payments DROP COLUMN IF EXISTS refunded_by_role;
ALTER TABLE payments DROP COLUMN IF EXISTS refunded_at;
ALTER TABLE payments DROP COLUMN IF EXISTS refund_reason;
ALTER TABLE payments DROP COLUMN IF EXISTS refund_method;