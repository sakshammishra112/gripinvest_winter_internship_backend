package com.MiniInvest.InvestApp.service.JWTsecurity;

import com.MiniInvest.InvestApp.entity.UserPrincipal;
import com.MiniInvest.InvestApp.entity.Users;
import com.MiniInvest.InvestApp.repository.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class MyUserDetailsService implements UserDetailsService {

    private final UserRepo repo;

    @Autowired
    public MyUserDetailsService(UserRepo repo){
        this.repo = repo;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        Users user = repo.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
        return new UserPrincipal(user);
    }
}
