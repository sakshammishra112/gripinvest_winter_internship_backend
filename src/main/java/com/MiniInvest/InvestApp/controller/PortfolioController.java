package com.MiniInvest.InvestApp.controller;

import com.MiniInvest.InvestApp.service.InvestmentPrd.PortfolioService;
import com.MiniInvest.InvestApp.service.JWTsecurity.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/portfolio")
public class PortfolioController {

    private final PortfolioService portfolioService;
    private final UserService userService;

    public PortfolioController(PortfolioService portfolioService, UserService userService) {
        this.portfolioService = portfolioService;
        this.userService = userService;
    }

    @GetMapping("/insights")
    public ResponseEntity<Map<String, Object>> getInsights(Authentication authentication) {

        String email = authentication.getName();

        String userId = userService.findByEmail(email).getId();

        Map<String, Object> stats = portfolioService.getPortfolioStats(userId);
        String aiInsights = portfolioService.getPortfolioInsights(userId);

        return ResponseEntity.ok(Map.of(
                "stats", stats,
                "aiInsights", aiInsights
        ));
    }

    @GetMapping("/investingTrends")
    public ResponseEntity<String> getInvestingTrends() {
        String trends = portfolioService.generalAIInvestingTrends();
        return ResponseEntity.ok(trends);
    }
}


