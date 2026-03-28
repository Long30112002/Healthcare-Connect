ALTER TABLE doctors
    ADD COLUMN rejection_reason VARCHAR(255),
    ADD COLUMN rejection_note TEXT;