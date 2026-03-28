CREATE TABLE IF NOT EXISTS doctors (
                                       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                       doctor_code VARCHAR(50) UNIQUE NOT NULL,
                                       user_id UUID UNIQUE NOT NULL,
                                       department_id UUID NOT NULL,
                                       specialty_id UUID NOT NULL,
                                       degree VARCHAR(100),
                                       experience TEXT,
                                       consultation_fee DECIMAL(15, 2),
                                       status VARCHAR(50) DEFAULT 'PENDING',
                                       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                       updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

                                       CONSTRAINT fk_doctor_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                                       CONSTRAINT fk_doctor_department FOREIGN KEY (department_id) REFERENCES departments(id),
                                       CONSTRAINT fk_doctor_specialty FOREIGN KEY (specialty_id) REFERENCES specialties(id)
);