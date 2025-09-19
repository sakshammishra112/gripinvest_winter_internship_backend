package com.MiniInvest.InvestApp.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "transaction_logs")
public class TransactionLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String userId;

    private String email;

    @Column(nullable = false)
    private String endpoint;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private HttpMethod httpMethod;

    @Column(nullable = false)
    private int statusCode;

    private String errorMessage;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    public TransactionLog(String userId, String email, String requestURI, String method, int i, String message) {
    }

    public TransactionLog() {

    }

    public enum HttpMethod {
        GET, POST, PUT, DELETE
    }

    @PrePersist
    public void prePersist() {
        createdAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getEndpoint() {
        return endpoint;
    }

    public void setEndpoint(String endpoint) {
        this.endpoint = endpoint;
    }

    public HttpMethod getHttpMethod() {
        return httpMethod;
    }

    public void setHttpMethod(HttpMethod httpMethod) {
        this.httpMethod = httpMethod;
    }

    public int getStatusCode() {
        return statusCode;
    }

    public void setStatusCode(int statusCode) {
        this.statusCode = statusCode;
    }

    public String getErrorMessage() {
        return errorMessage;
    }

    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    @Override
    public String toString() {
        return "TransactionLog{" +
                "id=" + id +
                ", userId='" + userId + '\'' +
                ", email='" + email + '\'' +
                ", endpoint='" + endpoint + '\'' +
                ", httpMethod=" + httpMethod +
                ", statusCode=" + statusCode +
                ", errorMessage='" + errorMessage + '\'' +
                ", createdAt=" + createdAt +
                '}';
    }
}
