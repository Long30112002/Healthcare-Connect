package com.hoanglong.healthcare_connect_backend.core.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

@Getter
public enum ErrorCode {
    // =============================================================================
    // 1xxx: HỆ THỐNG & BẢO MẬT (SYSTEM & AUTH)
    // =============================================================================
    UNCATEGORIZED_EXCEPTION(1000, "Lỗi hệ thống chưa xác định!", HttpStatus.INTERNAL_SERVER_ERROR),
    INVALID_KEY(1001, "Lỗi không xác định!", HttpStatus.BAD_REQUEST),
    UNAUTHORIZED(1002, "Bạn không có quyền truy cập!", HttpStatus.UNAUTHORIZED),
    INVALID_CREDENTIALS(1005, "Thông tin không chính xác, hãy kiểm tra lại", HttpStatus.UNAUTHORIZED),
    TOKEN_CREATION_FAILED(1006, "Tạo token thất bại!", HttpStatus.BAD_REQUEST),
    FORBIDDEN(1007, "Bạn không có quyền thực hiện hành động này!", HttpStatus.FORBIDDEN),
    TOO_MANY_REQUESTS(1010, "Bạn thao tác quá nhanh. Vui lòng thử lại sau giây lát!", HttpStatus.TOO_MANY_REQUESTS),
    UNAUTHENTICATED(1011, "Không xác thực được dữ liệu!", HttpStatus.BAD_REQUEST),
    INVALID_TOKEN(1012, "Mã xác nhận không hợp lệ!", HttpStatus.BAD_REQUEST),
    INVALID_VERIFICATION_CODE(1013, "Mã xác minh không hợp lệ!", HttpStatus.UNAUTHORIZED),
    VERIFICATION_CODE_EXPIRED(1014, "Mã xác minh đã hế hạn!", HttpStatus.UNAUTHORIZED),
    INVALID_ROLE_FOR_MANAGER(1015, "Vai trò không hợp lệ!", HttpStatus.UNAUTHORIZED),
    TOKEN_EXPIRED(1016, "Lời mời đã hết hạn!", HttpStatus.BAD_REQUEST),

    // =============================================================================
    // 2xxx: NGƯỜI DÙNG & VALIDATION (USER & VALIDATION)
    // =============================================================================
    USER_EXISTED(2001, "Người dùng đã tồn tại!", HttpStatus.BAD_REQUEST),
    USER_NOT_FOUND(2002, "Không tìm thấy người dùng!", HttpStatus.NOT_FOUND),
    NAME_INVALID(2003, "Họ tên không được để trống!", HttpStatus.BAD_REQUEST),
    EMAIL_INVALID(2004, "Email không đúng định dạng!", HttpStatus.BAD_REQUEST),
    PASSWORD_INVALID(2005, "Mật khẩu phải có ít nhất 8 ký tự!", HttpStatus.BAD_REQUEST),
    DEGREE_REQUIRED(2006, "Vui lòng nhập bằng cấp chuyên môn!", HttpStatus.BAD_REQUEST),
    FEE_REQUIRED(2007, "Phí khám không được để trống!", HttpStatus.BAD_REQUEST),
    BOOKING_ALREADY_EXISTS(2008, "Lịch trình đã được đặt!", HttpStatus.BAD_REQUEST),
    PAYMENT_ERROR(2009, "Thanh toán không thành công!", HttpStatus.BAD_REQUEST),
    BOOKING_NOT_FOUND(2010, "Không tìm thấy đơn đặt hàng!", HttpStatus.BAD_REQUEST),
    UPDATE_CONFIRM_ERROR(2011, "Cập nhật trạng thái xác nhận không thành công!", HttpStatus.BAD_REQUEST),

    // =============================================================================
    // 3xxx: KHOA & CHUYÊN KHOA (DEPARTMENT & SPECIALTY)
    // =============================================================================
    DEPARTMENT_NOT_FOUND(3001, "Không tìm thấy khoa tương ứng!", HttpStatus.NOT_FOUND),
    DEPARTMENT_EXISTED(3002, "Tên khoa hoặc mã khoa đã tồn tại!", HttpStatus.BAD_REQUEST),
    SPECIALTY_NOT_FOUND(3003, "Không tìm thấy chuyên ngành!", HttpStatus.NOT_FOUND),
    SPECIALTY_EXISTED(3004, "Chuyên ngành đã tồn tại!", HttpStatus.BAD_REQUEST),
    SPECIALTY_CATEGORY_MISMATCH(3005, "Chuyên khoa không thuộc nhóm danh mục của Khoa này!", HttpStatus.BAD_REQUEST),
    INVALID_SPECIALTY_CODE(3006, "Mã chuyên khoa không khớp với mã khoa!", HttpStatus.BAD_REQUEST),

    // =============================================================================
    // 4xxx: DỮ LIỆU CHUNG (GENERAL DATA)
    // =============================================================================
    DATA_NOT_FOUND(4001, "Dữ liệu không tồn tại trong hệ thống!", HttpStatus.NOT_FOUND),
    DATA_CONSTRAINT_VIOLATION(4002, "Dữ liệu đang được ràng buộc, không thể thực hiện hành động này!", HttpStatus.CONFLICT),

    // =============================================================================
    // 5xxx: NGHIỆP VỤ Y TẾ (HEALTHCARE BUSINESS LOGIC)
    // =============================================================================
    HOSPITAL_NOT_FOUND(5001, "Không tìm thấy bệnh viện tương ứng!", HttpStatus.NOT_FOUND),
    DOCTOR_PROFILE_EXISTED(5002, "Người dùng này đã có hồ sơ bác sĩ trên hệ thống!", HttpStatus.BAD_REQUEST),
    INVALID_APPROVE_STEP(5003, "Quy trình duyệt không đúng thứ tự (Cần Admin Verify trước)!", HttpStatus.BAD_REQUEST),
    ALREADY_APPROVED(5004, "Hồ sơ này đã được duyệt trước đó!", HttpStatus.BAD_REQUEST),
    NOT_HOSPITAL_MANAGER(5005, "Bạn không phải quản lý của bệnh viện này!", HttpStatus.FORBIDDEN),
    HOSPITAL_ALREADY_EXISTS(5006, "Bệnh viện này đã tồn tại!", HttpStatus.BAD_REQUEST),

    // =============================================================================
    // 6xxx: ĐẶT LỊCH & THANH TOÁN (BOOKING & PAYMENT)
    // =============================================================================
    SCHEDULE_NOT_FOUND(6001, "Không tìm thấy lịch khám này!", HttpStatus.NOT_FOUND),
    SCHEDULE_NOT_AVAILABLE(6002, "Lịch khám hiện không sẵn sàng!", HttpStatus.BAD_REQUEST),
    SCHEDULE_FULL(6003, "Lịch khám đã đủ số lượng người đăng ký!", HttpStatus.BAD_REQUEST),
    PATIENT_HAS_OVERLAP_APPOINTMENT(6004, "Bạn đã có một lịch khám khác trong cùng khung giờ này!", HttpStatus.CONFLICT),
    APPOINTMENT_NOT_FOUND(6005, "Không tìm thấy thông tin cuộc hẹn!", HttpStatus.NOT_FOUND),
    ;

    private final int code;
    private final String message;
    private final HttpStatusCode statusCode;

    ErrorCode(int code, String message, HttpStatusCode statusCode) {
        this.code = code;
        this.message = message;
        this.statusCode = statusCode;
    }
}