-- 1. Thêm cột mới
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS patient_name VARCHAR(255);
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS patient_phone VARCHAR(20);
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS booking_type VARCHAR(20) DEFAULT 'ONLINE';

-- 2. Cho phép patient_id NULL
ALTER TABLE appointments ALTER COLUMN patient_id DROP NOT NULL;

-- 3. Tạo index
CREATE INDEX IF NOT EXISTS idx_appointments_patient_phone ON appointments(patient_phone);
CREATE INDEX IF NOT EXISTS idx_appointments_booking_type ON appointments(booking_type);
CREATE INDEX IF NOT EXISTS idx_appointments_patient_name ON appointments(patient_name);

-- 4. Migrate dữ liệu cũ
UPDATE appointments
SET patient_name = u.full_name,
    patient_phone = u.phone
FROM users u
WHERE appointments.patient_id = u.id
  AND (appointments.patient_name IS NULL OR appointments.patient_phone IS NULL);

-- 5. Xóa constraint cũ nếu tồn tại
ALTER TABLE appointments DROP CONSTRAINT IF EXISTS check_booking_type_valid;
ALTER TABLE appointments DROP CONSTRAINT IF EXISTS check_walk_in_has_name_phone;
ALTER TABLE appointments DROP CONSTRAINT IF EXISTS check_walk_in_patient_id_null;

-- 6. Tạo constraint mới
ALTER TABLE appointments ADD CONSTRAINT check_booking_type_valid
    CHECK (booking_type IN ('ONLINE', 'WALK_IN'));

ALTER TABLE appointments ADD CONSTRAINT check_walk_in_has_name_phone
    CHECK (booking_type = 'ONLINE' OR (booking_type = 'WALK_IN' AND patient_name IS NOT NULL AND patient_phone IS NOT NULL));

ALTER TABLE appointments ADD CONSTRAINT check_walk_in_patient_id_null
    CHECK (booking_type = 'ONLINE' OR (booking_type = 'WALK_IN' AND patient_id IS NULL));

-- 7. Comments
COMMENT ON COLUMN appointments.patient_name IS 'Tên bệnh nhân (cho walk-in)';
COMMENT ON COLUMN appointments.patient_phone IS 'SĐT bệnh nhân (cho walk-in)';
COMMENT ON COLUMN appointments.booking_type IS 'ONLINE hoặc WALK_IN';