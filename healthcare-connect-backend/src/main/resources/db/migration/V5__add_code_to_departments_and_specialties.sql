-- 1. Thêm cột code vào bảng departments
ALTER TABLE departments ADD COLUMN code VARCHAR(50);

-- 2. Thêm cột code vào bảng specialties
ALTER TABLE specialties ADD COLUMN code VARCHAR(50);

-- 3. Xóa dữ liệu cũ để nạp lại bộ mã chuẩn (Vì mình đã thống nhất TRUNCATE cho sạch)
-- Dùng CASCADE để nó tự động xóa các bảng liên quan nếu có (như specialties)
TRUNCATE TABLE departments CASCADE;

-- 4. Chèn lại dữ liệu Department với mã Code thủ công (Manual)
INSERT INTO departments (name, code, description) VALUES
                                                      ('Khoa Nội Tổng Quát', 'KNOI', 'Chuyên khám và điều trị các bệnh lý nội khoa như tim mạch, tiêu hóa, hô hấp.'),
                                                      ('Khoa Ngoại', 'KNGOAI', 'Thực hiện các ca phẫu thuật từ tiểu phẫu đến đại phẫu.'),
                                                      ('Khoa Nhi', 'KNHI', 'Chăm sóc sức khỏe toàn diện cho trẻ em từ sơ sinh đến dưới 16 tuổi.'),
                                                      ('Khoa Sản', 'KSAN', 'Dịch vụ thai sản, sinh đẻ và chăm sóc sức khỏe phụ nữ.'),
                                                      ('Khoa Mắt', 'KMAT', 'Khám và điều trị các tật khúc xạ, phẫu thuật Phaco điều trị đục thủy tinh thể.'),
                                                      ('Khoa Răng Hàm Mặt', 'RHM', 'Khám điều trị răng miệng, chỉnh nha và phục hình thẩm mỹ.'),
                                                      ('Khoa Tai Mũi Họng', 'TMH', 'Điều trị các bệnh lý về tai, mũi và vùng họng, xoang.'),
                                                      ('Khoa Da Liễu', 'DLIEU', 'Điều trị các bệnh lý về da và tư vấn thẩm mỹ da.'),
                                                      ('Khoa Chẩn Đoán Hình Ảnh', 'CDHA', 'Thực hiện X-quang, MRI, CT Scan để hỗ trợ chẩn đoán.'),
                                                      ('Khoa Xét Nghiệm', 'XNGHIEM', 'Thực hiện các xét nghiệm máu, nước tiểu, vi sinh phục vụ điều trị.');

-- 5. Sau khi nạp xong, đặt ràng buộc NOT NULL và UNIQUE để bảo vệ dữ liệu
ALTER TABLE departments ALTER COLUMN code SET NOT NULL;
ALTER TABLE departments ADD CONSTRAINT uk_department_code UNIQUE (code);

ALTER TABLE specialties ALTER COLUMN code SET NOT NULL;
ALTER TABLE specialties ADD CONSTRAINT uk_specialty_code UNIQUE (code);