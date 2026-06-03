//package com.hoanglong.healthcare_connect_backend.application.service;
//
//import jakarta.annotation.PostConstruct;
//import lombok.RequiredArgsConstructor;
//import lombok.extern.slf4j.Slf4j;
//import org.springframework.beans.factory.annotation.Value;
//import org.springframework.http.HttpHeaders;
//import org.springframework.http.MediaType;
//import org.springframework.stereotype.Service;
//import org.springframework.web.reactive.function.client.WebClient;
//
//import java.util.ArrayList;
//import java.util.HashMap;
//import java.util.List;
//import java.util.Map;
//
//@Service
//@RequiredArgsConstructor
//@Slf4j
//public class BrevoMailService {
//
//    @Value("${brevo.api.key}")
//    private String apiKey;
//
//    private WebClient webClient;
//
//    @PostConstruct
//    public void init() {
//        this.webClient = WebClient.builder()
//                .baseUrl("https://api.brevo.com/v3")
//                .defaultHeader("api-key", apiKey)
//                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
//                .build();
//    }
//
//    public void sendEmail(String to, String subject, String htmlContent) {
//
//        Map<String, Object> request = new HashMap<>();
//
//        Map<String, Object> sender = new HashMap<>();
//        sender.put("name", "Healthcare Connect");
//        sender.put("email", "your_verified_email@domain.com");
//
//        List<Map<String, String>> toList = new ArrayList<>();
//        Map<String, String> recipient = new HashMap<>();
//        recipient.put("email", to);
//        toList.add(recipient);
//
//        request.put("sender", sender);
//        request.put("to", toList);
//        request.put("subject", subject);
//        request.put("htmlContent", htmlContent);
//
//        webClient.post()
//                .uri("/smtp/email")
//                .bodyValue(request)
//                .retrieve()
//                .bodyToMono(String.class)
//                .doOnSuccess(res -> log.info("Brevo email sent: {}", res))
//                .doOnError(err -> log.error("Brevo email error", err))
//                .block();
//    }
//}