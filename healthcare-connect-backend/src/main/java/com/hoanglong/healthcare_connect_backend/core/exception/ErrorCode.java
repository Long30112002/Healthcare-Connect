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
    CANNOT_BOOK_WITH_SELF(1022, "Không đặt lịch của chính mình!", HttpStatus.FORBIDDEN),
    ONLY_PATIENT_OR_DOCTOR_CAN_BOOK(1023, "Chỉ bệnh nhân hoặc bác sĩ mới có thể đặt lịch!", HttpStatus.FORBIDDEN),
    TOKEN_REQUIRED(1024, "Yêu cầu token!", HttpStatus.FORBIDDEN),
    UNSUPPORTED_PAYMENT_METHOD(1025, "Phương thức thanh toán không được hỗ trợ!", HttpStatus.BAD_REQUEST),
    ADMIN_CANNOT_BE_RECEPTIONIST(1027, "Admin không thể đăng ký làm lễ tân!", HttpStatus.BAD_REQUEST),
    USER_ALREADY_HAS_ROLE(1028, "Người dùng đã có role!", HttpStatus.BAD_REQUEST),
    INVALID_OLD_PASSWORD(1029, "Mật khẩu cũ không chính xác!", HttpStatus.BAD_REQUEST),
    CANNOT_LOCK_ADMIN_ACCOUNT(1030, "Không thể khóa tài khoản Admin!", HttpStatus.BAD_REQUEST),

    // =============================================================================
    // 2xxx: NGƯỜI DÙNG (USER)
    // =============================================================================
    USER_EXISTED(2001, "Người dùng đã tồn tại!", HttpStatus.BAD_REQUEST),
    USER_NOT_FOUND(2002, "Không tìm thấy người dùng!", HttpStatus.NOT_FOUND),
    NAME_INVALID(2003, "Họ tên không được để trống!", HttpStatus.BAD_REQUEST),
    EMAIL_INVALID(2004, "Email không đúng định dạng!", HttpStatus.BAD_REQUEST),
    PASSWORD_INVALID(2005, "Mật khẩu phải có ít nhất 8 ký tự!", HttpStatus.BAD_REQUEST),
    EMAIL_REQUIRED(2006, "Email là bắt buộc!", HttpStatus.BAD_REQUEST),
    PASSWORD_REQUIRED(2007, "Mật khẩu là bắt buộc!", HttpStatus.BAD_REQUEST),
    PHONE_INVALID(2008, "Số điện thoại là bắt buộc!", HttpStatus.BAD_REQUEST),

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
    SYMPTOMS_TOO_LONG(3020, "Triệu chứng không được vượt quá 500 ký tự!", HttpStatus.BAD_REQUEST),
    SCHEDULE_ID_REQUIRED(3021, "Vui lòng chọn lịch khám!", HttpStatus.BAD_REQUEST),
    PAYMENT_METHOD_REQUIRED(3022, "Vui lòng chọn phương thức thanh toán!", HttpStatus.BAD_REQUEST),

    // =============================================================================
    // 4xxx: KHOA & CHUYÊN KHOA (DEPARTMENT & SPECIALTY)
    // =============================================================================
    DEPARTMENT_NOT_FOUND(4001, "Không tìm thấy khoa tương ứng!", HttpStatus.NOT_FOUND),
    DEPARTMENT_EXISTED(4002, "Tên khoa hoặc mã khoa đã tồn tại!", HttpStatus.BAD_REQUEST),
    SPECIALTY_NOT_FOUND(4003, "Không tìm thấy chuyên ngành!", HttpStatus.NOT_FOUND),
    SPECIALTY_EXISTED(4004, "Chuyên ngành đã tồn tại!", HttpStatus.BAD_REQUEST),
    SPECIALTY_CATEGORY_MISMATCH(4005, "Chuyên khoa không thuộc nhóm danh mục của Khoa này!", HttpStatus.BAD_REQUEST),
    INVALID_SPECIALTY_CODE(4006, "Mã chuyên khoa không khớp với mã khoa!", HttpStatus.BAD_REQUEST),
    DEPARTMENT_HAS_SPECIALTIES(4007, "Không thể xóa khoa vì đang có chuyên khoa trực thuộc!", HttpStatus.BAD_REQUEST),
    DEPARTMENT_CATEGORY_REQUIRED(4008, "Khoa chưa có danh mục, vui lòng cập nhật danh mục cho khoa trước!", HttpStatus.BAD_REQUEST),
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
    RECEPTIONIST_ALREADY_EXISTS(6021, "Bạn đã có hồ sơ receptionist!", HttpStatus.BAD_REQUEST),
    RECEPTIONIST_NOT_FOUND(6022, "Không tìm thấy hồ sơ receptionist!", HttpStatus.NOT_FOUND),
    RECEPTIONIST_WRONG_STATUS(6023, "Trạng thái hồ sơ không phù hợp!", HttpStatus.BAD_REQUEST),
    RECEPTIONIST_ALREADY_APPROVED(6024, "Hồ sơ đã được duyệt!", HttpStatus.BAD_REQUEST),
    RECEPTIONIST_NO_HOSPITAL(6025, "Receptionist chưa được gán bệnh viện!", HttpStatus.BAD_REQUEST),
    HOSPITAL_NOT_ACTIVE(6026, "Bệnh viện chưa được kích hoạt!", HttpStatus.BAD_REQUEST),
    RECEPTIONIST_ALREADY_VERIFIED(6027, "Hồ sơ lễ tân đã được xác thực!", HttpStatus.BAD_REQUEST),
    RECEPTIONIST_ALREADY_REJECTED(6028, "Hồ sơ lễ tân đã bị từ chối!", HttpStatus.BAD_REQUEST),
    RECEPTIONIST_NOT_VERIFIED_YET(6029, "Hồ sơ lễ tân chưa được xác thực!", HttpStatus.BAD_REQUEST),
    INVALID_RECEPTIONIST_STATUS(6030, "Trạng thái hồ sơ lễ tân không hợp lệ!", HttpStatus.BAD_REQUEST),
    RECEPTIONIST_PROFILE_PENDING_OR_VERIFIED(6031, "Hồ sơ lễ tân đang trong quá trình xét duyệt, không thể gửi lại!", HttpStatus.BAD_REQUEST),
    DOCTOR_CANNOT_BE_RECEPTIONIST(6033, "Bác sĩ không thể đăng ký làm lễ tân!", HttpStatus.BAD_REQUEST),
    MANAGER_CANNOT_BE_RECEPTIONIST(6034, "Quản lý bệnh viện không thể đăng ký làm lễ tân!", HttpStatus.BAD_REQUEST),
    ALREADY_RECEPTIONIST(6035, "Bạn đã là lễ tân!", HttpStatus.BAD_REQUEST),
    ADMIN_CANNOT_BE_DOCTOR(6036, "Admin không thể đăng ký làm bác sĩ!", HttpStatus.BAD_REQUEST),
    ALREADY_DOCTOR(6037, "Bạn đã là bác sĩ!", HttpStatus.BAD_REQUEST),
    MANAGER_CANNOT_BE_DOCTOR(6038, "Quản lý bệnh viện không thể đăng ký làm bác sĩ!", HttpStatus.BAD_REQUEST),
    RECEPTIONIST_CANNOT_BE_DOCTOR(6039, "Lễ tân không thể đăng ký làm bác sĩ!", HttpStatus.BAD_REQUEST),
    DOCTOR_NOT_IN_HOSPITAL(6040, "Bác sĩ không thuộc bệnh viện của bạn!", HttpStatus.BAD_REQUEST),
    MEDICINE_NOT_IN_HOSPITAL(6041, "Loại thuốc này không có ở bệnh viện!", HttpStatus.BAD_REQUEST),
    PHONE_TOO_LONG(6042, "Số điện thoại không hợp lệ!", HttpStatus.BAD_REQUEST),
    WEBSITE_TOO_LONG(6043, "Website không hợp lệ!", HttpStatus.BAD_REQUEST),
    RECEPTIONIST_NOT_IN_HOSPITAL(6033, "Lễ tân không thuộc bệnh viện này!", HttpStatus.FORBIDDEN),
    CANNOT_DELETE_HOSPITAL_HAS_DOCTORS(6032, "Không thể xóa bệnh viện vì đang có bác sĩ hoạt động!", HttpStatus.BAD_REQUEST),
    HOSPITAL_ALREADY_HAS_MANAGER(6033, "Bệnh viện này đã có quản lý!", HttpStatus.BAD_REQUEST),
    NO_INVITATION_EMAIL(6034, "Bệnh viện này chưa có email mời quản lý!", HttpStatus.BAD_REQUEST),

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
    SCHEDULE_ALREADY_PASSED(7024, "Lịch khám này đã quá giờ, không thể đặt!", HttpStatus.BAD_REQUEST),
    INVALID_CHECKIN_STATUS(7025, "Không thể check-in với trạng thái hiện tại!", HttpStatus.BAD_REQUEST),
    WRONG_CHECKIN_DATE(7026, "Chỉ có thể check-in trong ngày khám!", HttpStatus.BAD_REQUEST),
    INVALID_COMPLETE_STATUS(7027, "Không thể hoàn thành khi chưa check-in!", HttpStatus.BAD_REQUEST),
    ALREADY_CHECKED_IN(7028, "Lịch hẹn này đã được check-in trước đó", HttpStatus.BAD_REQUEST),
    CHECKIN_TIME_INVALID(7029, "Chỉ có thể check-in trong khung giờ cho phép (30 phút trước đến 30 phút sau giờ khám)", HttpStatus.BAD_REQUEST),
    QR_CODE_EXPIRED(7030, "Mã QR đã hết hạn sử dụng", HttpStatus.BAD_REQUEST),
    WALK_IN_SCHEDULE_FULL(7031, "Lịch khám đã hết chỗ!", HttpStatus.BAD_REQUEST),
    APPOINTMENT_NOT_COMPLETED(7040, "Lịch hẹn chưa được hoàn thành, không thể tạo bệnh án!",HttpStatus.BAD_REQUEST),

    // 71xx: BỆNH ÁN & TOA THUỐC (MEDICAL RECORD & PRESCRIPTION) - Tách riêng để tránh trùng 70xx
    MEDICAL_RECORD_ALREADY_EXISTS(7101, "Bệnh án đã tồn tại cho lịch hẹn này!", HttpStatus.BAD_REQUEST),
    MEDICAL_RECORD_NOT_FOUND(7102, "Không tìm thấy bệnh án!", HttpStatus.NOT_FOUND),
    APPOINTMENT_ID_REQUIRED(7103, "Vui lòng chọn lịch hẹn!", HttpStatus.BAD_REQUEST),
    DIAGNOSIS_REQUIRED(7104, "Vui lòng nhập chẩn đoán!", HttpStatus.BAD_REQUEST),
    DIAGNOSIS_LENGTH_INVALID(7105, "Chẩn đoán phải từ 3 đến 500 ký tự!", HttpStatus.BAD_REQUEST),
    NOTES_TOO_LONG(7106, "Ghi chú không được vượt quá 2000 ký tự!", HttpStatus.BAD_REQUEST),
    FOLLOW_UP_DATE_INVALID(7107, "Ngày tái khám phải là hôm nay hoặc sau này!", HttpStatus.BAD_REQUEST),
    BLOOD_PRESSURE_INVALID(7108, "Chỉ số huyết áp không hợp lệ! (VD: 120/80)", HttpStatus.BAD_REQUEST),
    HEART_RATE_TOO_LOW(7109, "Nhịp tim quá thấp (phải >= 30)", HttpStatus.BAD_REQUEST),
    HEART_RATE_TOO_HIGH(7110, "Nhịp tim quá cao (phải <= 200)", HttpStatus.BAD_REQUEST),
    TEMPERATURE_TOO_LOW(7111, "Nhiệt độ quá thấp (phải >= 34°C)", HttpStatus.BAD_REQUEST),
    TEMPERATURE_TOO_HIGH(7112, "Nhiệt độ quá cao (phải <= 42°C)", HttpStatus.BAD_REQUEST),
    WEIGHT_TOO_LOW(7113, "Cân nặng quá thấp (phải >= 2kg)", HttpStatus.BAD_REQUEST),
    WEIGHT_TOO_HIGH(7114, "Cân nặng quá cao (phải <= 300kg)", HttpStatus.BAD_REQUEST),
    HEIGHT_TOO_LOW(7115, "Chiều cao quá thấp (phải >= 30cm)", HttpStatus.BAD_REQUEST),
    HEIGHT_TOO_HIGH(7116, "Chiều cao quá cao (phải <= 250cm)", HttpStatus.BAD_REQUEST),
    MEDICINE_ID_REQUIRED(7117, "Vui lòng chọn thuốc!", HttpStatus.BAD_REQUEST),
    QUANTITY_REQUIRED(7118, "Vui lòng nhập số lượng!", HttpStatus.BAD_REQUEST),
    QUANTITY_MIN(7119, "Số lượng thuốc phải >= 1!", HttpStatus.BAD_REQUEST),
    QUANTITY_MAX(7120, "Số lượng thuốc phải <= 1000!", HttpStatus.BAD_REQUEST),
    DOSAGE_REQUIRED(7121, "Vui lòng nhập liều dùng!", HttpStatus.BAD_REQUEST),
    DOSAGE_TOO_LONG(7122, "Liều dùng không được vượt quá 100 ký tự!", HttpStatus.BAD_REQUEST),
    FREQUENCY_TOO_LONG(7123, "Tần suất không được vượt quá 100 ký tự!", HttpStatus.BAD_REQUEST),
    DURATION_MIN(7124, "Số ngày dùng thuốc phải >= 1!", HttpStatus.BAD_REQUEST),
    DURATION_MAX(7125, "Số ngày dùng thuốc phải <= 365!", HttpStatus.BAD_REQUEST),
    INSTRUCTIONS_TOO_LONG(7126, "Hướng dẫn không được vượt quá 500 ký tự!", HttpStatus.BAD_REQUEST),
    PRESCRIPTION_ITEMS_EMPTY(7127, "Đơn thuốc không được để trống!", HttpStatus.BAD_REQUEST),
    MEDICINE_NOT_FOUND(7128, "Không tìm thấy thuốc!", HttpStatus.NOT_FOUND),
    INSUFFICIENT_STOCK(7129, "Số lượng thuốc trong kho không đủ!", HttpStatus.BAD_REQUEST),
    SCHEDULE_HAS_BOOKINGS(7030, "Không thể xóa lịch đã có bệnh nhân đặt!", HttpStatus.BAD_REQUEST),

    // =============================================================================
    // 8xxx: THANH TOÁN (PAYMENT)
    // =============================================================================
    PAYMENT_ERROR(8001, "Thanh toán không thành công!", HttpStatus.BAD_REQUEST),
    REFUND_FAILED(8002, "Hoàn tiền thất bại!", HttpStatus.BAD_REQUEST),
    PAYMENT_NOT_FOUND(8003, "Không tìm thấy mục thanh toán!", HttpStatus.NOT_FOUND),
    PAYMENT_ALREADY_PROCESSED(8004, "Thanh toán đã được xử lý!", HttpStatus.BAD_REQUEST),
    PAYMENT_ALREADY_REFUNDED(8006, "Giao dịch này đã được hoàn tiền trước đó!", HttpStatus.BAD_REQUEST),
    REFUND_METHOD_MISMATCH(8007, "Phương thức hoàn tiền không khớp với phương thức thanh toán!", HttpStatus.BAD_REQUEST),
    REFUND_AMOUNT_EXCEEDS_PAYMENT(8008, "Số tiền hoàn không được vượt quá số tiền đã thanh toán!", HttpStatus.BAD_REQUEST),
    REFUND_AMOUNT_INVALID(8009, "Số tiền hoàn không hợp lệ!", HttpStatus.BAD_REQUEST),
    MOMO_REFUND_AMOUNT_MUST_BE_FULL(8010, "Số tiền hoàn của momo không đẩy đủ!", HttpStatus.BAD_REQUEST),
    MOMO_REFUND_NO_MANUAL_AMOUNT(8011, "Hoàn tiền qua MOMO không được nhập số tiền thủ công! Hệ thống sẽ tự động hoàn 100%.", HttpStatus.BAD_REQUEST),
    MEDICINE_ALREADY_EXISTS(8012, "Mã thuốc đã tồn tại!", HttpStatus.BAD_REQUEST),
    MEDICINE_EXPIRED(8013, "Thuốc đã hết hạn sử dụng!", HttpStatus.BAD_REQUEST),
    MEDICINE_OUT_OF_STOCK(8014, "Thuốc đã hết hàng!", HttpStatus.BAD_REQUEST),
    MEDICINE_CODE_INVALID(8015, "Mã thuốc không hợp lệ!", HttpStatus.BAD_REQUEST),
    MEDICINE_NAME_INVALID(8016, "Tên thuốc không hợp lệ!", HttpStatus.BAD_REQUEST),
    MEDICINE_ALREADY_EXISTS_IN_HOSPITAL(8006, "Mã thuốc đã tồn tại trong bệnh viện của bạn!", HttpStatus.BAD_REQUEST),
    TIME_REQUIRED(8001, "Thời gian bắt đầu và kết thúc là bắt buộc!", HttpStatus.BAD_REQUEST),
    INVALID_WORKING_HOURS(8002, "Giờ bắt đầu phải trước giờ kết thúc!", HttpStatus.BAD_REQUEST),
    INVALID_LUNCH_TIME(8003, "Giờ bắt đầu nghỉ trưa phải trước giờ kết thúc nghỉ trưa!", HttpStatus.BAD_REQUEST),
    LUNCH_OUTSIDE_WORKING_HOURS(8004, "Giờ nghỉ trưa phải nằm trong khung giờ làm việc!", HttpStatus.BAD_REQUEST),
    INVALID_SLOT_DURATION(8005, "Thời lượng ca tối thiểu phải nhỏ hơn thời lượng ca tối đa!", HttpStatus.BAD_REQUEST),
    MIN_SLOT_TOO_SMALL(8006, "Thời lượng ca tối thiểu phải từ 5 phút trở lên!", HttpStatus.BAD_REQUEST),
    MAX_SLOT_TOO_LARGE(8007, "Thời lượng ca tối đa không được vượt quá 240 phút (4 tiếng)!", HttpStatus.BAD_REQUEST),
    INVALID_DAY_OF_WEEK(8008, "Ngày trong tuần không hợp lệ (phải từ 2 đến 8)!", HttpStatus.BAD_REQUEST),
    WORKING_HOURS_NOT_CONFIGURED(8009, "Bệnh viện chưa cấu hình giờ làm việc cho ngày này!", HttpStatus.BAD_REQUEST),
    SCHEDULE_OUTSIDE_WORKING_HOURS(8010, "Giờ khám nằm ngoài khung giờ làm việc của bệnh viện!", HttpStatus.BAD_REQUEST),
    SCHEDULE_LUNCH_BREAK(8011, "Không thể tạo lịch vào giờ nghỉ trưa!", HttpStatus.BAD_REQUEST),
    SCHEDULE_TOO_SHORT(8012, "Thời gian mỗi ca khám quá ngắn (tối thiểu {min} phút)!", HttpStatus.BAD_REQUEST),
    SCHEDULE_TOO_LONG(8013, "Thời gian mỗi ca khám quá dài (tối đa {max} phút)!", HttpStatus.BAD_REQUEST),

    // =============================================================================
    // 9xxx: PHÒNG KHÁM (ROOM)
    // =============================================================================
    ROOM_NOT_FOUND(9001, "Không tìm thấy phòng khám", HttpStatus.NOT_FOUND),
    ROOM_ALREADY_EXISTS(9002, "Số phòng đã tồn tại", HttpStatus.BAD_REQUEST),
    ROOM_IS_OCCUPIED(9003, "Phòng đang được sử dụng", HttpStatus.BAD_REQUEST),
    ROOM_NOT_AVAILABLE(9004, "Phòng không khả dụng", HttpStatus.BAD_REQUEST),
    ROOM_NOT_DELETED(9005, "Phòng chưa bị xóa", HttpStatus.BAD_REQUEST),
    REVIEW_NOT_FOUND(9006, "Không tìm thấy đánh giá!", HttpStatus.NOT_FOUND),
    REVIEW_ALREADY_EXISTS(9007, "Bạn đã đánh giá lịch hẹn này rồi!", HttpStatus.BAD_REQUEST),
    REVIEW_EXPIRED(9008, "Đã quá 30 ngày kể từ khi khám, không thể đánh giá!", HttpStatus.BAD_REQUEST),
    REVIEW_CANNOT_EDIT(9009, "Đã quá 7 ngày kể từ khi đánh giá, không thể chỉnh sửa!", HttpStatus.BAD_REQUEST),
    REVIEW_ALREADY_DELETED(9010, "Đánh giá này đã bị xóa trước đó!", HttpStatus.BAD_REQUEST),
    REVIEW_NOT_DELETED(9011, "Đánh giá này chưa bị xóa!", HttpStatus.BAD_REQUEST),
    ROOM_ALREADY_BOOKED(9012, "Phòng khám đã được đặt vào khung giờ này!", HttpStatus.BAD_REQUEST),
    ROOM_HAS_FUTURE_SCHEDULES(9013, "Phòng đã có lịch hẹn trong tương lai, không thể bảo trì!", HttpStatus.BAD_REQUEST),

    // =============================================================================
    // 10xxx: HỆ THỐNG (SYSTEM)
    // =============================================================================
    CONFIG_NOT_FOUND(10000, "Không tìm thấy cấu hình hệ thống!", HttpStatus.NOT_FOUND),
    CONFIG_ALREADY_EXISTS(10002, "Cấu hình đã tồn tại!", HttpStatus.BAD_REQUEST),
    CONFIG_VALUE_REQUIRED(10003, "Giá trị cấu hình không được để trống!", HttpStatus.BAD_REQUEST),
    CONFIG_KEY_INVALID(10004, "Key cấu hình không hợp lệ!", HttpStatus.BAD_REQUEST),
    CONFIG_GROUP_INVALID(10005, "Nhóm cấu hình không hợp lệ!", HttpStatus.BAD_REQUEST),
    FILE_REQUIRED(10006, "Vui lòng chọn file để upload!", HttpStatus.BAD_REQUEST),
    FILE_UPLOAD_FAILED(10007, "Upload file thất bại!", HttpStatus.INTERNAL_SERVER_ERROR),
    FILE_TOO_LARGE(10008, "Kích thước file vượt quá giới hạn cho phép!", HttpStatus.BAD_REQUEST),
    FILE_INVALID_TYPE(10009, "Định dạng file không được hỗ trợ!", HttpStatus.BAD_REQUEST),
    FILE_EXPORT_FAILED(10010, "Xuất file thất bại!", HttpStatus.INTERNAL_SERVER_ERROR),
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