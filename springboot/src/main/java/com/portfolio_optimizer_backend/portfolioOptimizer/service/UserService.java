package com.portfolio_optimizer_backend.portfolioOptimizer.service;

import com.portfolio_optimizer_backend.portfolioOptimizer.dto.LoginRequest;
import com.portfolio_optimizer_backend.portfolioOptimizer.dto.RegisterRequest;
import com.portfolio_optimizer_backend.portfolioOptimizer.entity.User;
import com.portfolio_optimizer_backend.portfolioOptimizer.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {
    @Autowired private UserRepository userRepo;
    @Autowired private PasswordEncoder encoder;

    public boolean userExists(String username) {
        return userRepo.findByUsername(username).isPresent();
    }

    public User registerUser(RegisterRequest req, String otp) {
        User u = new User();
        u.setUsername(req.getUsername());
        u.setPassword(encoder.encode(req.getPassword()));
        u.setEmail(req.getEmail());
        u.setPhone(req.getPhone());
        u.setOtp(otp);
        u.setVerified(false);
        return userRepo.save(u);
    }

    public User authenticate(LoginRequest req) {
        User u = userRepo.findByUsername(req.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (!encoder.matches(req.getPassword(), u.getPassword()))
            throw new RuntimeException("Invalid password");
        if (!req.getOtp().equals(u.getOtp()))
            throw new RuntimeException("Invalid OTP");
        u.setVerified(true);
        return userRepo.save(u);
    }
}
