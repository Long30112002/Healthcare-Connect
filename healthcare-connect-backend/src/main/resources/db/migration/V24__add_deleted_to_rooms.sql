-- Thêm cột deleted vào bảng rooms
ALTER TABLE rooms ADD COLUMN deleted BOOLEAN DEFAULT FALSE;

-- Tạo index cho cột deleted để tăng tốc query
CREATE INDEX idx_rooms_deleted ON rooms(deleted);

-- Cập nhật các phòng hiện tại chưa bị xóa
UPDATE rooms SET deleted = FALSE WHERE deleted IS NULL;