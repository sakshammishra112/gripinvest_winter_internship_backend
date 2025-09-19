package com.MiniInvest.InvestApp.repository;

import com.MiniInvest.InvestApp.entity.InvestmentProduct;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface InvestmentProductRepository extends JpaRepository<InvestmentProduct, String> {

    Optional<InvestmentProduct> findByName(String name);
}
