package com.cloudcompare.ai.controller;

import com.cloudcompare.ai.dto.CompareRequest;
import com.cloudcompare.ai.service.GrokClientService;
import com.cloudcompare.ai.service.MetaDataService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;

@SpringBootTest
@AutoConfigureMockMvc
class ApiControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private GrokClientService grokClientService;

    @Autowired
    private ObjectMapper objectMapper;

    /**
     * /api/compare is now JWT-protected. Use @WithMockUser to simulate
     * an authenticated request.
     */
    @Test
    @WithMockUser(username = "test@example.com")
    void testCompareEndpoint() throws Exception {
        CompareRequest request = new CompareRequest();
        request.setCategory("compute");
        request.setServiceType("all");
        request.setHours(730);
        request.setRegion("us-east-1");
        request.setPriority("balanced");

        when(grokClientService.fetchComparisonFromGrok(anyString(), anyString()))
                .thenReturn(Collections.emptyList());

        mockMvc.perform(post("/api/compare")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    /**
     * Verify that /api/compare returns 403 when called without authentication.
     */
    @Test
    void testCompareEndpointRequiresAuth() throws Exception {
        CompareRequest request = new CompareRequest();
        request.setCategory("compute");

        mockMvc.perform(post("/api/compare")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    /**
     * Verify public endpoints remain accessible without JWT.
     */
    @Test
    void testHealthCheckIsPublic() throws Exception {
        mockMvc.perform(get("/api/test"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }
}
