package com.MiniInvest.InvestApp.controller;

import com.MiniInvest.InvestApp.entity.Users;
import com.MiniInvest.InvestApp.service.JWTsecurity.PasswordStrengthService;
import com.MiniInvest.InvestApp.service.JWTsecurity.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.User;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class UsersController {

    @Autowired
    private UserService service;

    // @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/users")
    public List<Users> getAllUsers() {
        return service.AllUsers();
    }

    @GetMapping("/users/balance")
    public BigDecimal getUserBalance(Authentication authentication) {
        String email = authentication.getName();
        return service.getBalanceForLoggedUser(email);
    }

    @GetMapping("/users/details")
    public ResponseEntity<?> getUserDetails(Authentication authentication) {
        String email = authentication.getName();
        Users user = service.findByEmail(email);
        if (user != null) {
            return ResponseEntity.ok(user);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/users/{id}")
    public ResponseEntity<?> getUserById(@PathVariable String id) {
        Users user = service.getUserById(id);
        if (user != null) {
            return ResponseEntity.ok(user);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/users/getbalance")
    public BigDecimal getBalance(Authentication authentication) {
        String email = authentication.getName();
        Users user = service.findByEmail(email);
        return user != null ? user.getBalance() : BigDecimal.ZERO;
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody Users user, BindingResult result) {
        if (result.hasErrors()) {
            Map<String, String> errors = new HashMap<>();
            result.getFieldErrors().forEach(error ->
                    errors.put(error.getField(), error.getDefaultMessage()));
            return ResponseEntity.badRequest().body(errors);
        }

        try {
            Users registeredUser = service.registerUser(user);
            Map<String, Object> response = new HashMap<>();
            response.put("message", "User registered successfully");
            response.put("userId", registeredUser.getId());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Users user) {
        try {
            String token = service.verify(user);
            Map<String, String> response = new HashMap<>();
            response.put("token", token);
            response.put("message", "Login successful");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            service.initiatePasswordReset(email);
            return ResponseEntity.ok(Map.of("message", "Password reset OTP sent to your email"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOTP(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String otpCode = request.get("otpCode");
            boolean isValid = service.verifyOTP(email, otpCode);

            if (isValid) {
                return ResponseEntity.ok(Map.of("message", "OTP verified successfully"));
            } else {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid or expired OTP"));
            }
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String otpCode = request.get("otpCode");
            String newPassword = request.get("newPassword");

            service.resetPassword(email, otpCode, newPassword);
            return ResponseEntity.ok(Map.of("message", "Password reset successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/check-password-strength")
    public ResponseEntity<?> checkPasswordStrength(@RequestBody Map<String, String> request) {
        String password = request.get("password");
        PasswordStrengthService.PasswordStrengthResult result = service.checkPasswordStrength(password);

        Map<String, Object> response = new HashMap<>();
        response.put("score", result.getScore());
        response.put("strength", result.getStrength());
        response.put("suggestions", result.getSuggestions());

        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/getEmail/{name}")
    public String getEmail(@PathVariable String name) {
        return service.findByFirstName(name);
    }

    @GetMapping("/getUser")
    public ResponseEntity<?> getUser(Authentication authentication) {
        String email = authentication.getName();
        Users user = service.findByEmail(email);
        if (user != null) {
            return ResponseEntity.ok(user);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}