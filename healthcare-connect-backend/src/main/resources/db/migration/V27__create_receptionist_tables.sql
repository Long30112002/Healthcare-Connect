-- 1. Bảng receptionists (thông tin lễ tân)
CREATE TABLE IF NOT EXISTS receptionists (
                                             id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                             user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
                                             hospital_id UUID NOT NULL REFERENCES hospitals(id),
                                             receptionist_code VARCHAR(50) UNIQUE NOT NULL,
                                             status VARCHAR(50) DEFAULT 'PENDING',
                                             rejection_reason VARCHAR(255),
                                             rejection_note TEXT,
                                             created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                             updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE receptionists IS 'Thông tin nhân viên lễ tân';
COMMENT ON COLUMN receptionists.status IS 'PENDING, VERIFIED, APPROVED, REJECTED, INACTIVE';

-- Indexes
CREATE INDEX IF NOT EXISTS idx_receptionists_user_id ON receptionists(user_id);
CREATE INDEX IF NOT EXISTS idx_receptionists_hospital_id ON receptionists(hospital_id);
CREATE INDEX IF NOT EXISTS idx_receptionists_status ON receptionists(status);
CREATE INDEX IF NOT EXISTS idx_receptionists_code ON receptionists(receptionist_code);

-- 2. Bảng receptionist_application_history (lịch sử xin việc)
CREATE TABLE IF NOT EXISTS receptionist_application_history (
                                                                id BIGSERIAL PRIMARY KEY,
                                                                receptionist_id UUID NOT NULL REFERENCES receptionists(id) ON DELETE CASCADE,
                                                                actor_id UUID REFERENCES users(id),
                                                                actor_role VARCHAR(50),
                                                                action VARCHAR(50) NOT NULL,
                                                                old_status VARCHAR(50),
                                                                new_status VARCHAR(50),
                                                                rejection_reason VARCHAR(255),
                                                                rejection_note TEXT,
                                                                changes JSONB,
                                                                note TEXT,
                                                                ip_address VARCHAR(50),
                                                                user_agent TEXT,
                                                                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE receptionist_application_history IS 'Lịch sử xin việc và duyệt hồ sơ lễ tân';
COMMENT ON COLUMN receptionist_application_history.action IS 'SUBMIT, ADMIN_VERIFY, MANAGER_APPROVE, REJECT';

-- Indexes
CREATE INDEX IF NOT EXISTS idx_rec_app_history_receptionist ON receptionist_application_history(receptionist_id);
CREATE INDEX IF NOT EXISTS idx_rec_app_history_action ON receptionist_application_history(action);
CREATE INDEX IF NOT EXISTS idx_rec_app_history_created_at ON receptionist_application_history(created_at);

-- 3. Bảng receptionist_activity_history (lịch sử hoạt động)
CREATE TABLE IF NOT EXISTS receptionist_activity_history (
                                                             id BIGSERIAL PRIMARY KEY,
                                                             receptionist_id UUID NOT NULL REFERENCES receptionists(id) ON DELETE CASCADE,
                                                             hospital_id UUID NOT NULL REFERENCES hospitals(id),
                                                             action VARCHAR(50) NOT NULL,
                                                             appointment_id UUID REFERENCES appointments(id),
                                                             payment_id UUID REFERENCES payments(id),
                                                             target_user_id UUID REFERENCES users(id),
                                                             target_patient_name VARCHAR(255),
                                                             target_patient_phone VARCHAR(20),
                                                             changes JSONB,
                                                             ip_address VARCHAR(50),
                                                             user_agent TEXT,
                                                             note TEXT,
                                                             created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE receptionist_activity_history IS 'Lịch sử hoạt động nghiệp vụ của lễ tân';
COMMENT ON COLUMN receptionist_activity_history.action IS 'CREATE_WALK_IN, CHECK_IN, REFUND, CANCEL_APPOINTMENT';

-- Indexes
CREATE INDEX IF NOT EXISTS idx_rec_act_history_receptionist ON receptionist_activity_history(receptionist_id);
CREATE INDEX IF NOT EXISTS idx_rec_act_history_hospital ON receptionist_activity_history(hospital_id);
CREATE INDEX IF NOT EXISTS idx_rec_act_history_action ON receptionist_activity_history(action);
CREATE INDEX IF NOT EXISTS idx_rec_act_history_appointment ON receptionist_activity_history(appointment_id);
CREATE INDEX IF NOT EXISTS idx_rec_act_history_created_at ON receptionist_activity_history(created_at);