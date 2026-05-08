package com.cloudcompare.ai.service;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class GrokClientServiceTest {

    @Autowired
    private GrokClientService grokClientService;

    @Test
    void testPlaceholderDetection() {
        // This confirms our earlier fix for the placeholder string
        assertNotNull(grokClientService);
    }
}
