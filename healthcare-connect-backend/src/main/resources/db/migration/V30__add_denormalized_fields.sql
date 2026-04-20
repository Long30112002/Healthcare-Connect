-- 1. Appointment: thêm doctor_id, hospital_id
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS doctor_id UUID REFERENCES doctors(id);
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS hospital_id UUID REFERENCES hospitals(id);

CREATE INDEX IF NOT EXISTS idx_appointments_doctor_id ON appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_hospital_id ON appointments(hospital_id);

-- Cập nhật dữ liệu cũ
UPDATE appointments a
SET doctor_id = s.doctor_id,
    hospital_id = d.hospital_id
FROM schedules s
         JOIN doctors d ON s.doctor_id = d.id
WHERE a.schedule_id = s.id;

-- 2. Payment: thêm hospital_id, doctor_id
ALTER TABLE payments ADD COLUMN IF NOT EXISTS hospital_id UUID REFERENCES hospitals(id);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS doctor_id UUID REFERENCES doctors(id);

CREATE INDEX IF NOT EXISTS idx_payments_hospital_id ON payments(hospital_id);
CREATE INDEX IF NOT EXISTS idx_payments_doctor_id ON payments(doctor_id);

-- Cập nhật dữ liệu cũ
UPDATE payments p
SET hospital_id = a.hospital_id,
    doctor_id = a.doctor_id
FROM appointments a
WHERE p.appointment_id = a.id;

-- 3. Room: thêm hospital_id
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS hospital_id UUID REFERENCES hospitals(id);

CREATE INDEX IF NOT EXISTS idx_rooms_hospital_id ON rooms(hospital_id);