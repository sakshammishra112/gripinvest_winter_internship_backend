package com.MiniInvest.InvestApp.controller;

import com.MiniInvest.InvestApp.entity.Investment;
import com.MiniInvest.InvestApp.entity.Users;
import com.MiniInvest.InvestApp.service.InvestmentPrd.InvestmentService;
import com.MiniInvest.InvestApp.service.JWTsecurity.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/investments")
public class InvestmentController {

    private final InvestmentService investmentService;
    private final UserService userService;

    public InvestmentController(InvestmentService investmentService, UserService userService) {
        this.investmentService = investmentService;
        this.userService = userService;
    }

    /**
     * Make a new investment in a product
     */
    @PostMapping
    public ResponseEntity<?> invest(
            @RequestBody Map<String, Object> payload,
            Authentication authentication) {

        try {
            String email = authentication.getName(); // Extract email from JWT
            String userId = userService.findByEmail(email).getId(); // Convert to userId

            String productId = payload.get("productId").toString();
            BigDecimal amount = new BigDecimal(payload.get("amount").toString());

            Investment investment = investmentService.invest(userId, productId, amount);

            return ResponseEntity.ok(investment);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Fetch all investments of logged-in user
     */
    @GetMapping("/get-portfolio")
    public ResponseEntity<List<Investment>> getUserInvestments(Authentication authentication) {
        String email = authentication.getName();
        String userId = userService.findByEmail(email).getId();

        return ResponseEntity.ok(investmentService.getUserInvestments(userId));
    }

    @GetMapping("/total-returns")
    public ResponseEntity<Map<String, BigDecimal>> getTotalReturns(Authentication authentication) {
        String email = authentication.getName();
        String userId = userService.findByEmail(email).getId();

        BigDecimal totalReturns = investmentService.getTotalReturnsForUser(userId);
        return ResponseEntity.ok(Map.of("totalReturns", totalReturns));
    }

    @GetMapping("investmentById/{id}")
    public ResponseEntity<Investment> getInvestmentById(@PathVariable String id) {
        Investment investment = investmentService.getInvestmentById(id);
        if (investment != null) {
            return ResponseEntity.ok(investment);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("investmentOfLoggedUser")
    public ResponseEntity<List<Investment>> getInvestmentsOfLoggedUser(Authentication authentication) {
        String email = authentication.getName();
        String userId = userService.findByEmail(email).getId();
        List<Investment> investments = investmentService.getUserInvestments(userId);
        return ResponseEntity.ok(investments);
    }

    @PostMapping("/process-maturity")
    public ResponseEntity<String> processMaturityManually() {
        investmentService.processMaturedInvestmentsInternal();
        return ResponseEntity.ok("Maturity process executed manually.");
    }




}
