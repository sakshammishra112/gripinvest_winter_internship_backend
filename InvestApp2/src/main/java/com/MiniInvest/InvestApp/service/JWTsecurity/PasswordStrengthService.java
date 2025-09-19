package com.MiniInvest.InvestApp.service.JWTsecurity;

import org.springframework.stereotype.Service;
import java.util.*;
import java.util.regex.Pattern;

@Service
public class PasswordStrengthService {

    private static final Pattern UPPERCASE = Pattern.compile("[A-Z]");
    private static final Pattern LOWERCASE = Pattern.compile("[a-z]");
    private static final Pattern DIGITS = Pattern.compile("[0-9]");
    private static final Pattern SPECIAL_CHARS = Pattern.compile("[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>\\/?]");

    private static final Set<String> COMMON_PASSWORDS = Set.of(
            "password", "123456", "password123", "admin", "qwerty", "letmein",
            "welcome", "monkey", "1234567890", "abc123", "password1"
    );

    public PasswordStrengthResult analyzePassword(String password) {
        if (password == null || password.isEmpty()) {
            return new PasswordStrengthResult(0, "Very Weak",
                    Arrays.asList("Password cannot be empty"));
        }

        int score = calculateScore(password);
        String strength = getStrengthLevel(score);
        List<String> suggestions = generateSuggestions(password);

        return new PasswordStrengthResult(score, strength, suggestions);
    }

    private int calculateScore(String password) {
        int score = 0;

        // Length scoring
        if (password.length() >= 8) score += 20;
        if (password.length() >= 12) score += 10;
        if (password.length() >= 16) score += 10;

        // Character variety
        if (UPPERCASE.matcher(password).find()) score += 15;
        if (LOWERCASE.matcher(password).find()) score += 15;
        if (DIGITS.matcher(password).find()) score += 15;
        if (SPECIAL_CHARS.matcher(password).find()) score += 15;

        // Penalty for common passwords
        if (COMMON_PASSWORDS.contains(password.toLowerCase())) score -= 30;

        // Penalty for repeated characters
        if (hasRepeatedCharacters(password)) score -= 10;

        // Penalty for sequential characters
        if (hasSequentialCharacters(password)) score -= 10;

        return Math.max(0, Math.min(100, score));
    }

    private String getStrengthLevel(int score) {
        if (score >= 80) return "Very Strong";
        if (score >= 60) return "Strong";
        if (score >= 40) return "Medium";
        if (score >= 20) return "Weak";
        return "Very Weak";
    }

    private List<String> generateSuggestions(String password) {
        List<String> suggestions = new ArrayList<>();

        if (password.length() < 8) {
            suggestions.add("Use at least 8 characters (12+ recommended)");
        }

        if (!UPPERCASE.matcher(password).find()) {
            suggestions.add("Add uppercase letters (A-Z)");
        }

        if (!LOWERCASE.matcher(password).find()) {
            suggestions.add("Add lowercase letters (a-z)");
        }

        if (!DIGITS.matcher(password).find()) {
            suggestions.add("Include numbers (0-9)");
        }

        if (!SPECIAL_CHARS.matcher(password).find()) {
            suggestions.add("Add special characters (!@#$%^&*)");
        }

        if (COMMON_PASSWORDS.contains(password.toLowerCase())) {
            suggestions.add("Avoid common passwords like 'password123'");
        }

        if (hasRepeatedCharacters(password)) {
            suggestions.add("Avoid repeated characters (aaa, 111)");
        }

        if (hasSequentialCharacters(password)) {
            suggestions.add("Avoid sequential patterns (abc, 123)");
        }

        // AI-powered suggestions
        suggestions.addAll(generateAISuggestions(password));

        return suggestions;
    }

    private List<String> generateAISuggestions(String password) {
        List<String> aiSuggestions = new ArrayList<>();

        // Pattern-based AI suggestions
        if (password.toLowerCase().contains("password")) {
            aiSuggestions.add("Consider using a passphrase instead of 'password' variants");
        }

        if (password.matches(".*\\d{4,}.*")) {
            aiSuggestions.add("Avoid using long sequences of numbers (birth years, etc.)");
        }

        if (password.matches(".*[a-zA-Z]{6,}.*")) {
            aiSuggestions.add("Break up long letter sequences with numbers or symbols");
        }

        // Constructive suggestions
        aiSuggestions.add("Try a passphrase: 'Coffee!Morning@2024' is stronger than 'Cf2024!'");
        aiSuggestions.add("Use the first letter of each word in a sentence you'll remember");

        return aiSuggestions;
    }

    private boolean hasRepeatedCharacters(String password) {
        for (int i = 0; i < password.length() - 2; i++) {
            if (password.charAt(i) == password.charAt(i + 1) &&
                    password.charAt(i) == password.charAt(i + 2)) {
                return true;
            }
        }
        return false;
    }

    private boolean hasSequentialCharacters(String password) {
        String lower = password.toLowerCase();
        for (int i = 0; i < lower.length() - 2; i++) {
            char c1 = lower.charAt(i);
            char c2 = lower.charAt(i + 1);
            char c3 = lower.charAt(i + 2);
            if ((c2 == c1 + 1 && c3 == c2 + 1) ||
                    (c2 == c1 - 1 && c3 == c2 - 1)) {
                return true;
            }
        }
        return false;
    }

    public static class PasswordStrengthResult {
        private final int score;
        private final String strength;
        private final List<String> suggestions;

        public PasswordStrengthResult(int score, String strength, List<String> suggestions) {
            this.score = score;
            this.strength = strength;
            this.suggestions = suggestions;
        }

        public int getScore() { return score; }
        public String getStrength() { return strength; }
        public List<String> getSuggestions() { return suggestions; }
    }
}
