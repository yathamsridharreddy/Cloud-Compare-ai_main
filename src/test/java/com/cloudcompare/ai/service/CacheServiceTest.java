package com.cloudcompare.ai.service;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class CacheServiceTest {

    @Autowired
    private CacheService cacheService;

    @Test
    void testCacheOperations() {
        String key = "testKey";
        String value = "testValue";
        
        cacheService.set(key, value);
        assertEquals(value, cacheService.get(key));
        
        cacheService.clear();
        assertNull(cacheService.get(key));
    }
}
