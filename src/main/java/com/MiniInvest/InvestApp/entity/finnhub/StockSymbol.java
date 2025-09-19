package com.MiniInvest.InvestApp.entity.finnhub;

public class StockSymbol {
    private String currency;
    private String description;
    private String displaySymbol;
    private String figi;
    private String isin;          // optional, only for EU/selected Asian markets
    private String mic;
    private String shareClassFIGI;
    private String symbol;
    private String symbol2;       // alternative ticker if exists
    private String type;

    // Getters & Setters
    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getDisplaySymbol() { return displaySymbol; }
    public void setDisplaySymbol(String displaySymbol) { this.displaySymbol = displaySymbol; }

    public String getFigi() { return figi; }
    public void setFigi(String figi) { this.figi = figi; }

    public String getIsin() { return isin; }
    public void setIsin(String isin) { this.isin = isin; }

    public String getMic() { return mic; }
    public void setMic(String mic) { this.mic = mic; }

    public String getShareClassFIGI() { return shareClassFIGI; }
    public void setShareClassFIGI(String shareClassFIGI) { this.shareClassFIGI = shareClassFIGI; }

    public String getSymbol() { return symbol; }
    public void setSymbol(String symbol) { this.symbol = symbol; }

    public String getSymbol2() { return symbol2; }
    public void setSymbol2(String symbol2) { this.symbol2 = symbol2; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
}

