package com.portfolio_optimizer_backend.portfolioOptimizer.dto;


import lombok.AllArgsConstructor;
import lombok.Data;


public class AuthResponse {
    public String getToken() {
        return token;
    }

    public AuthResponse() {
    }

    public void setToken(String token) {
        this.token = token;
    }

    public AuthResponse(String token) {
        this.token = token;
    }

    private String token;
}


