package com.cloudcompare.ai.controller;

import com.cloudcompare.ai.dto.*;
import com.cloudcompare.ai.entity.CloudServiceEntity;
import com.cloudcompare.ai.repository.CloudServiceRepository;
import com.cloudcompare.ai.service.CacheService;
import com.cloudcompare.ai.service.GrokClientService;
import com.cloudcompare.ai.service.MetaDataService;
import com.cloudcompare.ai.service.RankingService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.*;

/**
 * REST Controller — direct port of server.js + routes.js
 * All endpoints, response shapes, and behavior match the original exactly.
 */
@RestController
@RequestMapping("/api")
@CrossOrigin
public class ApiController {

    private static final Logger log = LoggerFactory.getLogger(ApiController.class);

    @Autowired
    private GrokClientService grokClientService;
    
    @Autowired
    private MetaDataService metaDataService;
    
    @Autowired
    private CacheService cacheService;
    
    @Autowired
    private RankingService rankingService;
    
    @Autowired
    private CloudServiceRepository cloudServiceRepository;

    @ExceptionHandler(org.springframework.web.bind.MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Void>> handleValidationException(org.springframework.web.bind.MethodArgumentNotValidException e) {
        String msg = e.getBindingResult().getAllErrors().get(0).getDefaultMessage();
        return ResponseEntity.status(400).body(ApiResponse.error("Validation Failed: " + msg));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleException(Exception e) {
        log.error("Unhandled exception: ", e);
        return ResponseEntity.status(500).body(ApiResponse.error("An unexpected error occurred: " + e.getMessage()));
    }

    @GetMapping("/test")
    public ApiResponse<Map<String, String>> healthCheck() {
        return ApiResponse.success(Map.of(
                "status", "ok",
                "message", "CloudCompare AI Engine is active."
        ));
    }

    @PostMapping("/compare")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<?>> compare(@Valid @RequestBody CompareRequest req) {
        String category = req.getCategory();
        String svcType = (req.getServiceType() != null && !"all".equals(req.getServiceType()))
                ? req.getServiceType()
                : metaDataService.getDefaultServiceType(category);

        log.info("Processing comparison for {} -> {}", category, svcType);

        try {
            // PURE AI MODE: Always fetch from Groq API as requested
            String cacheKey = "compare_" + category + "_" + svcType;
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> grokResults = (List<Map<String, Object>>) cacheService.get(cacheKey);

            if (grokResults == null) {
                log.info("Fetching fresh AI comparison for {}/{}", category, svcType);
                grokResults = grokClientService.fetchComparisonFromGrok(category, svcType);
                cacheService.set(cacheKey, grokResults);
            }

            CompareResponse response = rankingService.buildResponse(
                    grokResults, category, svcType,
                    req.getHours(), req.getRegion(),
                    req.getCpu(), req.getRam(), req.getStorage(),
                    req.getPriority()
            );

            return ResponseEntity.ok(ApiResponse.success(response));

        } catch (Exception err) {
            log.error("Comparison failed: {}", err.getMessage());
            String errorMsg = err.getMessage();
            if (errorMsg != null && errorMsg.contains("YOUR_GROQ_API_KEY")) {
                errorMsg = "AI Engine Configuration Missing. Please set the GROK_API_KEYS environment variable to enable live analysis.";
            }
            return ResponseEntity.status(502).body(ApiResponse.error(errorMsg));
        }
    }

    @GetMapping("/service-types/{category}")
    public ApiResponse<List<ServiceType>> getServiceTypes(@PathVariable String category) {
        return ApiResponse.success(metaDataService.getServiceTypes(category));
    }

    @GetMapping("/regions")
    public ApiResponse<List<Region>> getRegions() {
        return ApiResponse.success(metaDataService.getRegions());
    }

    @PostMapping("/ai-compare")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<?>> compareAiTools(@Valid @RequestBody AiCompareRequest req) {
        String purpose = req.getPurpose();
        log.info("AI Analysis request for: {}", purpose);

        try {
            String cacheKey = "ai_tool_" + purpose.toLowerCase().replaceAll("\\s+", "_");
            @SuppressWarnings("unchecked")
            List<AiToolResult> grokResults = (List<AiToolResult>) cacheService.get(cacheKey);

            if (grokResults == null) {
                grokResults = grokClientService.fetchAiToolsComparisonFromGrok(purpose);
                grokResults.sort((a, b) -> Double.compare(b.getScore(), a.getScore()));
                for (int i = 0; i < grokResults.size(); i++) {
                    grokResults.get(i).setRank(i + 1);
                }
                cacheService.set(cacheKey, grokResults);
            }

            return ResponseEntity.ok(ApiResponse.success(Map.of(
                "purpose", purpose,
                "totalResults", grokResults.size(),
                "tools", grokResults
            )));

        } catch (Exception err) {
            log.error("AI Tool Analysis failed: {}", err.getMessage());
            return ResponseEntity.status(502).body(ApiResponse.error("AI Analysis failed: " + err.getMessage()));
        }
    }
}
