package com.MiniInvest.InvestApp.repository;

import com.MiniInvest.InvestApp.entity.Investment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public interface InvestmentRepository extends JpaRepository<Investment, String> {
    List<Investment> findByUserId(String userId);
    List<Investment> findByStatusAndMaturityDateBefore(
            Investment.Status status, LocalDate date
    );
    @Query("""
    SELECT COALESCE(SUM(i.expectedReturn), 0)
    FROM Investment i
    WHERE i.userId = :userId AND i.status = 'matured'
""")
    BigDecimal sumReturnsForMaturedByUserId(String userId);

}
