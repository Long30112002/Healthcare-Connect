ALTER TABLE hospitals
    ADD CONSTRAINT uc_manager_unique UNIQUE (manager_id);
ALTER TABLE hospitals ALTER COLUMN manager_id SET NOT NULL;