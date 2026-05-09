package com.cloudcompare.ai.service;

import com.cloudcompare.ai.dto.AiToolResult;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
class GrokClientServiceIntegrationTest {

    @Autowired
    private GrokClientService grokClientService;

    @Test
    void testFetchComparisonFallback() {
        // Since we are in the 'test' profile and GROK_API_KEYS is not set, 
        // it should use the mock fallback.
        try {
            List<Map<String, Object>> results = grokClientService.fetchComparisonFromGrok("compute", "t3.medium");
            assertNotNull(results);
            assertEquals(5, results.size());
            assertEquals("AWS", results.get(0).get("provider"));
        } catch (Exception e) {
            fail("Fallback should not throw exception: " + e.getMessage());
        }
    }

    @Test
    void testFetchAiToolsFallback() {
        try {
            List<AiToolResult> results = grokClientService.fetchAiToolsComparisonFromGrok("coding assistant");
            assertNotNull(results);
            assertFalse(results.isEmpty());
            assertEquals("ChatGPT", results.get(0).getToolName());
        } catch (Exception e) {
            fail("Fallback should not throw exception: " + e.getMessage());
        }
    }

    @Test
    void testExplicitFallbackMethod() {
        // Test the @CircuitBreaker fallback method directly
        List<Map<String, Object>> results = grokClientService.fetchComparisonFallback("compute", "t3.medium", new RuntimeException("Test trip"));
        assertNotNull(results);
        assertEquals(5, results.size());
    }
}
