package com.portfolio_optimizer_backend.portfolioOptimizer;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;

@SpringBootTest
@TestPropertySource(locations = "classpath:application.properties")
@ActiveProfiles("test")
class PortfolioOptimizerApplicationTests {

	@Test
	void contextLoads() {
		// This test verifies that the application context loads successfully
	}

}
