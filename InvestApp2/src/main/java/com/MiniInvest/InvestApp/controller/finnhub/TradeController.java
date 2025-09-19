package com.MiniInvest.InvestApp.controller.finnhub;


import com.MiniInvest.InvestApp.entity.finnhub.Trade;
import com.MiniInvest.InvestApp.service.InvestmentPrd.finnhub.TradeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/finnhub")
public class TradeController {

    private final TradeService tradeService;

    @Autowired
    public TradeController(TradeService tradeService) {
        this.tradeService = tradeService;
    }

    @GetMapping("/trades")
    public List<Trade> getTrades() {
        return tradeService.getTrades();
    }
}

