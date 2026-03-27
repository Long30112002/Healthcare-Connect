CREATE TABLE invalidated_token (
                                   id VARCHAR(255) PRIMARY KEY, -- Đây là nơi lưu JTI của token
                                   expiry_time TIMESTAMP NOT NULL
);