-- 1. FIX medicines (unique theo hospital)
-- Xóa unique cũ
ALTER TABLE medicines
    DROP CONSTRAINT IF EXISTS medicines_code_key;

-- Unique theo (code, hospital)
CREATE UNIQUE INDEX IF NOT EXISTS idx_medicines_code_hospital
    ON medicines(code, hospital_id)
    WHERE deleted = false AND hospital_id IS NOT NULL;

-- Index hỗ trợ query
CREATE INDEX IF NOT EXISTS idx_medicines_hospital_code
    ON medicines(hospital_id, code);

-- 2. FIX medical_records (walk-in patient)
ALTER TABLE medical_records
    ALTER COLUMN patient_id DROP NOT NULL;

-- 3. ADD COLUMN prescriptions
ALTER TABLE prescriptions
    ADD COLUMN IF NOT EXISTS hospital_id UUID,
    ADD COLUMN IF NOT EXISTS doctor_id UUID,
    ADD COLUMN IF NOT EXISTS patient_id UUID,
    ADD COLUMN IF NOT EXISTS created_by UUID;

-- 4. ADD FOREIGN KEY (safe, không cần pg_constraint)
DO $$
    BEGIN
        -- hospital
        BEGIN
            ALTER TABLE prescriptions
                ADD CONSTRAINT fk_prescriptions_hospital
                    FOREIGN KEY (hospital_id)
                        REFERENCES hospitals(id)
                        ON DELETE RESTRICT;
        EXCEPTION WHEN duplicate_object THEN END;

        -- doctor
        BEGIN
            ALTER TABLE prescriptions
                ADD CONSTRAINT fk_prescriptions_doctor
                    FOREIGN KEY (doctor_id)
                        REFERENCES doctors(id)
                        ON DELETE RESTRICT;
        EXCEPTION WHEN duplicate_object THEN END;

        -- patient
        BEGIN
            ALTER TABLE prescriptions
                ADD CONSTRAINT fk_prescriptions_patient
                    FOREIGN KEY (patient_id)
                        REFERENCES users(id)
                        ON DELETE RESTRICT;
        EXCEPTION WHEN duplicate_object THEN END;

        -- created_by
        BEGIN
            ALTER TABLE prescriptions
                ADD CONSTRAINT fk_prescriptions_created_by
                    FOREIGN KEY (created_by)
                        REFERENCES users(id)
                        ON DELETE SET NULL;
        EXCEPTION WHEN duplicate_object THEN END;
    END $$;

-- 5. BACKFILL DATA (đồng bộ từ medical_records)
UPDATE prescriptions p
SET
    hospital_id = mr.hospital_id,
    doctor_id   = mr.doctor_id,
    patient_id  = mr.patient_id
FROM medical_records mr
WHERE p.medical_record_id = mr.id;

-- 6. CHECK DATA TRƯỚC KHI SET NOT NULL
DO $$
    BEGIN
        IF NOT EXISTS (
            SELECT 1 FROM prescriptions
            WHERE hospital_id IS NULL
               OR doctor_id IS NULL
               OR patient_id IS NULL
        ) THEN
            ALTER TABLE prescriptions ALTER COLUMN hospital_id SET NOT NULL;
            ALTER TABLE prescriptions ALTER COLUMN doctor_id SET NOT NULL;
            ALTER TABLE prescriptions ALTER COLUMN patient_id SET NOT NULL;
        END IF;
    END $$;

-- 7. INDEXES
CREATE INDEX IF NOT EXISTS idx_prescriptions_hospital
    ON prescriptions(hospital_id);

CREATE INDEX IF NOT EXISTS idx_prescriptions_doctor
    ON prescriptions(doctor_id);

CREATE INDEX IF NOT EXISTS idx_prescriptions_patient
    ON prescriptions(patient_id);

CREATE INDEX IF NOT EXISTS idx_prescriptions_created_by
    ON prescriptions(created_by);