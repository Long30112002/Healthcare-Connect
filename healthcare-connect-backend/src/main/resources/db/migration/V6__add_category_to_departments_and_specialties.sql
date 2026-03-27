-- 1. Thêm cột category
ALTER TABLE departments ADD COLUMN IF NOT EXISTS category VARCHAR(50);
ALTER TABLE specialties ADD COLUMN IF NOT EXISTS category VARCHAR(50);

-- 2. Cập nhật Category cho DEPARTMENTS
UPDATE departments SET category = 'INTERNAL_MEDICINE' WHERE code = 'KNOI';
UPDATE departments SET category = 'SURGERY'           WHERE code = 'KNGOAI';
UPDATE departments SET category = 'PEDIATRICS'        WHERE code = 'KNHI';
UPDATE departments SET category = 'OBSTETRICS'        WHERE code = 'KSAN';
UPDATE departments SET category = 'OPHTHALMOLOGY'     WHERE code = 'KMAT';
UPDATE departments SET category = 'GENERAL'           WHERE code = 'RHM';
UPDATE departments SET category = 'ENT'               WHERE code = 'TMH';
UPDATE departments SET category = 'DERMATOLOGY'       WHERE code = 'DLIEU';
UPDATE departments SET category = 'DIAGNOSTIC_IMAGING' WHERE code = 'CDHA';
UPDATE departments SET category = 'LABORATORY'        WHERE code = 'XNGHIEM';

-- 3. CẬP NHẬT CATEGORY CHO SPECIALTIES (Dùng JOIN để lấy từ Department sang)
-- Lệnh này giúp các bản ghi cũ trong specialties không còn bị NULL
UPDATE specialties s
SET category = d.category
FROM departments d
WHERE s.department_id = d.id;

-- 4.Gắn ràng buộc NOT NULL an toàn
ALTER TABLE departments ALTER COLUMN category SET NOT NULL;
ALTER TABLE specialties ALTER COLUMN category SET NOT NULL;

-- 5. Tạo Index
CREATE INDEX idx_dept_category ON departments(category);
CREATE INDEX idx_spec_category ON specialties(category);