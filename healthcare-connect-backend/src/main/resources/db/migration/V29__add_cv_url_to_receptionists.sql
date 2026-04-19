-- Thêm cột cv_url vào bảng receptionists
ALTER TABLE receptionists ADD COLUMN IF NOT EXISTS cv_url VARCHAR(500);

COMMENT ON COLUMN receptionists.cv_url IS 'Đường dẫn file CV lưu trên Cloudinary';