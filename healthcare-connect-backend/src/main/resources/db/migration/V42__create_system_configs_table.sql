-- V42__create_system_configs_table.sql

-- Tạo bảng system_configs
CREATE TABLE IF NOT EXISTS system_configs (
                                              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                              config_key VARCHAR(255) NOT NULL UNIQUE,
                                              config_value TEXT,
                                              config_type VARCHAR(50) DEFAULT 'TEXT',
                                              group_name VARCHAR(100) DEFAULT 'GENERAL',
                                              display_name VARCHAR(255),
                                              description VARCHAR(500),
                                              display_order INT DEFAULT 0,
                                              is_active BOOLEAN DEFAULT true,
                                              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                              updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                              updated_by UUID REFERENCES users(id)
);

-- Tạo indexes
CREATE INDEX idx_system_configs_config_key ON system_configs(config_key);
CREATE INDEX idx_system_configs_group_name ON system_configs(group_name);
CREATE INDEX idx_system_configs_is_active ON system_configs(is_active);

-- Insert dữ liệu mặc định
INSERT INTO system_configs (config_key, config_value, config_type, group_name, display_name, display_order) VALUES
-- GENERAL
('SYSTEM_NAME', 'Healthcare Connect', 'TEXT', 'GENERAL', 'Tên hệ thống', 1),
('SYSTEM_LOGO_URL', '/images/logo.png', 'IMAGE', 'GENERAL', 'Logo hệ thống', 2),

-- HOME - Hero Slides
('HOME_HERO_SLIDES', '[
    {"id":1,"title":"Chăm sóc sức khỏe toàn diện","subtitle":"Đặt lịch khám dễ dàng","description":"Kết nối với bác sĩ hàng đầu","icon":"🏥","bgGradient":"from-blue-600 to-cyan-500"},
    {"id":2,"title":"Tư vấn trực tuyến 24/7","subtitle":"Bác sĩ sẵn sàng giải đáp","description":"Đặt câu hỏi và nhận tư vấn từ xa","icon":"💬","bgGradient":"from-green-600 to-teal-500"},
    {"id":3,"title":"Đặt lịch nhanh chóng","subtitle":"Tiết kiệm thời gian chờ đợi","description":"Chọn bác sĩ, chọn giờ, xác nhận ngay","icon":"📅","bgGradient":"from-purple-600 to-pink-500"}
]', 'JSON', 'HOME', 'Hero Slides', 1),

-- HOME - Features
('HOME_FEATURES', '[
    {"icon":"👨‍⚕️","title":"Đội ngũ bác sĩ giỏi","desc":"Hàng trăm bác sĩ chuyên môn cao, giàu kinh nghiệm","color":"from-blue-500 to-cyan-500"},
    {"icon":"📅","title":"Đặt lịch dễ dàng","desc":"Chọn bác sĩ, chọn khung giờ, xác nhận trong tích tắc","color":"from-green-500 to-teal-500"},
    {"icon":"💊","title":"Kê đơn trực tuyến","desc":"Nhận đơn thuốc điện tử sau khi khám","color":"from-purple-500 to-pink-500"},
    {"icon":"🤖","title":"AI thông minh","desc":"Gợi ý chuyên khoa dựa trên triệu chứng","color":"from-orange-500 to-red-500"},
    {"icon":"🏥","title":"Đa dạng bệnh viện","desc":"Kết nối với hàng trăm bệnh viện trên toàn quốc","color":"from-indigo-500 to-blue-500"},
    {"icon":"⭐","title":"Đánh giá minh bạch","desc":"Xem đánh giá thực từ bệnh nhân khác","color":"from-yellow-500 to-amber-500"}
]', 'JSON', 'HOME', 'Tính năng', 2),

-- HOME - Stats
('HOME_STATS', '[
    {"value":"500+","label":"Bác sĩ","icon":"👨‍⚕️"},
    {"value":"50K+","label":"Bệnh nhân","icon":"👥"},
    {"value":"100+","label":"Bệnh viện","icon":"🏥"},
    {"value":"4.9","label":"Đánh giá","icon":"⭐"}
]', 'JSON', 'HOME', 'Thống kê', 3),

-- HOME - CTA
('HOME_CTA_TITLE', 'Sẵn sàng chăm sóc sức khỏe của bạn?', 'TEXT', 'HOME', 'CTA Title', 4),
('HOME_CTA_SUBTITLE', 'Đặt lịch ngay hôm nay để được tư vấn miễn phí', 'TEXT', 'HOME', 'CTA Subtitle', 5),
('HOME_CTA_BUTTON_TEXT', 'Đăng ký ngay', 'TEXT', 'HOME', 'CTA Button Text', 6),

-- CONTACT
('CONTACT_PHONE', '1900 1234', 'TEXT', 'CONTACT', 'Số điện thoại', 1),
('CONTACT_EMAIL', 'support@healthcareconnect.vn', 'TEXT', 'CONTACT', 'Email', 2),
('CONTACT_ADDRESS', '123 Nguyễn Huệ, Quận 1, TP.HCM', 'TEXT', 'CONTACT', 'Địa chỉ', 3),

-- SOCIAL
('SOCIAL_FACEBOOK', 'https://facebook.com/healthcareconnect', 'TEXT', 'SOCIAL', 'Facebook', 1),
('SOCIAL_ZALO', 'https://zalo.me/healthcareconnect', 'TEXT', 'SOCIAL', 'Zalo', 2),
('SOCIAL_YOUTUBE', 'https://youtube.com/healthcareconnect', 'TEXT', 'SOCIAL', 'YouTube', 3),
('SOCIAL_TIKTOK', 'https://tiktok.com/healthcareconnect', 'TEXT', 'SOCIAL', 'TikTok', 4),

-- FOOTER
('FOOTER_DESCRIPTION', 'Nền tảng kết nối bệnh nhân với bác sĩ hàng đầu, đặt lịch khám dễ dàng, tư vấn trực tuyến 24/7', 'TEXT', 'FOOTER', 'Mô tả footer', 1),
('FOOTER_COPYRIGHT', '© 2025 Healthcare Connect. Tất cả các quyền được bảo lưu.', 'TEXT', 'FOOTER', 'Copyright', 2);