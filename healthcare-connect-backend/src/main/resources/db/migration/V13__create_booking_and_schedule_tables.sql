-- 1. Xóa bảng cũ tránh xung đột
DROP TABLE IF EXISTS public.appointments CASCADE;

-- 2. Tạo bảng schedules
CREATE TABLE public.schedules (
                                  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                  doctor_id UUID NOT NULL,
                                  date DATE NOT NULL,
                                  start_time TIME NOT NULL,
                                  end_time TIME NOT NULL,
                                  max_patients INT NOT NULL DEFAULT 1,
                                  current_bookings INT NOT NULL DEFAULT 0,
                                  status VARCHAR(50) NOT NULL DEFAULT 'AVAILABLE',
                                  price DECIMAL(15, 2) NOT NULL,
                                  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                  CONSTRAINT fk_schedule_doctor FOREIGN KEY (doctor_id) REFERENCES public.doctors(id)
);

-- 3. Tạo bảng appointments
CREATE TABLE public.appointments (
                                     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                     patient_id UUID NOT NULL,
                                     schedule_id UUID NOT NULL,
                                     appointment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                     status VARCHAR(50) DEFAULT 'PENDING',
                                     symptoms TEXT,
                                     is_paid BOOLEAN DEFAULT FALSE,
                                     CONSTRAINT fk_appointment_patient FOREIGN KEY (patient_id) REFERENCES public.users(id),
                                     CONSTRAINT fk_appointment_schedule FOREIGN KEY (schedule_id) REFERENCES public.schedules(id)
);

-- 4. Index để truy vấn nhanh
CREATE INDEX idx_schedule_lookup ON public.schedules(doctor_id, date);