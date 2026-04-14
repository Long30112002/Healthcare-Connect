-- Tạo bảng rooms
CREATE TABLE rooms (
                       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                       room_number VARCHAR(10) NOT NULL UNIQUE,
                       floor INTEGER,
                       building VARCHAR(50),
                       status VARCHAR(20) DEFAULT 'AVAILABLE', -- AVAILABLE, OCCUPIED, MAINTENANCE
                       current_appointment_id UUID,
                       created_at TIMESTAMP DEFAULT NOW(),
                       updated_at TIMESTAMP DEFAULT NOW()
);

-- Thêm index cho tìm kiếm nhanh
CREATE INDEX idx_rooms_status ON rooms(status);
CREATE INDEX idx_rooms_room_number ON rooms(room_number);