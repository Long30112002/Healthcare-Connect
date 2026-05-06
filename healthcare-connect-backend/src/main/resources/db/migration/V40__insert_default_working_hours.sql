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
         CROSS JOIN (VALUES (2), (3), (4), (5), (6)) AS days(day)  -- Thứ 2 -> Thứ 6
WHERE h.status = 'ACTIVE';

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
WHERE h.status = 'ACTIVE';

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
WHERE h.status = 'ACTIVE';