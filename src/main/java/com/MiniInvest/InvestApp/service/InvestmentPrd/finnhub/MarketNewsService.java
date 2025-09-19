package com.MiniInvest.InvestApp.service.InvestmentPrd.finnhub;

import com.MiniInvest.InvestApp.entity.finnhub.MarketNews;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.Arrays;
import java.util.List;

@Service
public class MarketNewsService {

    private String apiKey="d353h1hr01qhorbgepkgd353h1hr01qhorbgepl0";

    private final RestTemplate restTemplate = new RestTemplate();
    private static final String BASE_URL = "https://finnhub.io/api/v1/news";

    public List<MarketNews> getMarketNews(String category, Long minId) {
        UriComponentsBuilder builder = UriComponentsBuilder.fromHttpUrl(BASE_URL)
                .queryParam("category", category)
                .queryParam("token", apiKey);

        if (minId != null) {
            builder.queryParam("minId", minId);
        }

        MarketNews[] newsArray = restTemplate.getForObject(builder.toUriString(), MarketNews[].class);
        return Arrays.asList(newsArray != null ? newsArray : new MarketNews[0]);
    }
}
