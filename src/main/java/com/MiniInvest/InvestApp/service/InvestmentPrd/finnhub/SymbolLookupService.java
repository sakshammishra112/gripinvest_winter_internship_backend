package com.MiniInvest.InvestApp.service.InvestmentPrd.finnhub;


import com.MiniInvest.InvestApp.entity.finnhub.SymbolLookupResponse;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

@Service
public class SymbolLookupService {

    private String apiKey = "d353h1hr01qhorbgepkgd353h1hr01qhorbgepl0";

    private final RestTemplate restTemplate = new RestTemplate();
    private final String BASE_URL = "https://finnhub.io/api/v1/search";

    public SymbolLookupResponse lookupSymbol(String query, String exchange) {
        UriComponentsBuilder uriBuilder = UriComponentsBuilder.fromHttpUrl(BASE_URL)
                .queryParam("q", query)
                .queryParam("token", apiKey);

        if (exchange != null && !exchange.isEmpty()) {
            uriBuilder.queryParam("exchange", exchange);
        }

        return restTemplate.getForObject(uriBuilder.toUriString(), SymbolLookupResponse.class);
    }
}
