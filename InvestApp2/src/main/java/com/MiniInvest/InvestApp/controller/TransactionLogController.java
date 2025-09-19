package com.MiniInvest.InvestApp.controller;

import com.MiniInvest.InvestApp.service.InvestmentPrd.TransactionLogService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/logs")
public class TransactionLogController {

    private final TransactionLogService logService;

    public TransactionLogController(TransactionLogService logService) {
        this.logService = logService;
    }

    @GetMapping("/user")
    public ResponseEntity<?> getLogsByUser(Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(logService.getLogsByEmail(email));
    }

    // @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/admin/{email}")
    public ResponseEntity<?> getLogsByEmail(@PathVariable String email) {
        return ResponseEntity.ok(logService.getLogsByEmail(email));
    }
}

