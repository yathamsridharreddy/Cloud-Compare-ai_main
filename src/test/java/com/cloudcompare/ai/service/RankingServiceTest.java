package com.cloudcompare.ai.service;

import com.cloudcompare.ai.dto.CompareResponse;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
class RankingServiceTest {

    @Autowired
    private RankingService rankingService;

    @Test
    void testRankingLogic() {
        List<Map<String, Object>> data = new ArrayList<>();
        Map<String, Object> svc1 = new HashMap<>();
        svc1.put("provider", "AWS");
        svc1.put("name", "t3.medium");
        svc1.put("costPerHour", 0.0416);
        svc1.put("performanceScore", 80);
        data.add(svc1);

        CompareResponse response = rankingService.buildResponse(
                data, "compute", "all", 730, "all", 0, 0, 0, "balanced"
        );

        assertNotNull(response);
        assertFalse(response.getServices().isEmpty());
        assertEquals("AWS", response.getServices().get(0).getPlatform());
    }
}
