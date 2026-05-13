-- Thêm cột hospital_id vào bảng departments
ALTER TABLE departments
    ADD COLUMN hospital_id UUID REFERENCES hospitals(id);

-- Tạo index cho truy vấn nhanh hơn
CREATE INDEX idx_departments_hospital_id ON departments(hospital_id);

-- Thêm cột hospital_id vào bảng specialties
ALTER TABLE specialties
    ADD COLUMN hospital_id UUID REFERENCES hospitals(id);

-- Tạo index cho truy vấn nhanh hơn
CREATE INDEX idx_specialties_hospital_id ON specialties(hospital_id);

-- Cập nhật departments (nếu có dữ liệu cũ)
UPDATE departments
SET hospital_id = (SELECT id FROM hospitals LIMIT 1)
WHERE hospital_id IS NULL;

-- Cập nhật specialties (nếu có dữ liệu cũ)
UPDATE specialties
SET hospital_id = (SELECT id FROM hospitals LIMIT 1)
WHERE hospital_id IS NULL;