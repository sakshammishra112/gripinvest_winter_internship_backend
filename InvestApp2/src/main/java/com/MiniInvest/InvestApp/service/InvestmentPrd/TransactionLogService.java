package com.MiniInvest.InvestApp.service.InvestmentPrd;

import com.MiniInvest.InvestApp.entity.TransactionLog;
import com.MiniInvest.InvestApp.repository.TransactionLogRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TransactionLogService {

    private final TransactionLogRepository repository;

    public TransactionLogService(TransactionLogRepository repository) {
        this.repository = repository;
    }

    public void logTransaction(TransactionLog log) {
        repository.save(log);
    }

    public List<TransactionLog> getLogsByUserId(String userId) {
        return repository.findByUserId(userId);
    }

    public List<TransactionLog> getLogsByEmail(String email) {
        return repository.findByEmail(email);
    }
}
