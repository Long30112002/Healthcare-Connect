CREATE TABLE reviews (
                         id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                         appointment_id UUID NOT NULL REFERENCES appointments(id),
                         patient_id UUID NOT NULL REFERENCES users(id),
                         doctor_id UUID NOT NULL REFERENCES doctors(id),
                         rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
                         comment TEXT,
                         is_anonymous BOOLEAN DEFAULT FALSE,
                         is_edited BOOLEAN DEFAULT FALSE,
                         edited_at TIMESTAMP,
                         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                         CONSTRAINT unique_appointment_review UNIQUE (appointment_id)
);

CREATE INDEX idx_reviews_appointment ON reviews(appointment_id);
CREATE INDEX idx_reviews_patient ON reviews(patient_id);
CREATE INDEX idx_reviews_doctor ON reviews(doctor_id);