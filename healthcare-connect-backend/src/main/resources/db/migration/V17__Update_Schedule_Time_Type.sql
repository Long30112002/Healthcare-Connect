ALTER TABLE schedules
    ALTER COLUMN start_time TYPE TIMESTAMP
        USING (date::date + start_time::time);
ALTER TABLE schedules
    ALTER COLUMN end_time TYPE TIMESTAMP
        USING (date::date + end_time::time);
ALTER TABLE schedules
    ALTER COLUMN date TYPE TIMESTAMP;