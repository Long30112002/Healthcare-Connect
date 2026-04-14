-- Thêm cột room_id vào bảng appointments
ALTER TABLE appointments ADD COLUMN room_id UUID REFERENCES rooms(id);

-- Tạo index
CREATE INDEX idx_appointments_room_id ON appointments(room_id);