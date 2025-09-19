package com.MiniInvest.InvestApp.service.JWTsecurity;

import com.MiniInvest.InvestApp.entity.Users;
import com.MiniInvest.InvestApp.repository.UserRepo;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class UserService {

    @Autowired
    private UserRepo repo;

    @Autowired
    private AuthenticationManager authManager;

    @Autowired
    private JWTService jwtService;

    @Autowired
    private EmailService emailService;

    @Autowired
    private PasswordStrengthService passwordStrengthService;

    private BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(12);
    private SecureRandom secureRandom = new SecureRandom();

    public List<Users> AllUsers() {
        return repo.findAll();
    }

    @Transactional
    public Users registerUser(Users user) {
        // Check if email already exists
        if (repo.findByEmail(user.getEmail()).isPresent()) {
            throw new RuntimeException("Email already registered");
        }

        // Validate password strength
        PasswordStrengthService.PasswordStrengthResult strengthResult =
                passwordStrengthService.analyzePassword(user.getPasswordHash());

        if (strengthResult.getScore() < 40) {
            throw new RuntimeException("Password is too weak. " +
                    String.join(", ", strengthResult.getSuggestions()));
        }

        user.setPasswordHash(encoder.encode(user.getPasswordHash()));

        // ✅ Give new users some starting balance (e.g., 1000)
        if (user.getBalance() == null) {
            user.setBalance(BigDecimal.valueOf(1000));
        }

        return repo.save(user);
    }

    public Users findByEmail(String email) {
        return repo.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
    }

    public BigDecimal getBalanceByUserId(String userId) {
        Users user = repo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return user.getBalance();
    }

    // ✅ Deduct balance (used when investing)
    @Transactional
    public void deductBalance(String userId, BigDecimal amount) {
        Users user = repo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getBalance().compareTo(amount) < 0) {
            throw new RuntimeException("Insufficient balance");
        }

        user.setBalance(user.getBalance().subtract(amount));
        repo.save(user);
    }

    // ✅ Add balance (used when investment matures)
    @Transactional
    public void addToBalance(String userId, BigDecimal amount) {
        Users user = repo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setBalance(user.getBalance().add(amount));
        repo.save(user);
    }

    public String verify(Users user) {
        try {
            Authentication authentication = authManager.authenticate(
                    new UsernamePasswordAuthenticationToken(user.getEmail(), user.getPasswordHash())
            );

            if (authentication.isAuthenticated()) {
                return jwtService.generateToken(user.getEmail());
            }
        } catch (Exception e) {
            throw new RuntimeException("Invalid credentials");
        }
        return "Authentication failed";
    }

    public String findByFirstName(String name) throws UsernameNotFoundException {
        return repo.findByFirstName(name)
                .map(Users::getEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found :)"));
    }


    @Transactional
    public void initiatePasswordReset(String email) {
        Users user = repo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));

        String otpCode = generateOTP();
        String resetToken = UUID.randomUUID().toString();

        user.setOtpCode(otpCode);
        user.setOtpExpiry(LocalDateTime.now().plusMinutes(10)); // 10 minutes expiry
        user.setResetToken(resetToken);
        user.setResetTokenExpiry(LocalDateTime.now().plusHours(1)); // 1 hour expiry

        repo.save(user);

        // Send email
        emailService.sendPasswordResetEmail(email, resetToken, otpCode);
    }

    public boolean verifyOTP(String email, String otpCode) {
        Users user = repo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getOtpCode() == null || user.getOtpExpiry() == null) {
            return false;
        }

        return user.getOtpCode().equals(otpCode) &&
                LocalDateTime.now().isBefore(user.getOtpExpiry());
    }

    @Transactional
    public void resetPassword(String email, String otpCode, String newPassword) {
        if (!verifyOTP(email, otpCode)) {
            throw new RuntimeException("Invalid or expired OTP");
        }

        Users user = repo.findByEmail(email).get();

        PasswordStrengthService.PasswordStrengthResult strengthResult =
                passwordStrengthService.analyzePassword(newPassword);

        if (strengthResult.getScore() < 40) {
            throw new RuntimeException("Password is too weak. " +
                    String.join(", ", strengthResult.getSuggestions()));
        }

        user.setPasswordHash(encoder.encode(newPassword));
        user.setOtpCode(null);
        user.setOtpExpiry(null);
        user.setResetToken(null);
        user.setResetTokenExpiry(null);

        repo.save(user);
    }

    private String generateOTP() {
        return String.format("%06d", secureRandom.nextInt(1000000));
    }

    public PasswordStrengthService.PasswordStrengthResult checkPasswordStrength(String password) {
        return passwordStrengthService.analyzePassword(password);
    }


    public Users getUserById(String id) {
        return repo.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
    }

    public BigDecimal getBalanceForLoggedUser(String email) {
        Users user = repo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return user.getBalance();
    }
}
