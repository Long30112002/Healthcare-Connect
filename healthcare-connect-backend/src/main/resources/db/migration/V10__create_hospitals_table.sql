CREATE TABLE public.hospitals (
                                  id uuid DEFAULT gen_random_uuid() NOT NULL,
                                  name character varying(255) NOT NULL,
                                  address text NOT NULL,
                                  description text,
                                  image_url character varying(255),
                                  hotline character varying(20),
                                  manager_id uuid, -- ID của người đóng vai trò Hospital Manager
                                  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
                                  updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
                                  CONSTRAINT hospitals_pkey PRIMARY KEY (id),
                                  CONSTRAINT fk_hospital_manager FOREIGN KEY (manager_id) REFERENCES public.users(id)
);

-- Thêm cột nối bác sĩ với bệnh viện
ALTER TABLE public.doctors ADD COLUMN hospital_id uuid;

-- Thêm khóa ngoại
ALTER TABLE public.doctors
    ADD CONSTRAINT fk_doctor_hospital FOREIGN KEY (hospital_id) REFERENCES public.hospitals(id);

-- Ghi chú: Cột status hiện tại của Long là VARCHAR(50).
-- Chúng ta sẽ dùng các giá trị: 'SUBMITTED', 'VERIFIED_BY_HOSPITAL', 'ACTIVE', 'REJECTED'
