package com.MiniInvest.InvestApp.controller.finnhub;

import com.MiniInvest.InvestApp.entity.finnhub.SymbolLookupResponse;
import com.MiniInvest.InvestApp.service.InvestmentPrd.finnhub.SymbolLookupService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/finnhub")
public class SymbolLookupController {

    private final SymbolLookupService symbolLookupService;

    public SymbolLookupController(SymbolLookupService symbolLookupService) {
        this.symbolLookupService = symbolLookupService;
    }

    @GetMapping("/lookup")
    public SymbolLookupResponse lookup(@RequestParam String q,
                                       @RequestParam(required = false) String exchange) {
        return symbolLookupService.lookupSymbol(q, exchange);
    }
}

