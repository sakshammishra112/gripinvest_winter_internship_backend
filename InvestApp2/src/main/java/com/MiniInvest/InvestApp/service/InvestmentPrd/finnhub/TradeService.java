package com.MiniInvest.InvestApp.service.InvestmentPrd.finnhub;


import com.MiniInvest.InvestApp.entity.finnhub.Trade;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import org.java_websocket.client.WebSocketClient;
import org.java_websocket.handshake.ServerHandshake;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.util.Collections;
import java.util.LinkedList;
import java.util.List;

@Service
public class TradeService {

    private final List<Trade> trades = Collections.synchronizedList(new LinkedList<>());
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final String token = "d353h1hr01qhorbgepkgd353h1hr01qhorbgepl0";

    @PostConstruct
    public void connectWebSocket() {
        try {
            WebSocketClient client = new WebSocketClient(new URI("wss://ws.finnhub.io?token=" + token)) {
                @Override
                public void onOpen(ServerHandshake handshake) {
                    System.out.println("WebSocket opened");
                    send("{\"type\":\"subscribe\",\"symbol\":\"AAPL\"}");
                    send("{\"type\":\"subscribe\",\"symbol\":\"AMZN\"}");
                    send("{\"type\":\"subscribe\",\"symbol\":\"BINANCE:BTCUSDT\"}");
                }

                @Override
                public void onMessage(String message) {
                    try {
                        JsonNode node = objectMapper.readTree(message);
                        if (node.has("data")) {
                            for (JsonNode tradeNode : node.get("data")) {
                                Trade trade = objectMapper.treeToValue(tradeNode, Trade.class);
                                trades.add(trade);
                                // Optional: limit stored trades to last 100
                                if (trades.size() > 100) trades.remove(0);
                            }
                        }
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                }

                @Override
                public void onClose(int code, String reason, boolean remote) {
                    System.out.println("WebSocket closed: " + reason);
                }

                @Override
                public void onError(Exception ex) {
                    ex.printStackTrace();
                }
            };

            client.connect();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public List<Trade> getTrades() {
        return trades;
    }
}
