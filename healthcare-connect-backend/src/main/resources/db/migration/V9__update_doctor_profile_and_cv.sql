-- 1. Thêm các cột mới
ALTER TABLE doctors ADD COLUMN cv_url VARCHAR(255);
ALTER TABLE doctors ADD COLUMN biography TEXT;
ALTER TABLE doctors ADD COLUMN experience_years INT;

-- 2. Đổi kiểu dữ liệu cột experience cũ (PostgreSQL dùng TYPE)
ALTER TABLE doctors ALTER COLUMN experience TYPE VARCHAR(255);
ALTER TABLE doctors ALTER COLUMN experience DROP NOT NULL;