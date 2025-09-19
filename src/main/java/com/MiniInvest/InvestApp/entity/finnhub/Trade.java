package com.MiniInvest.InvestApp.entity.finnhub;

import java.util.List;

public class Trade {
    private String s; // Symbol
    private double p; // Last price
    private long t;   // Timestamp
    private double v; // Volume
    private List<String> c; // Conditions

    // Getters and Setters
    public String getS() { return s; }
    public void setS(String s) { this.s = s; }

    public double getP() { return p; }
    public void setP(double p) { this.p = p; }

    public long getT() { return t; }
    public void setT(long t) { this.t = t; }

    public double getV() { return v; }
    public void setV(double v) { this.v = v; }

    public List<String> getC() { return c; }
    public void setC(List<String> c) { this.c = c; }
}
