package com.MiniInvest.InvestApp.service.InvestmentPrd.finnhub;

import com.MiniInvest.InvestApp.entity.finnhub.CompanyProfile;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

@Service
public class CompanyProfileService {


    private String apiKey = "d353h1hr01qhorbgepkgd353h1hr01qhorbgepl0";

    private final RestTemplate restTemplate = new RestTemplate();
    private final String BASE_URL = "https://finnhub.io/api/v1/stock/profile2";

    public CompanyProfile getCompanyProfile(String symbol, String isin, String cusip) {
        UriComponentsBuilder builder = UriComponentsBuilder.fromHttpUrl(BASE_URL)
                .queryParam("token", apiKey);

        if (symbol != null && !symbol.isEmpty()) {
            builder.queryParam("symbol", symbol);
        }
        if (isin != null && !isin.isEmpty()) {
            builder.queryParam("isin", isin);
        }
        if (cusip != null && !cusip.isEmpty()) {
            builder.queryParam("cusip", cusip);
        }

        return restTemplate.getForObject(builder.toUriString(), CompanyProfile.class);
    }
}
