package com.cloudcompare.ai.controller;

import com.cloudcompare.ai.dto.*;
import com.cloudcompare.ai.service.CacheService;
import com.cloudcompare.ai.service.GrokClientService;
import com.cloudcompare.ai.service.RankingService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

/**
 * REST Controller — direct port of server.js + routes.js
 * All endpoints, response shapes, and behavior match the original exactly.
 */
@RestController
public class ApiController {

    private static final Logger log = LoggerFactory.getLogger(ApiController.class);

    @Autowired
    private GrokClientService grokClientService;

    @Autowired
    private CacheService cacheService;

    @Autowired
    private RankingService rankingService;

    // ============================================================
    // HARDCODED SERVICE TYPES (no static DB needed) — from routes.js
    // ============================================================
    private static final Map<String, List<ServiceType>> SERVICE_TYPES = new LinkedHashMap<>();

    static {
        SERVICE_TYPES.put("compute", List.of(
                new ServiceType("Virtual Machines", "Virtual Machines"),
                new ServiceType("Serverless Compute", "Serverless Compute"),
                new ServiceType("Container Services", "Container Services"),
                new ServiceType("Kubernetes", "Kubernetes"),
                new ServiceType("Batch Processing", "Batch Processing"),
                new ServiceType("High Performance Computing", "High Performance Computing (HPC)"),
                new ServiceType("GPU Instances", "GPU Instances"),
                new ServiceType("Bare Metal Servers", "Bare Metal Servers"),
                new ServiceType("Auto Scaling", "Auto Scaling"),
                new ServiceType("Edge Computing", "Edge Computing"),
                new ServiceType("Spot/Preemptible Instances", "Spot / Preemptible Instances"),
                new ServiceType("App Hosting / PaaS", "App Hosting / PaaS")
        ));

        SERVICE_TYPES.put("storage", List.of(
                new ServiceType("Object Storage", "Object Storage"),
                new ServiceType("Block Storage", "Block Storage"),
                new ServiceType("File Storage", "File Storage"),
                new ServiceType("Archive Storage", "Archive / Cold Storage"),
                new ServiceType("Content Delivery Network", "CDN / Content Delivery"),
                new ServiceType("Backup and Disaster Recovery", "Backup & Disaster Recovery"),
                new ServiceType("Data Transfer and Migration", "Data Transfer & Migration"),
                new ServiceType("Hybrid Storage", "Hybrid / Gateway Storage"),
                new ServiceType("Storage for Big Data", "Data Lake Storage")
        ));

        SERVICE_TYPES.put("database", List.of(
                new ServiceType("Relational Database", "Relational Database (SQL)"),
                new ServiceType("NoSQL Database", "NoSQL Database"),
                new ServiceType("In-Memory Cache", "In-Memory Cache / Redis"),
                new ServiceType("Data Warehouse", "Data Warehouse"),
                new ServiceType("Graph Database", "Graph Database"),
                new ServiceType("Time Series Database", "Time Series Database"),
                new ServiceType("Document Database", "Document Database"),
                new ServiceType("Database Migration", "Database Migration"),
                new ServiceType("Managed MySQL", "Managed MySQL"),
                new ServiceType("Managed PostgreSQL", "Managed PostgreSQL"),
                new ServiceType("Managed MongoDB", "Managed MongoDB"),
                new ServiceType("Serverless Database", "Serverless Database"),
                new ServiceType("Ledger / Blockchain Database", "Ledger / Blockchain Database")
        ));

        SERVICE_TYPES.put("ai", List.of(
                new ServiceType("Large Language Models (LLMs)", "Large Language Models (LLMs)"),
                new ServiceType("Vision & Image AI", "Vision & Image AI"),
                new ServiceType("Speech & Audio", "Speech & Audio"),
                new ServiceType("NLP & Text Analytics", "NLP & Text Analytics"),
                new ServiceType("Translation AI", "Translation AI"),
                new ServiceType("Document & OCR AI", "Document & OCR AI"),
                new ServiceType("Machine Learning Platforms", "Machine Learning Platforms"),
                new ServiceType("Recommendation AI", "Recommendation AI"),
                new ServiceType("Conversational AI", "Conversational AI / Chatbots"),
                new ServiceType("Video AI & Analysis", "Video AI & Analysis"),
                new ServiceType("Forecasting", "Forecasting"),
                new ServiceType("Anomaly Detection", "Anomaly Detection"),
                new ServiceType("AI Search", "AI Search"),
                new ServiceType("Generative AI", "Generative AI"),
                new ServiceType("AI Code Assistants", "AI Code Assistants"),
                new ServiceType("Text to Image", "Text-to-Image Generation"),
                new ServiceType("AI Model Hosting", "AI Model Hosting / Inference"),
                new ServiceType("AutoML", "AutoML"),
                new ServiceType("AI Data Labeling", "AI Data Labeling"),
                new ServiceType("Fraud Detection", "Fraud Detection AI")
        ));
    }

    // ============================================================
    // Health check — mirrors GET /test
    // ============================================================
    @GetMapping("/test")
    public Map<String, String> healthCheck() {
        return Map.of(
                "status", "ok",
                "message", "Server is live. All data fetched from Groq API."
        );
    }

