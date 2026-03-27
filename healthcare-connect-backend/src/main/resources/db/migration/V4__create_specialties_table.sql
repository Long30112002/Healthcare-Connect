CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE specialties (
                             id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                             name VARCHAR(255) NOT NULL UNIQUE,
                             description TEXT,
                             department_id UUID NOT NULL, -- Khóa ngoại nối sang bảng departments
                             created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                             updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

                             CONSTRAINT fk_specialties_department
                                 FOREIGN KEY (department_id)
                                     REFERENCES departments(id)
                                     ON DELETE CASCADE -- Nếu xóa Khoa thì xóa luôn Chuyên khoa thuộc nó
);