-- 1. Bảng medicines (danh mục thuốc)
CREATE TABLE IF NOT EXISTS medicines (
                                         id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                         code VARCHAR(50) UNIQUE NOT NULL,
                                         name VARCHAR(255) NOT NULL,
                                         active_ingredient TEXT,
                                         category VARCHAR(50),
                                         dosage_form VARCHAR(50),
                                         unit VARCHAR(50),
                                         price DECIMAL(19, 2),
                                         stock_quantity INT DEFAULT 0,
                                         min_stock INT DEFAULT 10,
                                         max_stock INT,
                                         expiry_date DATE,
                                         manufacturer VARCHAR(255),
                                         manufacturer_country VARCHAR(100),
                                         requires_prescription BOOLEAN DEFAULT TRUE,
                                         contraindications TEXT,
                                         side_effects TEXT,
                                         description TEXT,
                                         usage_instructions TEXT,
                                         hospital_id UUID REFERENCES hospitals(id),
                                         deleted BOOLEAN DEFAULT FALSE,
                                         version BIGINT DEFAULT 0,
                                         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                         updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                         deleted_at TIMESTAMP
);

-- 2. Bảng medical_records (bệnh án)
CREATE TABLE IF NOT EXISTS medical_records (
                                               id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                               appointment_id UUID NOT NULL REFERENCES appointments(id),
                                               patient_id UUID NOT NULL REFERENCES users(id),
                                               doctor_id UUID NOT NULL REFERENCES doctors(id),
                                               hospital_id UUID NOT NULL REFERENCES hospitals(id),
                                               diagnosis TEXT NOT NULL,
                                               symptoms TEXT,
                                               notes TEXT,
                                               vital_signs JSONB,
                                               follow_up_date DATE,
                                               status VARCHAR(50) DEFAULT 'ACTIVE',
                                               deleted BOOLEAN DEFAULT FALSE,
                                               version BIGINT DEFAULT 0,
                                               created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                               updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                               deleted_at TIMESTAMP
);

-- 3. Bảng prescriptions (đơn thuốc) - ĐẦY ĐỦ
CREATE TABLE IF NOT EXISTS prescriptions (
                                             id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                             medical_record_id UUID NOT NULL REFERENCES medical_records(id),
                                             prescription_date DATE NOT NULL DEFAULT CURRENT_DATE,
                                             note TEXT,
                                             total_amount DECIMAL(19, 2),
                                             status VARCHAR(50) DEFAULT 'ACTIVE',
                                             valid_until DATE,
                                             version BIGINT DEFAULT 0,
                                             created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                             updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Bảng prescription_items (chi tiết đơn thuốc)
CREATE TABLE IF NOT EXISTS prescription_items (
                                                  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                                  prescription_id UUID NOT NULL REFERENCES prescriptions(id),
                                                  medicine_id UUID NOT NULL REFERENCES medicines(id),
                                                  quantity INT NOT NULL,
                                                  dosage VARCHAR(100),
                                                  frequency VARCHAR(100),
                                                  duration INT,
                                                  instructions TEXT,
                                                  unit_price DECIMAL(19, 2),
                                                  total_price DECIMAL(19, 2),
                                                  version BIGINT DEFAULT 0,                          -- 🟢 THÊM: Optimistic lock
                                                  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- INDEXES (Tối ưu hiệu năng)
-- Medicines indexes
CREATE INDEX idx_medicines_code ON medicines(code) WHERE deleted = false;
CREATE INDEX idx_medicines_name ON medicines(name);
CREATE INDEX idx_medicines_category ON medicines(category);
CREATE INDEX idx_medicines_hospital ON medicines(hospital_id);
CREATE INDEX idx_medicines_expiry_date ON medicines(expiry_date);
CREATE INDEX idx_medicines_low_stock ON medicines(stock_quantity, min_stock) WHERE deleted = false;

-- Medical records indexes
CREATE INDEX idx_medical_records_appointment ON medical_records(appointment_id);
CREATE INDEX idx_medical_records_patient ON medical_records(patient_id);
CREATE INDEX idx_medical_records_doctor ON medical_records(doctor_id);
CREATE INDEX idx_medical_records_hospital ON medical_records(hospital_id);
CREATE INDEX idx_medical_records_created_at ON medical_records(created_at);
CREATE INDEX idx_medical_records_status ON medical_records(status);

-- Prescriptions indexes
CREATE INDEX idx_prescriptions_medical_record ON prescriptions(medical_record_id);
CREATE INDEX idx_prescriptions_prescription_date ON prescriptions(prescription_date);
CREATE INDEX idx_prescriptions_status ON prescriptions(status);
CREATE INDEX idx_prescriptions_valid_until ON prescriptions(valid_until);

-- Prescription items indexes
CREATE INDEX idx_prescription_items_prescription ON prescription_items(prescription_id);
CREATE INDEX idx_prescription_items_medicine ON prescription_items(medicine_id);

-- =====================================================
-- COMMENTS (Documentation)
-- =====================================================

COMMENT ON TABLE medicines IS 'Danh mục thuốc của bệnh viện';
COMMENT ON COLUMN medicines.active_ingredient IS 'Hoạt chất chính của thuốc';
COMMENT ON COLUMN medicines.dosage_form IS 'Dạng bào chế: viên nén, siro, tiêm...';
COMMENT ON COLUMN medicines.requires_prescription IS 'Có cần kê đơn không';
COMMENT ON COLUMN medicines.min_stock IS 'Ngưỡng cảnh báo tồn kho tối thiểu';
COMMENT ON COLUMN medicines.max_stock IS 'Ngưỡng tồn kho tối đa';
COMMENT ON COLUMN medicines.expiry_date IS 'Hạn sử dụng của thuốc';
COMMENT ON COLUMN medicines.contraindications IS 'Chống chỉ định';
COMMENT ON COLUMN medicines.side_effects IS 'Tác dụng phụ';

COMMENT ON TABLE medical_records IS 'Hồ sơ bệnh án điện tử';
COMMENT ON COLUMN medical_records.vital_signs IS 'Dấu hiệu sinh tồn dạng JSON (huyết áp, nhịp tim, nhiệt độ, cân nặng, chiều cao)';
COMMENT ON COLUMN medical_records.follow_up_date IS 'Ngày tái khám dự kiến';
COMMENT ON COLUMN medical_records.status IS 'Trạng thái bệnh án: ACTIVE, COMPLETED, ARCHIVED, CANCELLED';
COMMENT ON COLUMN medical_records.deleted IS 'Đánh dấu đã xóa mềm';

COMMENT ON TABLE prescriptions IS 'Đơn thuốc';
COMMENT ON COLUMN prescriptions.status IS 'Trạng thái đơn thuốc: ACTIVE, COMPLETED, EXPIRED, CANCELLED';
COMMENT ON COLUMN prescriptions.valid_until IS 'Đơn thuốc có hiệu lực đến ngày';

COMMENT ON TABLE prescription_items IS 'Chi tiết các loại thuốc trong đơn';
COMMENT ON COLUMN prescription_items.dosage IS 'Liều dùng mỗi lần';
COMMENT ON COLUMN prescription_items.frequency IS 'Tần suất dùng thuốc';
COMMENT ON COLUMN prescription_items.duration IS 'Số ngày dùng thuốc';