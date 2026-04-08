CREATE TABLE IF NOT EXISTS doctor_history (
    id BIGSERIAL PRIMARY KEY,
    doctor_id UUID NOT NULL,

    -- Thông tin người thực hiện
    actor_id UUID NOT NULL,
    actor_role VARCHAR(50) NOT NULL,  -- ADMIN, HOSPITAL_MANAGER, DOCTOR, SYSTEM

    -- Hành động
    action VARCHAR(50) NOT NULL,      -- CREATE, UPDATE, REAPPLY, VERIFY, APPROVE, REJECT, ARCHIVE
    old_status VARCHAR(50),
    new_status VARCHAR(50),

    -- Thông tin thay đổi (JSON)
    changes JSONB,

    -- Lý do từ chối (nếu có)
    rejection_reason VARCHAR(255),
    rejection_note TEXT,

    -- Thông tin bảo mật
    ip_address INET,
    user_agent TEXT,

    -- Ghi chú chung
    note TEXT,

    created_at TIMESTAMP DEFAULT NOW(),

    -- Khóa ngoại
    CONSTRAINT fk_doctor_history_doctor FOREIGN KEY (doctor_id) REFERENCES doctors(id),
    CONSTRAINT fk_doctor_history_actor FOREIGN KEY (actor_id) REFERENCES users(id)
);

-- Indexes cho performance
CREATE INDEX IF NOT EXISTS idx_doctor_history_doctor_id ON doctor_history(doctor_id);
CREATE INDEX IF NOT EXISTS idx_doctor_history_actor_id ON doctor_history(actor_id);
CREATE INDEX IF NOT EXISTS idx_doctor_history_action ON doctor_history(action);
CREATE INDEX IF NOT EXISTS idx_doctor_history_created_at ON doctor_history(created_at);
CREATE INDEX IF NOT EXISTS idx_doctor_history_status ON doctor_history(old_status, new_status);

-- Composite index cho query phổ biến
CREATE INDEX IF NOT EXISTS idx_doctor_history_doctor_action ON doctor_history(doctor_id, action, created_at DESC);