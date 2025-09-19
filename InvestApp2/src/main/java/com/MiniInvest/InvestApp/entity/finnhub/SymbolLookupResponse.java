package com.MiniInvest.InvestApp.entity.finnhub;

import java.util.List;

public class SymbolLookupResponse {
    private int count;
    private List<SymbolResult> result;

    // Getters and setters
    public int getCount() { return count; }
    public void setCount(int count) { this.count = count; }

    public List<SymbolResult> getResult() { return result; }
    public void setResult(List<SymbolResult> result) { this.result = result; }
}
