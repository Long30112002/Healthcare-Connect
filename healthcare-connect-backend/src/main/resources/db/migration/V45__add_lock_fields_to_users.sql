-- 1. Thêm cột lưu lý do khóa
ALTER TABLE users ADD COLUMN IF NOT EXISTS lock_reason TEXT;
COMMENT ON COLUMN users.lock_reason IS 'Lý do khóa tài khoản';

-- 2. Thêm cột lưu thời điểm bị khóa
ALTER TABLE users ADD COLUMN IF NOT EXISTS locked_at TIMESTAMP;
COMMENT ON COLUMN users.locked_at IS 'Thời điểm tài khoản bị khóa';

-- 3. Thêm cột lưu ID Admin đã khóa
ALTER TABLE users ADD COLUMN IF NOT EXISTS locked_by UUID REFERENCES users(id);
COMMENT ON COLUMN users.locked_by IS 'ID của Admin đã thực hiện khóa tài khoản';

-- 4. Thêm cột lưu thời điểm được mở khóa
ALTER TABLE users ADD COLUMN IF NOT EXISTS unlocked_at TIMESTAMP;
COMMENT ON COLUMN users.unlocked_at IS 'Thời điểm tài khoản được mở khóa';

-- 5. Thêm cột lưu ID Admin đã mở khóa
ALTER TABLE users ADD COLUMN IF NOT EXISTS unlocked_by UUID REFERENCES users(id);
COMMENT ON COLUMN users.unlocked_by IS 'ID của Admin đã thực hiện mở khóa tài khoản';

-- 6. Tạo index cho các cột mới để tăng tốc truy vấn
CREATE INDEX IF NOT EXISTS idx_users_locked_at ON users(locked_at);
CREATE INDEX IF NOT EXISTS idx_users_locked_by ON users(locked_by);
CREATE INDEX IF NOT EXISTS idx_users_unlocked_at ON users(unlocked_at);
CREATE INDEX IF NOT EXISTS idx_users_unlocked_by ON users(unlocked_by);