CREATE TABLE users (
                       id BIGSERIAL PRIMARY KEY,
                       full_name VARCHAR(255) NOT NULL,
                       email VARCHAR(255) UNIQUE NOT NULL,
                       password VARCHAR(255) NOT NULL,
                       role VARCHAR(50) NOT NULL, -- PATIENT, DOCTOR, ADMIN
                       phone VARCHAR(20),
                       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE appointments (
                              id BIGSERIAL PRIMARY KEY,
                              patient_id BIGINT REFERENCES users(id),
                              doctor_id BIGINT REFERENCES users(id),
                              appointment_date TIMESTAMP NOT NULL,
                              status VARCHAR(50) DEFAULT 'PENDING',
                              symptoms TEXT,
                              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);