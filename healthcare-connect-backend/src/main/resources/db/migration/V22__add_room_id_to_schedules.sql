-- Thêm cột room_id vào bảng schedules
ALTER TABLE schedules ADD COLUMN room_id UUID REFERENCES rooms(id);

-- Tạo index
CREATE INDEX idx_schedules_room_id ON schedules(room_id);