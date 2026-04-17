-- 1. Cập nhật bảng appointments
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS is_rescheduled BOOLEAN DEFAULT FALSE;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS cancel_reason TEXT;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS check_in_time TIMESTAMP;

-- 2. Tạo bảng payments để quản lý dòng tiền MoMo/VNPay
CREATE TABLE public.payments (
                          id UUID PRIMARY KEY,
                          appointment_id UUID NOT NULL,
                          amount DECIMAL(19, 2) NOT NULL,
                          payment_method VARCHAR(20) NOT NULL, -- MOMO, VPAY
                          transaction_no VARCHAR(100),         -- Mã GD từ nhà cung cấp
                          status VARCHAR(20) NOT NULL,         -- PENDING, SUCCESS, FAILED, REFUNDED
                          refund_amount DECIMAL(19, 2) DEFAULT 0,
                          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                          CONSTRAINT fk_appointment_payment FOREIGN KEY (appointment_id) REFERENCES appointments(id)
);

-- 3. Tạo index để tìm kiếm nhanh
CREATE INDEX idx_payment_appointment_id ON payments(appointment_id);