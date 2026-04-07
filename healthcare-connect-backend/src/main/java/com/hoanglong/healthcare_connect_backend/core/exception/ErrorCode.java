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
    INVALID_CREDENTIALS(1005, "Thông tin không chính xác, hãy kiểm tra lại!", HttpStatus.UNAUTHORIZED),
    TOKEN_CREATION_FAILED(1006, "Tạo token thất bại!", HttpStatus.BAD_REQUEST),
    FORBIDDEN(1007, "Bạn không có quyền thực hiện hành động này!", HttpStatus.FORBIDDEN),
    TOO_MANY_REQUESTS(1010, "Bạn thao tác quá nhanh. Vui lòng thử lại sau giây lát!", HttpStatus.TOO_MANY_REQUESTS),
    UNAUTHENTICATED(1011, "Không xác thực được dữ liệu!", HttpStatus.BAD_REQUEST),
    INVALID_TOKEN(1012, "Mã xác nhận không hợp lệ!", HttpStatus.BAD_REQUEST),
    INVALID_VERIFICATION_CODE(1013, "Mã xác minh không hợp lệ!", HttpStatus.UNAUTHORIZED),
    VERIFICATION_CODE_EXPIRED(1014, "Mã xác minh đã hết hạn!", HttpStatus.UNAUTHORIZED),
    INVALID_ROLE_FOR_MANAGER(1015, "Vai trò không hợp lệ!", HttpStatus.UNAUTHORIZED),
    TOKEN_EXPIRED(1016, "Lời mời đã hết hạn!", HttpStatus.BAD_REQUEST),
    INVITATION_EMAIL_MISMATCH(1017, "Email của bạn không khớp với người được mời!", HttpStatus.BAD_REQUEST),
    USER_NOT_VERIFIED(1018, "Tài khoản chưa được xác thực email!", HttpStatus.UNAUTHORIZED),
    ADMIN_CANNOT_BE_MANAGER(1019, "Admin không thể trở thành Quản lý bệnh viện!", HttpStatus.FORBIDDEN),
    USER_ALREADY_MANAGER(1020, "Người dùng đã là Quản lý của một bệnh viện khác!", HttpStatus.BAD_REQUEST),
    ONLY_PATIENT_CAN_BOOK(1021, "Chỉ bệnh nhân mới có thể đặt lịch khám!", HttpStatus.FORBIDDEN),
    CANNOT_BOOK_WITH_SELF(1021, "Không đặt lịch của chính mình!", HttpStatus.FORBIDDEN),
    ONLY_PATIENT_OR_DOCTOR_CAN_BOOK(1026, "Chỉ bệnh nhân hoặc bác sĩ mới có thể đặt lịch!", HttpStatus.FORBIDDEN),

    // =============================================================================
    // 2xxx: NGƯỜI DÙNG (USER)
    // =============================================================================
    USER_EXISTED(2001, "Người dùng đã tồn tại!", HttpStatus.BAD_REQUEST),
    USER_NOT_FOUND(2002, "Không tìm thấy người dùng!", HttpStatus.NOT_FOUND),
    NAME_INVALID(2003, "Họ tên không được để trống!", HttpStatus.BAD_REQUEST),
    EMAIL_INVALID(2004, "Email không đúng định dạng!", HttpStatus.BAD_REQUEST),
    PASSWORD_INVALID(2005, "Mật khẩu phải có ít nhất 8 ký tự!", HttpStatus.BAD_REQUEST),


    // =============================================================================
    // 3xxx: VALIDATION (REQUEST VALIDATION)
    // =============================================================================
    DEGREE_REQUIRED(3001, "Vui lòng nhập bằng cấp chuyên môn!", HttpStatus.BAD_REQUEST),
    FEE_REQUIRED(3002, "Phí khám không được để trống!", HttpStatus.BAD_REQUEST),
    REQUIRED_CV(3003, "Vui lòng đính kèm file CV (PDF)!", HttpStatus.BAD_REQUEST),
    DEPARTMENT_ID_REQUIRED(3004, "Department ID không được để trống!", HttpStatus.BAD_REQUEST),
    SPECIALTY_ID_REQUIRED(3005, "Specialty ID không được để trống!", HttpStatus.BAD_REQUEST),
    HOSPITAL_ID_REQUIRED(3006, "Hospital ID không được để trống!", HttpStatus.BAD_REQUEST),
    EXPERIENCE_YEARS_INVALID(3007, "Số năm kinh nghiệm không hợp lệ!", HttpStatus.BAD_REQUEST),
    BIOGRAPHY_REQUIRED(3008, "Tiểu sử không được để trống!", HttpStatus.BAD_REQUEST),
    SPECIALTY_NOT_BELONG_TO_DEPARTMENT(3009, "Chuyên khoa này không thuộc khoa đã chọn!", HttpStatus.BAD_REQUEST),
    REASON_REQUIRED(3010, "Vui lòng chọn lý do từ chối!", HttpStatus.BAD_REQUEST),
    HOSPITAL_NAME_REQUIRED(3011, "Tên bệnh viện không được để trống!", HttpStatus.BAD_REQUEST),
    HOSPITAL_NAME_INVALID(3012, "Tên bệnh viện phải có ít nhất 2 ký tự!", HttpStatus.BAD_REQUEST),
    HOSPITAL_ADDRESS_REQUIRED(3013, "Địa chỉ bệnh viện không được để trống!", HttpStatus.BAD_REQUEST),
    HOSPITAL_ADDRESS_INVALID(3014, "Địa chỉ bệnh viện phải có ít nhất 5 ký tự!", HttpStatus.BAD_REQUEST),
    MANAGER_EMAIL_REQUIRED(3015, "Email quản lý không được để trống!", HttpStatus.BAD_REQUEST),
    DESCRIPTION_TOO_LONG(3016, "Mô tả không được vượt quá 2000 ký tự!", HttpStatus.BAD_REQUEST),
    IMAGE_URL_TOO_LONG(3017, "URL hình ảnh không được vượt quá 500 ký tự!", HttpStatus.BAD_REQUEST),

    // =============================================================================
    // 4xxx: KHOA & CHUYÊN KHOA (DEPARTMENT & SPECIALTY)
    // =============================================================================
    DEPARTMENT_NOT_FOUND(4001, "Không tìm thấy khoa tương ứng!", HttpStatus.NOT_FOUND),
    DEPARTMENT_EXISTED(4002, "Tên khoa hoặc mã khoa đã tồn tại!", HttpStatus.BAD_REQUEST),
    SPECIALTY_NOT_FOUND(4003, "Không tìm thấy chuyên ngành!", HttpStatus.NOT_FOUND),
    SPECIALTY_EXISTED(4004, "Chuyên ngành đã tồn tại!", HttpStatus.BAD_REQUEST),
    SPECIALTY_CATEGORY_MISMATCH(4005, "Chuyên khoa không thuộc nhóm danh mục của Khoa này!", HttpStatus.BAD_REQUEST),
    INVALID_SPECIALTY_CODE(4006, "Mã chuyên khoa không khớp với mã khoa!", HttpStatus.BAD_REQUEST),


    // =============================================================================
    // 5xxx: DỮ LIỆU CHUNG (GENERAL DATA)
    // =============================================================================
    DATA_NOT_FOUND(5001, "Dữ liệu không tồn tại trong hệ thống!", HttpStatus.NOT_FOUND),
    DATA_CONSTRAINT_VIOLATION(5002, "Luồng dữ liệu bị ràng buộc, thực hiện lại!", HttpStatus.CONFLICT),


    // =============================================================================
    // 6xxx: BỆNH VIỆN & BÁC SĨ (HOSPITAL & DOCTOR)
    // =============================================================================
    HOSPITAL_NOT_FOUND(6001, "Không tìm thấy bệnh viện tương ứng!", HttpStatus.NOT_FOUND),
    HOSPITAL_ALREADY_EXISTS(6002, "Bệnh viện này đã tồn tại!", HttpStatus.BAD_REQUEST),
    DOCTOR_PROFILE_EXISTED(6003, "Người dùng này đã có hồ sơ bác sĩ trên hệ thống!", HttpStatus.BAD_REQUEST),
    INVALID_APPROVE_STEP(6004, "Quy trình duyệt không đúng thứ tự (Cần Admin Verify trước)!", HttpStatus.BAD_REQUEST),
    ALREADY_APPROVED(6005, "Hồ sơ này đã được duyệt trước đó!", HttpStatus.BAD_REQUEST),
    NOT_HOSPITAL_MANAGER(6006, "Bạn không phải quản lý của bệnh viện này!", HttpStatus.FORBIDDEN),
    DOCTOR_NOT_FOUND(6007, "Không tìm thấy thông tin bác sĩ!", HttpStatus.NOT_FOUND),
    DOCTOR_NOT_AVAILABLE(6008, "Bác sĩ này chưa được phê duyệt hoặc không hoạt động!", HttpStatus.NOT_FOUND),
    DOCTOR_NO_HOSPITAL(6009, "Bác sĩ chưa được gán bệnh viện!", HttpStatus.BAD_REQUEST),
    HOSPITAL_NO_MANAGER(6010, "Bệnh viện chưa có quản lý!", HttpStatus.BAD_REQUEST),
    INVALID_REJECT_STEP(6011, "Không thể từ chối bác sĩ ở trạng thái hiện tại!", HttpStatus.BAD_REQUEST),
    MANAGER_NO_HOSPITAL(6012, "Bạn chưa được phân công quản lý bệnh viện nào!", HttpStatus.BAD_REQUEST),
    DOCTOR_ALREADY_VERIFIED(6013, "Bác sĩ này đã được xác thực!", HttpStatus.BAD_REQUEST),
    DOCTOR_ALREADY_APPROVED(6014, "Bác sĩ này đã được phê duyệt!", HttpStatus.BAD_REQUEST),
    DOCTOR_ALREADY_REJECTED(6015, "Bác sĩ này đã bị từ chối!", HttpStatus.BAD_REQUEST),
    DOCTOR_NOT_VERIFIED_YET(6016, "Bác sĩ chưa được xác thực!", HttpStatus.BAD_REQUEST),
    CANNOT_REJECT_VERIFIED(6017, "Bác sĩ đã được xác thực, vui lòng để Manager quyết định!", HttpStatus.BAD_REQUEST),
    DOCTOR_PROFILE_PENDING_OR_VERIFIED(6018, "Hồ sơ của bạn đang trong quá trình xét duyệt, không thể gửi lại!", HttpStatus.BAD_REQUEST),
    INVALID_DOCTOR_STATUS(6019, "Trạng thái không hợp lệ!", HttpStatus.BAD_REQUEST),
    DOCTOR_NOT_APPROVED(6020, "Bác sĩ chưa được phê duyệt, không thể tạo lịch khám!", HttpStatus.BAD_REQUEST),


    // =============================================================================
    // 7xxx: ĐẶT LỊCH & LỊCH KHÁM (BOOKING & SCHEDULE)
    // =============================================================================
    BOOKING_ALREADY_EXISTS(7001, "Lịch trình đã được đặt!", HttpStatus.BAD_REQUEST),
    BOOKING_NOT_FOUND(7002, "Không tìm thấy đơn đặt hàng!", HttpStatus.BAD_REQUEST),
    SCHEDULE_NOT_FOUND(7003, "Không tìm thấy lịch khám này!", HttpStatus.NOT_FOUND),
    SCHEDULE_NOT_AVAILABLE(7004, "Lịch khám hiện không sẵn sàng!", HttpStatus.BAD_REQUEST),
    SCHEDULE_FULL(7005, "Lịch khám đã đủ số lượng người đăng ký!", HttpStatus.BAD_REQUEST),
    PATIENT_HAS_OVERLAP_APPOINTMENT(7006, "Bạn đã có một lịch khám khác trong cùng khung giờ này!", HttpStatus.CONFLICT),
    APPOINTMENT_NOT_FOUND(7007, "Không tìm thấy thông tin cuộc hẹn!", HttpStatus.NOT_FOUND),
    APPOINTMENT_ALREADY_CANCELLED(7008, "Cuộc hẹn đã bị hủy!", HttpStatus.BAD_REQUEST),
    CANCEL_DEADLINE_PASSED(7009, "Thời gian hủy đã hết hạn!", HttpStatus.BAD_REQUEST),
    UPDATE_CONFIRM_ERROR(7010, "Cập nhật trạng thái xác nhận không thành công!", HttpStatus.BAD_REQUEST),
    CANNOT_CANCEL_PAST_APPOINTMENT(7011, "Không thể hủy lịch khi đang diễn ra!", HttpStatus.BAD_REQUEST),
    DATE_REQUIRED(7012, "Ngày khám không được để trống!", HttpStatus.BAD_REQUEST),
    START_TIME_REQUIRED(7013, "Giờ bắt đầu không được để trống!", HttpStatus.BAD_REQUEST),
    END_TIME_REQUIRED(7014, "Giờ kết thúc không được để trống!", HttpStatus.BAD_REQUEST),
    PRICE_INVALID(7015, "Giá khám không hợp lệ!", HttpStatus.BAD_REQUEST),
    MAX_PATIENTS_INVALID(7016, "Thông số patients không hợp lệ!", HttpStatus.BAD_REQUEST),
    SCHEDULE_DATE_IN_PAST(7017, "Không thể tạo lịch khám trong quá khứ!", HttpStatus.BAD_REQUEST),
    INVALID_SCHEDULE_TIME(7018, "Giờ kết thúc phải sau giờ bắt đầu!", HttpStatus.BAD_REQUEST),
    INVALID_MAX_PATIENTS(7019, "Số lượng bệnh nhân tối đa phải lớn hơn 0!", HttpStatus.BAD_REQUEST),
    INVALID_PRICE(7020, "Giá khám phải lớn hơn 0!", HttpStatus.BAD_REQUEST),
    SCHEDULE_OVERLAP(7021, "Lịch khám bị trùng với khung giờ đã có!", HttpStatus.BAD_REQUEST),
    SCHEDULE_CANCELLED(7022, "Lịch khám này đã bị hủy!", HttpStatus.BAD_REQUEST),
    BOOKING_TOO_LATE(7023, "Chỉ có thể đặt lịch trước giờ khám ít nhất 30 phút!", HttpStatus.BAD_REQUEST),
    SCHEDULE_ALREADY_PASSED(7024, "Lịch khám này đã qua giờ, không thể đặt!", HttpStatus.BAD_REQUEST),

    // =============================================================================
    // 8xxx: THANH TOÁN (PAYMENT)
    // =============================================================================
    PAYMENT_ERROR(8001, "Thanh toán không thành công!", HttpStatus.BAD_REQUEST),
    REFUND_FAILED(8002, "Hoàn tiền thất bại!", HttpStatus.BAD_REQUEST),
    PAYMENT_NOT_FOUND(8003, "Không tìm thấy mục thanh toán!", HttpStatus.NOT_FOUND),
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