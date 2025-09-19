package com.MiniInvest.InvestApp.repository;

import com.MiniInvest.InvestApp.entity.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepo extends JpaRepository<Users, String> {
    Optional<Users> findByFirstName(String username);
    Optional<Users> findByEmail(String email);
}
