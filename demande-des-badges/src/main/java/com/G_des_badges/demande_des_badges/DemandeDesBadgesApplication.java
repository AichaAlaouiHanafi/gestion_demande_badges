package com.G_des_badges.demande_des_badges;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class DemandeDesBadgesApplication {

	public static void main(String[] args) {
		SpringApplication.run(DemandeDesBadgesApplication.class, args);
	}

}
