package com.hoanglong.healthcare_connect_backend.application.dto.invitation;

import lombok.Data;
import java.util.UUID;

@Data
public class AcceptInvitationRequest {
    UUID hospitalId;
    String token;
}