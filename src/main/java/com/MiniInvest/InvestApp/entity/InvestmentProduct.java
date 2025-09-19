package com.MiniInvest.InvestApp.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "investment_products")
public class InvestmentProduct {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @NotBlank(message = "Product name is required")
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "investment_type", nullable = false)
    private InvestmentType investmentType;

    @Column(name = "tenure_months", nullable = false)
    private int tenureMonths;

    @DecimalMin(value = "0.0", inclusive = false)
    @Digits(integer = 3, fraction = 2)
    @Column(name = "annual_yield", nullable = false)
    private BigDecimal annualYield;

    @Enumerated(EnumType.STRING)
    @Column(name = "risk_level", nullable = false)
    private RiskLevel riskLevel;

    @Column(name = "min_investment", nullable = false)
    private BigDecimal minInvestment = BigDecimal.valueOf(1000.00);

    private BigDecimal maxInvestment;

    @Column(columnDefinition = "TEXT")
    private String description;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    public void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum InvestmentType {
        bond, fd, mf, etf, other
    }

    public enum RiskLevel {
        low, moderate, high
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public @NotBlank(message = "Product name is required") String getName() {
        return name;
    }

    public void setName(@NotBlank(message = "Product name is required") String name) {
        this.name = name;
    }

    public InvestmentType getInvestmentType() {
        return investmentType;
    }

    public void setInvestmentType(InvestmentType investmentType) {
        this.investmentType = investmentType;
    }

    public @DecimalMin(value = "0.0", inclusive = false) @Digits(integer = 3, fraction = 2) BigDecimal getAnnualYield() {
        return annualYield;
    }

    public void setAnnualYield(@DecimalMin(value = "0.0", inclusive = false) @Digits(integer = 3, fraction = 2) BigDecimal annualYield) {
        this.annualYield = annualYield;
    }

    public int getTenureMonths() {
        return tenureMonths;
    }

    public void setTenureMonths(int tenureMonths) {
        this.tenureMonths = tenureMonths;
    }

    public RiskLevel getRiskLevel() {
        return riskLevel;
    }

    public void setRiskLevel(RiskLevel riskLevel) {
        this.riskLevel = riskLevel;
    }

    public BigDecimal getMinInvestment() {
        return minInvestment;
    }

    public void setMinInvestment(BigDecimal minInvestment) {
        this.minInvestment = minInvestment;
    }

    public BigDecimal getMaxInvestment() {
        return maxInvestment;
    }

    public void setMaxInvestment(BigDecimal maxInvestment) {
        this.maxInvestment = maxInvestment;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    @Override
    public String toString() {
        return "InvestmentProduct{" +
                "id='" + id + '\'' +
                ", name='" + name + '\'' +
                ", investmentType=" + investmentType +
                ", tenureMonths=" + tenureMonths +
                ", annualYield=" + annualYield +
                ", riskLevel=" + riskLevel +
                ", minInvestment=" + minInvestment +
                ", maxInvestment=" + maxInvestment +
                ", description='" + description + '\'' +
                ", createdAt=" + createdAt +
                ", updatedAt=" + updatedAt +
                '}';
    }
}
