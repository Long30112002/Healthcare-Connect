ALTER TABLE hospitals
    ADD COLUMN IF NOT EXISTS email VARCHAR(255),
    ADD COLUMN IF NOT EXISTS website VARCHAR(255);

-- Comment
COMMENT ON COLUMN hospitals.email IS 'Email liên hệ của bệnh viện';
COMMENT ON COLUMN hospitals.website IS 'Website của bệnh viện';