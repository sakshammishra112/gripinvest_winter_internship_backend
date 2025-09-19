package com.MiniInvest.InvestApp.exception;

import com.MiniInvest.InvestApp.entity.TransactionLog;
import com.MiniInvest.InvestApp.service.InvestmentPrd.TransactionLogService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import jakarta.servlet.http.HttpServletRequest;
import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {

    private final TransactionLogService transactionLogService;

    public GlobalExceptionHandler(TransactionLogService transactionLoggerService) {
        this.transactionLogService = transactionLoggerService;
    }

    private String safe(String value) {
        return (value == null || value.isBlank()) ? "[unknown]" : value;
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleException(Exception ex, HttpServletRequest request) {
        String email  = safe((String) request.getAttribute("userEmail"));
        String userId = safe((String) request.getAttribute("userId"));
        String endpoint = safe(request.getRequestURI());
        String method   = safe(request.getMethod());

        transactionLogService.logTransaction(new TransactionLog(
                userId,
                email,
                endpoint,
                method,
                500,
                ex.getMessage())
        );

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", ex.getMessage()));
    }


    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<?> handleBadRequest(IllegalArgumentException ex, HttpServletRequest request) {

        String email  = (String) request.getAttribute("userEmail");
        String userId = (String) request.getAttribute("userId");

        String endpoint = safe(request.getRequestURI());
        String method   = safe(request.getMethod());

        transactionLogService.logTransaction(new TransactionLog(
                userId,
                email,
                endpoint,
                method,
                400,
                ex.getMessage())
        );

        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", ex.getMessage()));
    }

}
