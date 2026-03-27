package com.hoanglong.healthcare_connect_backend.application.service;

import com.hoanglong.healthcare_connect_backend.application.dto.*;
import com.hoanglong.healthcare_connect_backend.application.mapper.UserMapper;
import com.hoanglong.healthcare_connect_backend.core.entity.InvalidatedToken;
import com.hoanglong.healthcare_connect_backend.core.entity.User;
import com.hoanglong.healthcare_connect_backend.core.exception.AppException;
import com.hoanglong.healthcare_connect_backend.core.exception.ErrorCode;
import com.hoanglong.healthcare_connect_backend.core.repository.InvalidatedTokenRepository;
import com.hoanglong.healthcare_connect_backend.core.repository.UserRepository;
import com.hoanglong.healthcare_connect_backend.shared.annotation.Throttling;
import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.text.ParseException;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class AuthenticationService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;
    private final InvalidatedTokenRepository invalidatedTokenRepository;


    @Value("${jwt.signerKey}")
    protected String SIGNER_KEY;

    @Throttling(limit = 5, duration = 60) // 1 phút chỉ được sai pass 5 lần
    public LoginResponse authenticate(LoginRequest request) {
        // 1. Tìm user (Nếu không thấy thì trả về null chứ không ném lỗi ngay)
        var user = userRepository.findByEmail(request.getEmail()).orElse(null);

        // 2. KIỂM TRA TỔNG HỢP:
        if (user == null ||
                !passwordEncoder.matches(request.getPassword(), user.getPassword()) ||
                !Boolean.TRUE.equals(user.getEnabled())) {

            log.warn("Đăng nhập thất bại (Sai mail/pass/chưa verify) cho email: {}", request.getEmail());

            // LUÔN ném ra duy nhất 1 mã lỗi chung cho mọi trường hợp
            throw new AppException(ErrorCode.INVALID_CREDENTIALS);
        }

        // 3. Nếu lọt xuống đây nghĩa là MỌI THỨ ĐỀU ĐÚNG -> Tạo Token
        var accessToken = generateToken(user, 1);
        var refreshToken = generateToken(user, 720);

        return userMapper.toLoginResponse(user, accessToken, refreshToken);
    }

//    public AuthenticationResponse login(LoginRequest request) {
//        // 1. Tìm user theo email
//        var user = userRepository.findByEmail(request.getEmail()).orElse(null);
//
//        // 2. Kiểm tra tổng hợp (Dùng toán tử lười || để bảo mật)
//        // Nếu user null, hoặc pass không khớp, hoặc chưa enabled -> Đều là lỗi "Invalid Credentials"
//        if (user == null ||
//                !passwordEncoder.matches(request.getPassword(), user.getPassword()) ||
//                !Boolean.TRUE.equals(user.getEnabled())) {
//
//            // Luôn ném ra 1 lỗi duy nhất: "Email hoặc mật khẩu không chính xác"
//            throw new AppException(ErrorCode.INVALID_CREDENTIALS);
//        }
//
//        // 3. Nếu mọi thứ OK -> Tạo Token
//        String token = generateToken(user, 24);
//
//        return AuthenticationResponse.builder()
//                .token(token)
//                .authenticated(true)
//                .user(UserResponse.builder()
//                        .email(user.getEmail())
//                        .fullName(user.getFullName())
//                        .role(user.getRole())
//                        .build())
//                .build();
//    }

    private String generateToken(User user, int durationHours) {
        JWSHeader header = new JWSHeader(JWSAlgorithm.HS256);

        JWTClaimsSet jwtClaimsSet = new JWTClaimsSet.Builder()
                .subject(user.getEmail())
                .issuer("healthcare-connect-backend.com")
                .issueTime(new Date())
                .expirationTime(new Date(
                        Instant.now().plus(durationHours, ChronoUnit.HOURS).toEpochMilli()
                ))
                .jwtID(UUID.randomUUID().toString())
                .claim("role", user.getRole().name())
                .build();

        Payload payload = new Payload(jwtClaimsSet.toJSONObject());
        JWSObject jwsObject = new JWSObject(header, payload);

        try {
            jwsObject.sign(new MACSigner(SIGNER_KEY.getBytes()));
            return jwsObject.serialize();
        } catch (JOSEException e) {
            log.error("Lỗi tạo Token: ", e);
            throw new AppException(ErrorCode.TOKEN_CREATION_FAILED);
        }
    }

    public IntrospectResponse introspect(IntrospectRequest request) {
        var token = request.getToken();
        boolean isValid = true;

        try {
            // 1. Kiểm tra chữ ký (Signature)
            JWSVerifier verifier = new MACVerifier(SIGNER_KEY.getBytes());
            SignedJWT signedJWT = SignedJWT.parse(token);

            boolean verified = signedJWT.verify(verifier);

            // 2. Kiểm tra thời gian hết hạn (Expiration)
            Date expiryTime = signedJWT.getJWTClaimsSet().getExpirationTime();
            boolean isExpired = expiryTime.before(new Date());

            // Token chỉ hợp lệ khi: Chữ ký đúng VÀ Chưa hết hạn
            isValid = verified && !isExpired;

        } catch (JOSEException | ParseException e) {
            // Nếu Token bị sửa, nó sẽ nhảy vào đây
            log.warn("Token không hợp lệ hoặc bị giả mạo: {}", e.getMessage());
            isValid = false;
        }

        return IntrospectResponse.builder()
                .valid(isValid)
                .build();
    }

    // 1. Hàm verifyToken: Kiểm tra chữ ký và hạn dùng của Token
    private SignedJWT verifyToken(String token) throws JOSEException, ParseException {
        JWSVerifier verifier = new MACVerifier(SIGNER_KEY.getBytes());
        SignedJWT signedJWT = SignedJWT.parse(token);

        // Kiểm tra xem token có đúng chữ ký của mình không
        var verified = signedJWT.verify(verifier);

        // Kiểm tra xem token đã hết hạn chưa
        Date expiryTime = signedJWT.getJWTClaimsSet().getExpirationTime();

        if (!(verified && expiryTime.after(new Date()))) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        // Check thêm: Nếu token nằm trong Blacklist thì cũng không cho qua
        if (invalidatedTokenRepository.existsById(signedJWT.getJWTClaimsSet().getJWTID())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        return signedJWT;
    }

    // 2. Hàm Logout hoàn chỉnh
    public void logout(LogoutRequest request) throws ParseException, JOSEException {
        try {
            // Giải mã để lấy JTI và ExpiryTime
            var signToken = verifyToken(request.getToken());

            String jti = signToken.getJWTClaimsSet().getJWTID();
            Date expiryTime = signToken.getJWTClaimsSet().getExpirationTime();

            // Lưu vào bảng InvalidatedToken (Blacklist)
            InvalidatedToken invalidatedToken = InvalidatedToken.builder()
                    .id(jti)
                    .expiryTime(expiryTime)
                    .build();

            invalidatedTokenRepository.save(invalidatedToken);
            log.info("Token {} đã được vô hiệu hóa thành công", jti);
        } catch (AppException e) {
            log.warn("Token đã hết hạn hoặc không hợp lệ, không cần logout nữa.");
        }
    }
}