    // ============================================================
    // COMPARE ENDPOINT — 100% Groq-powered with LRU Cache & Validation
    // ============================================================
    @PostMapping("/api/compare")
    public ResponseEntity<?> compare(@Valid @RequestBody CompareRequest req) {
        String category = req.getCategory();
        String serviceType = req.getServiceType();
        String svcType = (serviceType != null && !"all".equals(serviceType))
                ? serviceType
                : (SERVICE_TYPES.containsKey(category) && !SERVICE_TYPES.get(category).isEmpty()
                ? SERVICE_TYPES.get(category).get(0).getValue()
                : category);

        log.info("Compare request: category={}, serviceType={}, priority={}", category, svcType, req.getPriority());

        try {
            String cacheKey = category + "_" + svcType;

            @SuppressWarnings("unchecked")
            List<Map<String, Object>> grokResults = (List<Map<String, Object>>) cacheService.get(cacheKey);

            if (grokResults != null) {
                log.info("Cache HIT for {}", cacheKey);
            } else {
                log.info("Cache MISS for {}. Fetching from Groq...", cacheKey);
                grokResults = grokClientService.fetchComparisonFromGrok(category, svcType);
                cacheService.set(cacheKey, grokResults);
                log.info("Stored {} in cache", cacheKey);
            }

            CompareResponse response = rankingService.buildResponse(
                    grokResults, category, svcType,
                    req.getHours(), req.getRegion(),
                    req.getCpu(), req.getRam(), req.getStorage(),
                    req.getPriority()
            );

            return ResponseEntity.ok(response);

        } catch (Exception err) {
            log.error("Groq API error: {}", err.getMessage());
            return ResponseEntity.status(502).body(Map.of(
                    "error", "Failed to fetch live data from AI",
                    "message", err.getMessage() != null ? err.getMessage() : "Unknown error",
                    "services", Collections.emptyList(),
                    "recommendation", Collections.emptyMap()
            ));
        }
    }

    // ============================================================
    // SERVICE TYPES — hardcoded, no DB
    // ============================================================
    @GetMapping("/api/service-types/{category}")
    public List<ServiceType> getServiceTypes(@PathVariable String category) {
        return SERVICE_TYPES.getOrDefault(category, Collections.emptyList());
    }

    // ============================================================
    // REGIONS — hardcoded
    // ============================================================
    @GetMapping("/api/regions")
    public List<Region> getRegions() {
        return List.of(
                new Region("all", "All Regions"),
                new Region("us-east-1", "US East (N. Virginia)"),
                new Region("us-central1", "US Central"),
                new Region("eastus", "US East (Azure)"),
                new Region("us-ashburn-1", "US Ashburn (OCI)"),
                new Region("ap-southeast-1", "Asia Pacific (Singapore)"),
                new Region("eu-central-1", "Europe (Frankfurt)")
        );
    }

    // ============================================================
    // SERVICES — return empty (no static DB)
    // ============================================================
    @GetMapping("/api/services")
    public List<Object> getAllServices() {
        return Collections.emptyList();
    }

    @GetMapping("/api/services/{category}")
    public List<Object> getServicesByCategory(@PathVariable String category) {
        return Collections.emptyList();
    }

    // ============================================================
    // SEARCH — not applicable without static DB
    // ============================================================
    @GetMapping("/api/search")
    public Map<String, String> search() {
        return Map.of("message", "Search is powered by live AI comparison. Use the Compare feature.");
    }

    // ============================================================
    // AI COMPARE ENDPOINT 
    // ============================================================
    @PostMapping("/api/ai-compare")
    public ResponseEntity<?> compareAiTools(@Valid @RequestBody AiCompareRequest req) {
        String purpose = req.getPurpose();
        log.info("AI Compare request: purpose={}", purpose);

        try {
            String cacheKey = "ai_tool_" + purpose.toLowerCase().replaceAll("\\s+", "_");

            @SuppressWarnings("unchecked")
            List<AiToolResult> grokResults = (List<AiToolResult>) cacheService.get(cacheKey);

            if (grokResults != null) {
                log.info("Cache HIT for {}", cacheKey);
            } else {
                log.info("Cache MISS for {}. Fetching from Groq...", cacheKey);
                grokResults = grokClientService.fetchAiToolsComparisonFromGrok(purpose);
                
                // Add rank correctly
                grokResults.sort((a, b) -> Double.compare(b.getScore(), a.getScore()));
                for (int i = 0; i < grokResults.size(); i++) {
                    grokResults.get(i).setRank(i + 1);
                }
                
                cacheService.set(cacheKey, grokResults);
                log.info("Stored {} in cache", cacheKey);
            }

            return ResponseEntity.ok(Map.of(
                "purpose", purpose,
                "totalResults", grokResults.size(),
                "tools", grokResults
            ));

        } catch (Exception err) {
            log.error("Groq API error for AI Compare: {}", err.getMessage());
            return ResponseEntity.status(502).body(Map.of(
                    "error", "Failed to fetch AI tool recommendations",
                    "message", err.getMessage() != null ? err.getMessage() : "Unknown error",
                    "tools", Collections.emptyList()
            ));
        }
    }
}
