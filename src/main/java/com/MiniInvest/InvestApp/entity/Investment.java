package com.MiniInvest.InvestApp.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "investments")
public class Investment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "CHAR(36)")
    private String id;

    private String userId;
    private String productId;
    private BigDecimal amount;

    @Column(nullable = false, updatable = false)
    private LocalDateTime investedAt;

    @Enumerated(EnumType.STRING)
    private Status status = Status.active;

    private BigDecimal expectedReturn;
    private LocalDate maturityDate;

    public enum Status {
        active, matured, cancelled
    }

    @PrePersist
    protected void onCreate() {
        this.investedAt = LocalDateTime.now();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getProductId() {
        return productId;
    }

    public void setProductId(String productId) {
        this.productId = productId;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public LocalDateTime getInvestedAt() {
        return investedAt;
    }

    public void setInvestedAt(LocalDateTime investedAt) {
        this.investedAt = investedAt;
    }

    public Status getStatus() {
        return status;
    }

    public void setStatus(Status status) {
        this.status = status;
    }

    public BigDecimal getExpectedReturn() {
        return expectedReturn;
    }

    public void setExpectedReturn(BigDecimal expectedReturn) {
        this.expectedReturn = expectedReturn;
    }

    public LocalDate getMaturityDate() {
        return maturityDate;
    }

    public void setMaturityDate(LocalDate maturityDate) {
        this.maturityDate = maturityDate;
    }

    @Override
    public String toString() {
        return "Investment{" +
                "id='" + id + '\'' +
                ", userId='" + userId + '\'' +
                ", productId='" + productId + '\'' +
                ", amount=" + amount +
                ", investedAt=" + investedAt +
                ", status=" + status +
                ", expectedReturn=" + expectedReturn +
                ", maturityDate=" + maturityDate +
                '}';
    }
}

