package com.hoanglong.healthcare_connect_backend.shared.annotation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface Throttling {
    int limit() default 5;      // Số lần tối đa
    int duration() default 60;  // Trong khoảng thời gian (giây)
}
