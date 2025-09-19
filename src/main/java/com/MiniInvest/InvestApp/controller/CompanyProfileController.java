package com.MiniInvest.InvestApp.controller;

import com.MiniInvest.InvestApp.entity.finnhub.CompanyProfile;
import com.MiniInvest.InvestApp.service.InvestmentPrd.finnhub.CompanyProfileService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/finnhub")
public class CompanyProfileController {

    private final CompanyProfileService companyProfileService;

    public CompanyProfileController(CompanyProfileService companyProfileService) {
        this.companyProfileService = companyProfileService;
    }

    @GetMapping("/company/profile")
    public CompanyProfile getCompanyProfile(
            @RequestParam(required = false) String symbol,
            @RequestParam(required = false) String isin,
            @RequestParam(required = false) String cusip) {

        if ((symbol == null || symbol.isEmpty()) &&
                (isin == null || isin.isEmpty()) &&
                (cusip == null || cusip.isEmpty())) {
            throw new IllegalArgumentException("At least one of symbol, isin, or cusip must be provided");
        }

        return companyProfileService.getCompanyProfile(symbol, isin, cusip);
    }
}
