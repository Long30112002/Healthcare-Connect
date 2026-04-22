UPDATE appointments a
SET appointment_date = s.date
FROM schedules s
WHERE a.schedule_id = s.id
  AND a.appointment_date != s.date;

COMMENT ON COLUMN appointments.appointment_date IS 'Ngày khám thực tế (lấy từ schedule.date)';

