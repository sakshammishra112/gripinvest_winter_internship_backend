package com.MiniInvest.InvestApp.filter;

import com.MiniInvest.InvestApp.entity.TransactionLog;
import com.MiniInvest.InvestApp.entity.Users;
import com.MiniInvest.InvestApp.service.InvestmentPrd.TransactionLogService;
import com.MiniInvest.InvestApp.service.JWTsecurity.UserService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class TransactionLoggerFilter extends OncePerRequestFilter {

    private final TransactionLogService logService;
    private final UserService userService;

    public TransactionLoggerFilter(TransactionLogService logService, UserService userService) {
        this.userService = userService;
        this.logService = logService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String endpoint = request.getRequestURI();
        try {
            filterChain.doFilter(request, response);

            // ✅ Log successful responses
            if (response.getStatus() < 400) {
                Authentication auth = SecurityContextHolder.getContext().getAuthentication();

                TransactionLog log = new TransactionLog();

                String email = (auth != null && auth.isAuthenticated()
                        && !"anonymousUser".equals(auth.getName()))
                        ? auth.getName()
                        : null;

                log.setEmail(email);
                if (email != null) {
                    Users user = userService.findByEmail(email);
                    if (user != null) {
                        log.setUserId(user.getId());
                    }
                }


                log.setEndpoint(endpoint);
                // log.setUserId(user.getId());
                log.setHttpMethod(TransactionLog.HttpMethod.valueOf(request.getMethod()));
                log.setStatusCode(response.getStatus());
                log.setErrorMessage(null); // success → no error

                logService.logTransaction(log);
            }

        } catch (Exception ex) {
            // ✅ Log failures here
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();

            TransactionLog log = new TransactionLog();
            if (auth != null && auth.isAuthenticated()) {
                log.setEmail(auth.getName());
            }

            log.setEndpoint(request.getRequestURI());
            log.setUserId(request.getParameter("userId"));
            log.setHttpMethod(TransactionLog.HttpMethod.valueOf(request.getMethod()));
            log.setStatusCode(500);
            log.setErrorMessage(ex.getMessage());

            logService.logTransaction(log);

            throw ex; // still let GlobalExceptionHandler handle the response
        }
    }


}
