package com.hoanglong.healthcare_connect_backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@SpringBootApplication
@EnableScheduling
@EnableAsync
public class HealthcareConnectApplication
{
	public static void main(String[] args) {
		SpringApplication.run(HealthcareConnectApplication.class, args);
//		System.out.println(new BCryptPasswordEncoder().encode("password123"));
	}
}
