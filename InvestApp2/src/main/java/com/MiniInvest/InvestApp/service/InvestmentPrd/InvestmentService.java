package com.MiniInvest.InvestApp.service.InvestmentPrd;

import com.MiniInvest.InvestApp.entity.Investment;
import com.MiniInvest.InvestApp.entity.InvestmentProduct;
import com.MiniInvest.InvestApp.entity.Users;
import com.MiniInvest.InvestApp.repository.InvestmentRepository;
import com.MiniInvest.InvestApp.service.JWTsecurity.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
public class InvestmentService {

    private final InvestmentRepository investmentRepo;
    private final InvestmentProductService investmentProductService;
    private final UserService userService;

    public InvestmentService(InvestmentRepository investmentRepo,
                             InvestmentProductService investmentProductService,
                             UserService userService) {
        this.investmentRepo = investmentRepo;
        this.investmentProductService = investmentProductService;
        this.userService = userService;
    }

    @Transactional
    public Investment invest(String userId, String productId, BigDecimal amount) {
        InvestmentProduct product = investmentProductService.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        // Business rule: min/max investment
        if (amount.compareTo(product.getMinInvestment()) < 0 ||
                (product.getMaxInvestment() != null && amount.compareTo(product.getMaxInvestment()) > 0)) {
            throw new RuntimeException("Amount outside product investment range");
        }

        // Business rule: balance check + deduction
        userService.deductBalance(userId, amount);

        Investment inv = new Investment();
        inv.setUserId(userId);
        inv.setProductId(productId);
        inv.setAmount(amount);

        // Expected return = amount * (annualYield/100) * (tenureMonths / 12)
//        BigDecimal expectedReturn = amount
//                .multiply(product.getAnnualYield().divide(BigDecimal.valueOf(100)))
//                .multiply(BigDecimal.valueOf(product.getTenureMonths()).divide(BigDecimal.valueOf(12)));

        // Expected return = amount * (annualYield/100)
        BigDecimal expectedReturn = amount
                .multiply(product.getAnnualYield().divide(BigDecimal.valueOf(100)));


        inv.setExpectedReturn(expectedReturn);
        inv.setMaturityDate(LocalDate.now().plusMonths(product.getTenureMonths()));
        inv.setStatus(Investment.Status.active);

        return investmentRepo.save(inv);
    }

    public List<Investment> getUserInvestments(String userId) {
        return investmentRepo.findByUserId(userId);
    }

    @Transactional
    @Scheduled(cron = "0 0/5 * * * ?")
    public void processMaturedInvestments() {
        processMaturedInvestmentsInternal();
    }

    @Transactional
    public void processMaturedInvestmentsInternal() {
        List<Investment> maturedInvestments =
                investmentRepo.findByStatusAndMaturityDateBefore(
                        Investment.Status.active, LocalDate.now().plusDays(1)
                );

        for (Investment inv : maturedInvestments) {
            BigDecimal payout = inv.getAmount().add(inv.getExpectedReturn());

            // credit user balance
            userService.addToBalance(inv.getUserId(), payout);

            // mark as matured
            inv.setStatus(Investment.Status.matured);
            investmentRepo.save(inv);
        }
    }

    public BigDecimal getTotalReturnsForUser(String userId) {
        return investmentRepo.sumReturnsForMaturedByUserId(userId);
    }

    public Investment getInvestmentById(String id) {
        return investmentRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Investment not found"));
    }


}
