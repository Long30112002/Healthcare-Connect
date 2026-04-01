package com.hoanglong.healthcare_connect_backend.infrastructure.messaging.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@Slf4j
public class RabbitMQConfig {

    // ================= MAIN =================
    public static final String QUEUE_NAME = "notification_queue";
    public static final String EXCHANGE_NAME = "notification_exchange";
    public static final String ROUTING_KEY = "notification_key";

    // ================= DLQ =================
    public static final String DLQ_NAME = "notification_dlq";
    public static final String DLX_NAME = "notification_dlx";
    public static final String DLQ_ROUTING_KEY = "notification_dlq_key";

    // ================= QUEUE =================
    @Bean
    public Queue notificationQueue() {
        return QueueBuilder.durable(QUEUE_NAME)
                .withArgument("x-dead-letter-exchange", DLX_NAME)
                .withArgument("x-dead-letter-routing-key", DLQ_ROUTING_KEY)
                .build();
    }

    @Bean
    public Queue deadLetterQueue() {
        return QueueBuilder.durable(DLQ_NAME).build();
    }

    // ================= EXCHANGE =================
    @Bean
    public TopicExchange notificationExchange() {
        return new TopicExchange(EXCHANGE_NAME);
    }

    @Bean
    public TopicExchange deadLetterExchange() {
        return new TopicExchange(DLX_NAME);
    }

    // ================= BINDING =================
    @Bean
    public Binding notificationBinding(
            @Qualifier("notificationQueue") Queue queue,
            @Qualifier("notificationExchange") TopicExchange exchange) {
        return BindingBuilder.bind(queue)
                .to(exchange)
                .with(ROUTING_KEY);
    }

    @Bean
    public Binding deadLetterBinding(
            @Qualifier("deadLetterQueue") Queue dlq,
            @Qualifier("deadLetterExchange") TopicExchange dlx) {
        return BindingBuilder.bind(dlq)
                .to(dlx)
                .with(DLQ_ROUTING_KEY);
    }

    // ================= OBJECT MAPPER =================
    @Bean
    public ObjectMapper objectMapper() {
        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
        return objectMapper;
    }

    // ================= MESSAGE CONVERTER =================
    @Bean
    public MessageConverter messageConverter(ObjectMapper objectMapper) {
        return new Jackson2JsonMessageConverter(objectMapper);
    }

    // ================= RABBIT TEMPLATE =================
    @Bean
    public RabbitTemplate rabbitTemplate(
            ConnectionFactory connectionFactory,
            MessageConverter messageConverter) {
        RabbitTemplate rabbitTemplate = new RabbitTemplate(connectionFactory);
        rabbitTemplate.setMessageConverter(messageConverter);
        rabbitTemplate.setMandatory(true);

        // Confirm Callback
        rabbitTemplate.setConfirmCallback((correlationData, ack, cause) -> {
            if (ack) {
                log.info("==> [RABBITMQ] Tin nhắn đã tới Exchange thành công.");
            } else {
                log.error("==> [RABBITMQ] Tin nhắn thất lạc! Lý do: {}", cause);
            }
        });

        // Return Callback
        rabbitTemplate.setReturnsCallback(returned -> {
            log.error("==> [RABBITMQ] Tin nhắn bị trả lại! Không tìm thấy Queue phù hợp.");
        });

        return rabbitTemplate;
    }
}