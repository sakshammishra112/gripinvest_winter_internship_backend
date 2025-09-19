package com.MiniInvest.InvestApp;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class InvestAppApplication {

	public static void main(String[] args) {
		SpringApplication.run(InvestAppApplication.class, args);
	}

}
