package com.MiniInvest.InvestApp.controller.finnhub;

import com.MiniInvest.InvestApp.entity.finnhub.StockSymbol;
import com.MiniInvest.InvestApp.service.InvestmentPrd.finnhub.StockSymbolService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/finnhub")
public class StockSymbolController {

    private final StockSymbolService stockSymbolService;

    public StockSymbolController(StockSymbolService stockSymbolService) {
        this.stockSymbolService = stockSymbolService;
    }

    @GetMapping("/stock-symbols")
    public List<StockSymbol> getStockSymbols(
            @RequestParam String exchange,
            @RequestParam(required = false) String mic,
            @RequestParam(required = false) String securityType,
            @RequestParam(required = false) String currency) {

        return stockSymbolService.getStockSymbols(exchange, mic, securityType, currency);
    }
}