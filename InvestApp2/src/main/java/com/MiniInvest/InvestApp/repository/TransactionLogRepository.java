package com.MiniInvest.InvestApp.repository;

import com.MiniInvest.InvestApp.entity.TransactionLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TransactionLogRepository extends JpaRepository<TransactionLog, Long> {
    List<TransactionLog> findByUserId(String userId);
    List<TransactionLog> findByEmail(String email);
}
