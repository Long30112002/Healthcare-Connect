CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE users (
                       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                       full_name VARCHAR(255) NOT NULL,
                       email VARCHAR(255) UNIQUE NOT NULL,
                       password VARCHAR(255) NOT NULL,
                       role VARCHAR(50) NOT NULL,
                       phone VARCHAR(20),
                       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE appointments (
                              id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- Đổi sang UUID ở đây
                              patient_id UUID REFERENCES users(id),          -- Kiểu dữ liệu phải khớp là UUID
                              doctor_id UUID REFERENCES users(id),           -- Kiểu dữ liệu phải khớp là UUID
                              appointment_date TIMESTAMP NOT NULL,
                              status VARCHAR(50) DEFAULT 'PENDING',
                              symptoms TEXT,
                              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS departments (
                                           id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                           name VARCHAR(255) NOT NULL UNIQUE,
                                           description TEXT,
                                           created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                           updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO departments (name, description) VALUES
                                                ('Khoa Nội Tổng Quát', 'Chuyên khám và điều trị các bệnh lý nội khoa như tim mạch, tiêu hóa, hô hấp.'),
                                                ('Khoa Ngoại', 'Thực hiện các ca phẫu thuật từ tiểu phẫu đến đại phẫu.'),
                                                ('Khoa Nhi', 'Chăm sóc sức khỏe toàn diện cho trẻ em từ sơ sinh đến dưới 16 tuổi.'),
                                                ('Khoa Sản', 'Dịch vụ thai sản, sinh đẻ và chăm sóc sức khỏe phụ nữ.'),
                                                ('Khoa Mắt', 'Khám và điều trị các tật khúc xạ, phẫu thuật Phaco điều trị đục thủy tinh thể.'),
                                                ('Khoa Răng Hàm Mặt', 'Khám điều trị răng miệng, chỉnh nha và phục hình thẩm mỹ.'),
                                                ('Khoa Tai Mũi Họng', 'Điều trị các bệnh lý về tai, mũi và vùng họng, xoang.'),
                                                ('Khoa Da Liễu', 'Điều trị các bệnh lý về da và tư vấn thẩm mỹ da.'),
                                                ('Khoa Chẩn Đoán Hình Ảnh', 'Thực hiện X-quang, MRI, CT Scan để hỗ trợ chẩn đoán.'),
                                                ('Khoa Xét Nghiệm', 'Thực hiện các xét nghiệm máu, nước tiểu, vi sinh phục vụ điều trị.')
