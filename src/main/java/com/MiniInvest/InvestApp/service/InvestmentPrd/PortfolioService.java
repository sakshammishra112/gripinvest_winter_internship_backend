package com.MiniInvest.InvestApp.service.InvestmentPrd;

import org.springframework.stereotype.Service;
import com.MiniInvest.InvestApp.entity.Investment;
import com.MiniInvest.InvestApp.entity.InvestmentProduct;
import com.MiniInvest.InvestApp.service.InvestmentPrd.GeminiService;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class PortfolioService {

    private final InvestmentService investmentService;
    private final InvestmentProductService productService;
    private final GeminiService geminiService;

    public PortfolioService(InvestmentService investmentService,
                            InvestmentProductService productService,
                            GeminiService geminiService) {
        this.investmentService = investmentService;
        this.productService = productService;
        this.geminiService = geminiService;
    }

    public Map<String, Object> getPortfolioStats(String userId) {
        List<Investment> investments = investmentService.getUserInvestments(userId);

        BigDecimal totalInvested = BigDecimal.ZERO;
        Map<String, BigDecimal> riskDistribution = new HashMap<>();

        for (Investment inv : investments) {
            InvestmentProduct product = productService.findById(inv.getProductId())
                    .orElseThrow(() -> new RuntimeException("Product not found"));

            totalInvested = totalInvested.add(inv.getAmount());

            riskDistribution.merge(
                    product.getRiskLevel().name(),
                    inv.getAmount(),
                    BigDecimal::add
            );
        }

        Map<String, Double> riskPercentages = new HashMap<>();
        for (var entry : riskDistribution.entrySet()) {
            riskPercentages.put(entry.getKey(),
                    entry.getValue().divide(totalInvested, 2, RoundingMode.HALF_UP)
                            .multiply(BigDecimal.valueOf(100)).doubleValue());
        }

        return Map.of(
                "totalInvested", totalInvested,
                "riskDistribution", riskPercentages,
                "investmentCount", investments.size()
        );
    }

    public String getPortfolioInsights(String userId) {
        Map<String, Object> stats = getPortfolioStats(userId);

        String prompt = "Here are a user's portfolio stats:\n" + stats +
                "\n\nGenerate clear portfolio insights in 2 paragraphs. " +
                "Explain risk distribution, diversification, and recommend improvements.";

        return geminiService.generateText(prompt);
    }

    public String generalAIInvestingTrends() {
        String prompt = "Provide a concise overview of current global investing trends, " +
                "highlighting emerging sectors, popular investment strategies, and market sentiments. " +
                "Keep it under 200 words.";

        return geminiService.generateText(prompt);
    }
}

