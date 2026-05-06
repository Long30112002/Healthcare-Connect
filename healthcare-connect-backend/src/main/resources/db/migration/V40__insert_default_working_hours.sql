-- Thứ 2 (day_of_week = 2) đến Thứ 6 (day_of_week = 6)
INSERT INTO hospital_working_hours (id, hospital_id, day_of_week, start_time, end_time, lunch_start, lunch_end, min_slot_minutes, max_slot_minutes)
SELECT
    gen_random_uuid(),
    h.id,
    days.day,
    '07:30'::TIME,
    '17:00'::TIME,
    '12:00'::TIME,
    '13:30'::TIME,
    15,
    120
FROM hospitals h
         CROSS JOIN (VALUES (2), (3), (4), (5), (6)) AS days(day)
WHERE h.status = 'ACTIVE'
  AND NOT EXISTS (
    SELECT 1 FROM hospital_working_hours
    WHERE hospital_id = h.id AND day_of_week = days.day
);

-- Thứ 7 (day_of_week = 7) - chỉ làm sáng, không nghỉ trưa
INSERT INTO hospital_working_hours (id, hospital_id, day_of_week, start_time, end_time, lunch_start, lunch_end, min_slot_minutes, max_slot_minutes)
SELECT
    gen_random_uuid(),
    h.id,
    7,
    '07:30'::TIME,
    '12:00'::TIME,
    NULL,
    NULL,
    15,
    120
FROM hospitals h
WHERE h.status = 'ACTIVE'
  AND NOT EXISTS (
    SELECT 1 FROM hospital_working_hours
    WHERE hospital_id = h.id AND day_of_week = 7
);

-- Chủ nhật (day_of_week = 8) - làm ít giờ
INSERT INTO hospital_working_hours (id, hospital_id, day_of_week, start_time, end_time, lunch_start, lunch_end, min_slot_minutes, max_slot_minutes)
SELECT
    gen_random_uuid(),
    h.id,
    8,
    '08:00'::TIME,
    '11:00'::TIME,
    NULL,
    NULL,
    15,
    120
FROM hospitals h
WHERE h.status = 'ACTIVE'
  AND NOT EXISTS (
    SELECT 1 FROM hospital_working_hours
    WHERE hospital_id = h.id AND day_of_week = 8
);