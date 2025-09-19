package com.MiniInvest.InvestApp.controller.finnhub;

import com.MiniInvest.InvestApp.entity.finnhub.MarketNews;
import com.MiniInvest.InvestApp.service.InvestmentPrd.finnhub.MarketNewsService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/finnhub")
public class MarketNewsController {

    private final MarketNewsService marketNewsService;

    public MarketNewsController(MarketNewsService marketNewsService) {
        this.marketNewsService = marketNewsService;
    }

    @GetMapping("/market-news")
    public List<MarketNews> getMarketNews(
            @RequestParam String category,
            @RequestParam(required = false) Long minId) {

        return marketNewsService.getMarketNews(category, minId);
    }
}
