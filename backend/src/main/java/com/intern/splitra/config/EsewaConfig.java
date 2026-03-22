package com.intern.splitra.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Data
@Component
@ConfigurationProperties(prefix = "esewa")
public class EsewaConfig {
    private String merchantId;
    private String successUrl;
    private String failureUrl;
    private String paymentUrl;
    private String verifyUrl;
}