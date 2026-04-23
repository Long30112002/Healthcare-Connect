-- 1. Xóa constraint cũ (nếu có)
ALTER TABLE medicines DROP CONSTRAINT IF EXISTS medicines_code_key;

-- 2. Tạo UNIQUE index cho cặp (code, hospital_id)
--    => Cho phép cùng code nhưng khác hospital_id
CREATE UNIQUE INDEX IF NOT EXISTS idx_medicines_code_hospital
    ON medicines(code, hospital_id)
    WHERE deleted = false;

-- 3. Index cho tìm kiếm nhanh
CREATE INDEX IF NOT EXISTS idx_medicines_hospital_code
    ON medicines(hospital_id, code);