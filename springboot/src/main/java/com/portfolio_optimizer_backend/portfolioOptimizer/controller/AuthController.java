package com.portfolio_optimizer_backend.portfolioOptimizer.controller;

import com.portfolio_optimizer_backend.portfolioOptimizer.dto.AuthResponse;
import com.portfolio_optimizer_backend.portfolioOptimizer.dto.LoginRequest;
import com.portfolio_optimizer_backend.portfolioOptimizer.dto.RegisterRequest;
import com.portfolio_optimizer_backend.portfolioOptimizer.dto.VerifyOtpRequest;
import com.portfolio_optimizer_backend.portfolioOptimizer.entity.User;
import com.portfolio_optimizer_backend.portfolioOptimizer.repository.UserRepository;
import com.portfolio_optimizer_backend.portfolioOptimizer.security.JwtUtil;
import com.portfolio_optimizer_backend.portfolioOptimizer.service.OtpService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    @Autowired private UserRepository userRepo;
    @Autowired private OtpService otpService;
    @Autowired private JwtUtil jwtUtil;
    @Autowired private PasswordEncoder encoder;

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody RegisterRequest req, BindingResult result) {
        if (result.hasErrors()) {
            return ResponseEntity.badRequest().body("Invalid input: " + result.getFieldError().getDefaultMessage());
        }
        if (userRepo.findByUsername(req.getUsername()).isPresent()) {
            return ResponseEntity.badRequest().body("Username already exists");
        }
        if (userRepo.findByEmail(req.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Email already registered");
        }

        // Generate a random 6-digit OTP
        String otp = otpService.generateOtp();

        // Create user but don't save to DB yet - store in temporary cache
        User user = new User();
        user.setUsername(req.getUsername());
        user.setDob(req.getDob());
        user.setPhone(req.getPhone());
        user.setEmail(req.getEmail());
        user.setPassword(encoder.encode(req.getPassword()));
        user.setOtp(otp);
        user.setOtpGeneratedAt(LocalDateTime.now());
        user.setOtpExpired(false);
        user.setVerified(false);

        // Save user to DB but mark as unverified
        userRepo.save(user);
        
        // Send OTP to user's email
        otpService.sendOtpEmail(req.getEmail(), otp);

        Map<String, String> response = new HashMap<>();
        response.put("message", "OTP sent to your email");
        response.put("email", req.getEmail());
        return ResponseEntity.ok(response);

    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody VerifyOtpRequest request) {
        String username = request.getUsername();
        String otp = request.getOtp();

        Optional<User> userOpt = userRepo.findByUsername(username);
        if (userOpt.isEmpty()) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "User not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
        
        User user = userOpt.get();

        if (user.isVerified()) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "User already verified");
            return ResponseEntity.badRequest().body(response);
        }

        if (user.getOtpGeneratedAt().plusMinutes(5).isBefore(LocalDateTime.now())) {
            user.setOtpExpired(true);
            userRepo.save(user);
            Map<String, String> response = new HashMap<>();
            response.put("message", "OTP expired. Please request a new one.");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }

        if (user.getOtp().equals(otp)) {
            user.setVerified(true);
            user.setOtpExpired(false);
            userRepo.save(user);
            
            // Generate JWT token for the verified user
            String token = jwtUtil.generateToken(user.getUsername());
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "User verified successfully");
            response.put("token", token);
            return ResponseEntity.ok(response);
        }

        Map<String, String> response = new HashMap<>();
        response.put("message", "Invalid OTP");
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
    }

    @PostMapping("/resend-otp")
    public ResponseEntity<?> resendOtp(@RequestBody Map<String, String> payload) {
        String username = payload.get("username");

        Optional<User> userOpt = userRepo.findByUsername(username);
        if (userOpt.isEmpty()) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "User not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
        
        User user = userOpt.get();

        if (user.isVerified()) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "User already verified");
            return ResponseEntity.badRequest().body(response);
        }

        String newOtp = otpService.generateOtp();
        user.setOtp(newOtp);
        user.setOtpGeneratedAt(LocalDateTime.now());
        user.setOtpExpired(false);
        userRepo.save(user);

        otpService.sendOtpEmail(user.getEmail(), newOtp);
        Map<String, String> response = new HashMap<>();
        response.put("message", "New OTP sent to your email");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req) {
        Optional<User> userOpt = userRepo.findByUsername(req.getUsername());
        if (userOpt.isEmpty()) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Invalid username or password");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
        
        User user = userOpt.get();

        if (!encoder.matches(req.getPassword(), user.getPassword())) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Invalid username or password");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }

        if (!user.isVerified()) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Account not verified. Please verify your email first.");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }

        String token = jwtUtil.generateToken(user.getUsername());
        return ResponseEntity.ok(new AuthResponse(token));
    }
    
    @GetMapping("/test")
    public ResponseEntity<?> testEndpoint() {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Authentication service is working");
        response.put("timestamp", LocalDateTime.now());
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/validate-token")
    public ResponseEntity<?> validateToken(@RequestHeader("Authorization") String authHeader) {
        // Log the token validation request
        logger.info("Token validation request received");
        logger.debug("Auth header: {}", authHeader);
        
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            logger.warn("Invalid or missing Authorization header");
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("valid", false);
            errorResponse.put("message", "Invalid or missing token");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
        }
        
        String token = authHeader.substring(7);
        try {
            String username = jwtUtil.extractUsername(token);
            logger.info("Token belongs to user: {}", username);
            
            if (username != null && !jwtUtil.isTokenExpired(token)) {
                Optional<User> userOpt = userRepo.findByUsername(username);
                if (userOpt.isPresent()) {
                    logger.info("Token validation successful for user: {}", username);
                    Map<String, Object> response = new HashMap<>();
                    response.put("valid", true);
                    response.put("username", username);
                    response.put("timestamp", LocalDateTime.now());
                    return ResponseEntity.ok(response);
                }
            }
            
            logger.warn("Token validation failed: token expired or invalid");
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("valid", false);
            errorResponse.put("message", "Token expired or invalid");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
        } catch (Exception e) {
            logger.error("Error validating token: {}", e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("valid", false);
            errorResponse.put("message", "Invalid token");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
        }
    }
    
    // Keep the old /register endpoint for backward compatibility
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest req, BindingResult result) {
        return signup(req, result);
    }
    
    // Keep the old /verify endpoint for backward compatibility
    @PostMapping("/verify")
    public ResponseEntity<?> verifyLegacy(@RequestBody Map<String, String> payload) {
        VerifyOtpRequest request = new VerifyOtpRequest();
        // Try to get username from email if available
        String email = payload.get("email");
        if (email != null) {
            Optional<User> userOpt = userRepo.findByEmail(email);
            if (userOpt.isPresent()) {
                request.setUsername(userOpt.get().getUsername());
                request.setOtp(payload.get("otp"));
                return verifyOtp(request);
            }
        }
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "Invalid request format");
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }
}
