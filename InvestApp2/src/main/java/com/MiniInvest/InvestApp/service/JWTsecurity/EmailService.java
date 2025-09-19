package com.MiniInvest.InvestApp.service.JWTsecurity;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${app.mail.from:thinkbeyond112@gmail.com}")
    private String fromEmail;

    public void sendPasswordResetEmail(String toEmail, String resetToken, String otpCode) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setFrom(fromEmail);
        message.setSubject("Password Reset Request - MiniInvest");

        String emailBody = String.format(
                "Dear User,\n\n" +
                        "You have requested to reset your password. Please use the following OTP code:\n\n" +
                        "OTP Code: %s\n\n" +
                        "This code will expire in 10 minutes.\n\n" +
                        "If you didn't request this password reset, please ignore this email.\n\n" +
                        "Best regards,\n" +
                        "MiniInvest Team",
                otpCode
        );

        message.setText(emailBody);

        try {
            mailSender.send(message);
        } catch (Exception e) {
            throw new RuntimeException("Failed to send email: " + e.getMessage());
        }
    }
}