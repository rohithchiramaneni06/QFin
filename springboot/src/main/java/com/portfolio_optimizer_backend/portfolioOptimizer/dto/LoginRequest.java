package com.portfolio_optimizer_backend.portfolioOptimizer.dto;

import lombok.Data;


public class LoginRequest {
    private String username;
    private String password;
    private String otp;

    public LoginRequest(String otp, String password, String username) {
        this.otp = otp;
        this.password = password;
        this.username = username;
    }

    public LoginRequest() {
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getOtp() {
        return otp;
    }

    public void setOtp(String otp) {
        this.otp = otp;
    }
}
