package com.hoanglong.healthcare_connect_backend.core.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

@Getter
public enum ErrorCode {
    USER_EXISTED(400, "Người dùng đã tồn tại!", HttpStatus.BAD_REQUEST),
    USER_NOT_FOUND(404, "Không tìm thấy người dùng!", HttpStatus.NOT_FOUND),
    SPECIALTY_NOT_FOUND(404, "Không tìm thấy chuyên ngành!", HttpStatus.NOT_FOUND),
    UNCATEGORIZED_EXCEPTION(500, "Lỗi hệ thống chưa xác định!", HttpStatus.INTERNAL_SERVER_ERROR),
    INVALID_KEY(400, "Lỗi không xác định!", HttpStatus.BAD_REQUEST),
    UNAUTHORIZED(401, "Bạn không có quyền truy cập!", HttpStatus.UNAUTHORIZED),
    NAME_INVALID(400, "Họ tên không được để trống!", HttpStatus.BAD_REQUEST),
    EMAIL_INVALID(400, "Email không đúng định dạng!", HttpStatus.BAD_REQUEST),
    PASSWORD_INVALID(400, "Mật khẩu phải có ít nhất 8 ký tự!", HttpStatus.BAD_REQUEST),
    TOKEN_CREATION_FAILED(400, "Tạo token thất bại!", HttpStatus.BAD_REQUEST),
    DEPARTMENT_EXISTED(400, "Tên khoa hoặc mã khoa đã tồn tại!", HttpStatus.BAD_REQUEST),
    SPECIALTY_EXISTED(400, "Chuyên ngành đã tồn tại!", HttpStatus.BAD_REQUEST),
    INVALID_SPECIALTY_CODE(1009, "Mã chuyên khoa không khớp với mã khoa", HttpStatus.BAD_REQUEST),
    INVALID_CREDENTIALS(1005, "Thông tin không chính xác, hãy kiểm tra lại", HttpStatus.UNAUTHORIZED),
    TOO_MANY_REQUESTS(1010, "Bạn thao tác quá nhanh. Vui lòng thử lại sau giây lát.", HttpStatus.TOO_MANY_REQUESTS),
    DATA_CONSTRAINT_VIOLATION(409, "Dữ liệu đang được ràng buộc, không thể thực hiện hành động này!", HttpStatus.CONFLICT),
    DATA_NOT_FOUND(404, "Dữ liệu không tồn tại trong hệ thống", HttpStatus.NOT_FOUND),
    // Trong file ErrorCode.java
    SPECIALTY_CATEGORY_MISMATCH(400, "Chuyên khoa không thuộc nhóm danh mục của Khoa này!", HttpStatus.BAD_REQUEST),
    DEPARTMENT_NOT_FOUND(404, "Không tìm thấy khoa tương ứng!", HttpStatus.NOT_FOUND);
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