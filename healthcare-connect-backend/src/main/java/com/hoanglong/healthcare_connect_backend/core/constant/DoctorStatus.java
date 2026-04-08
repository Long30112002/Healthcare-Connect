package com.hoanglong.healthcare_connect_backend.core.constant;

import lombok.Getter;

@Getter
public enum DoctorStatus {
    PENDING,    // 1. Mới nộp hồ sơ, chờ Admin kiểm tra bằng cấp
    VERIFIED,   // 2. Admin đã xác thực hồ sơ xong, chờ Bệnh viện tiếp nhận
    APPROVED,   // 3. Bệnh viện đã duyệt, bác sĩ chính thức hoạt động (Chốt Role)
    REJECTED,   // 4. Hồ sơ bị từ chối (bởi Admin hoặc Manager)
    INACTIVE,   // 5. Bác sĩ đã nghỉ việc hoặc bị khóa tài khoản
    ARCHIVED    // 6. Lưu trữ lại dữ liệu
}