package com.MiniInvest.InvestApp.entity.finnhub;

public class SymbolResult {
    private String description;
    private String displaySymbol;
    private String symbol;
    private String type;

    // Getters and setters
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getDisplaySymbol() { return displaySymbol; }
    public void setDisplaySymbol(String displaySymbol) { this.displaySymbol = displaySymbol; }

    public String getSymbol() { return symbol; }
    public void setSymbol(String symbol) { this.symbol = symbol; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
}
