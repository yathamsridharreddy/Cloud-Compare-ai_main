package com.cloudcompare.ai.service;

import com.cloudcompare.ai.dto.Region;
import com.cloudcompare.ai.dto.ServiceType;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
class MetaDataServiceTest {

    @Autowired
    private MetaDataService metaDataService;

    @Test
    void testGetRegions() {
        List<Region> regions = metaDataService.getRegions();
        assertNotNull(regions);
        assertFalse(regions.isEmpty());
    }

    @Test
    void testGetServiceTypes() {
        List<ServiceType> types = metaDataService.getServiceTypes("compute");
        assertNotNull(types);
        assertFalse(types.isEmpty());
    }
}
