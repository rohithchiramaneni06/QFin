package com.portfolio_optimizer_backend.portfolioOptimizer.service;

import org.springframework.context.annotation.Primary;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

import java.io.IOException;

@Service
@Primary
@Profile("test")
public class MockEmailService extends EmailService {

    @Override
    public void sendOtpEmail(String toEmail, String otp) throws IOException {
        // Mock implementation that doesn't actually send emails
        System.out.println("MOCK: Sending OTP " + otp + " to " + toEmail);
        // No actual email sending in tests
    }
}