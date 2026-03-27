package com.hoanglong.healthcare_connect_backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class HealthcareConnectApplication
{
	public static void main(String[] args) {
		SpringApplication.run(HealthcareConnectApplication.class, args);
	}

}
