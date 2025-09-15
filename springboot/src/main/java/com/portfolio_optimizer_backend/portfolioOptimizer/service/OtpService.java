package com.portfolio_optimizer_backend.portfolioOptimizer.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.Random;

@Service
public class OtpService {

    private final EmailService emailService;

    @Autowired
    public OtpService(EmailService emailService) {
        this.emailService = emailService;
    }

    public String generateOtp() {
        // Generates a six-digit numeric OTP
        return String.valueOf(new Random().nextInt(900_000) + 100_000);
    }

    public void sendOtpEmail(String toEmail, String otp) {
        try {
            System.out.println("Sending OTP email to: " + otp);
            emailService.sendOtpEmail(toEmail, otp);
        } catch (IOException e) {
            System.err.println("Failed to send OTP email: " + e.getMessage());
            // Optionally log or rethrow if needed
        }
    }
}
