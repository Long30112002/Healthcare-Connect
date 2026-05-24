CREATE TABLE hospital_working_hours (
                                        id UUID PRIMARY KEY,
                                        hospital_id UUID NOT NULL REFERENCES hospitals(id),
                                        day_of_week INTEGER NOT NULL,      -- 2=Thứ 3, 3=Thứ 4, ..., 8=Chủ nhật (tuỳ cách đánh số)
                                        start_time TIME NOT NULL,          -- Giờ bắt đầu làm việc
                                        end_time TIME NOT NULL,            -- Giờ kết thúc làm việc
                                        lunch_start TIME,                  -- Giờ bắt đầu nghỉ trưa (có thể NULL nếu không nghỉ)
                                        lunch_end TIME,                    -- Giờ kết thúc nghỉ trưa
                                        min_slot_minutes INTEGER DEFAULT 15,   -- Thời lượng ca tối thiểu (phút)
                                        max_slot_minutes INTEGER DEFAULT 120,  -- Thời lượng ca tối đa (phút)
                                        is_active BOOLEAN DEFAULT true,
                                        created_at TIMESTAMP,
                                        updated_at TIMESTAMP
);

