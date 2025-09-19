package com.MiniInvest.InvestApp.service.InvestmentPrd.finnhub;

import com.MiniInvest.InvestApp.entity.finnhub.StockSymbol;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.Arrays;
import java.util.List;

@Service
public class StockSymbolService {

    private final String apiKey;
    private final RestTemplate restTemplate;
    private static final String BASE_URL = "https://finnhub.io/api/v1/stock/symbol";

    public StockSymbolService(@Value("${finnhub.api.key}") String apiKey) {
        this.apiKey = apiKey;
        this.restTemplate = new RestTemplate();
    }

    public List<StockSymbol> getStockSymbols(String exchange,
                                             String mic,
                                             String securityType,
                                             String currency) {

        UriComponentsBuilder builder = UriComponentsBuilder.fromHttpUrl(BASE_URL)
                .queryParam("exchange", exchange)
                .queryParam("token", apiKey);

        if (mic != null && !mic.isEmpty()) {
            builder.queryParam("mic", mic);
        }
        if (securityType != null && !securityType.isEmpty()) {
            builder.queryParam("securityType", securityType);
        }
        if (currency != null && !currency.isEmpty()) {
            builder.queryParam("currency", currency);
        }

        StockSymbol[] symbolsArray = restTemplate.getForObject(builder.toUriString(), StockSymbol[].class);
        return Arrays.asList(symbolsArray != null ? symbolsArray : new StockSymbol[0]);
    }
}
