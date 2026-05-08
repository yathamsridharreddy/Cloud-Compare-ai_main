package com.cloudcompare.ai.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import com.cloudcompare.ai.dto.AiToolResult;

/**
 * Groq API client — direct port of grokClient.js
 * Calls Groq API for live cloud service comparisons.
 * Production-hardened: timeout, retry, JSON validation.
 */
@Service
public class GrokClientService {

    private static final Logger log = LoggerFactory.getLogger(GrokClientService.class);

    @Value("${grok.api.key}")
    private String apiKey;

    @Value("${grok.endpoint}")
    private String endpoint;

    @Value("${grok.model}")
    private String model;

    @Value("${grok.timeout:15000}")
    private int timeoutMs;

    @Value("${grok.max-retries:2}")
    private int maxRetries;

    @org.springframework.beans.factory.annotation.Autowired
    private MockDataService mockDataService;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    public List<Map<String, Object>> fetchComparisonFromGrok(String category, String serviceType) throws Exception {
        if ("YOUR_GROQ_API_KEY_HERE".equals(apiKey) || apiKey.isEmpty()) {
            log.info("Using mock Groq response because API key is placeholder.");
            return mockDataService.getMockComparison(serviceType);
        }

        String prompt = buildPrompt(category, serviceType);
        String rawResponse = callGroqApi(prompt);
        String cleaned = extractJson(rawResponse);

        try {
            return objectMapper.readValue(cleaned, new TypeReference<>() {});
        } catch (Exception parseErr) {
            log.error("Failed to parse Groq JSON. Raw: {}", cleaned);
            throw new RuntimeException("AI returned malformed data. Please try again.");
        }
    }

    public List<AiToolResult> fetchAiToolsComparisonFromGrok(String purpose) throws Exception {
        if ("YOUR_GROQ_API_KEY_HERE".equals(apiKey) || apiKey.isEmpty()) {
            log.info("Using mock Groq response for AI tools because API key is placeholder.");
            return mockDataService.getMockAiTools();
        }

        String prompt = buildAiPrompt(purpose);
        String rawResponse = callGroqApi(prompt);
        String cleaned = extractJson(rawResponse);

        try {
            return objectMapper.readValue(cleaned, new TypeReference<>() {});
        } catch (Exception parseErr) {
            log.error("Failed to parse Groq AI tools JSON. Raw: {}", cleaned);
            throw new RuntimeException("AI returned malformed tool data.");
        }
    }

    private String callGroqApi(String prompt) throws Exception {
        Exception lastError = null;
        for (int attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                String requestBody = objectMapper.writeValueAsString(Map.of(
                        "model", model,
                        "messages", List.of(Map.of("role", "user", "content", prompt)),
                        "temperature", 0.1,
                        "max_tokens", 2000
                ));

                HttpRequest request = HttpRequest.newBuilder()
                        .uri(URI.create(endpoint))
                        .header("Authorization", "Bearer " + apiKey)
                        .header("Content-Type", "application/json")
                        .timeout(Duration.ofMillis(timeoutMs))
                        .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                        .build();

                HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

                if (response.statusCode() != 200) {
                    throw new RuntimeException("Groq API " + response.statusCode() + ": " + response.body());
                }

                Map<String, Object> data = objectMapper.readValue(response.body(), new TypeReference<>() {});
                @SuppressWarnings("unchecked")
                List<Map<String, Object>> choices = (List<Map<String, Object>>) data.get("choices");
                @SuppressWarnings("unchecked")
                Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
                return ((String) message.get("content")).trim();

            } catch (Exception err) {
                lastError = err;
                log.warn("Groq attempt {} failed: {}", attempt, err.getMessage());
                if (attempt < maxRetries) Thread.sleep(1000L * attempt);
            }
        }
        throw lastError;
    }

    private String extractJson(String raw) {
        if (raw == null || raw.isEmpty()) return "[]";
        
        // Find first [ or { and last ] or }
        int startBracket = raw.indexOf('[');
        int startBrace = raw.indexOf('{');
        int start = -1;
        
        if (startBracket != -1 && (startBrace == -1 || startBracket < startBrace)) {
            start = startBracket;
        } else if (startBrace != -1) {
            start = startBrace;
        }
        
        if (start == -1) return raw; // Fallback to raw if no markers found

        int endBracket = raw.lastIndexOf(']');
        int endBrace = raw.lastIndexOf('}');
        int end = Math.max(endBracket, endBrace);
        
        if (end == -1 || end <= start) return raw;
        
        return raw.substring(start, end + 1);
    }

    private String buildPrompt(String category, String serviceType) {
        return "You are an expert cloud infrastructure analyst. Compare the \"" + serviceType +
                "\" services offered by AWS, Google Cloud (GCP), Microsoft Azure, Oracle Cloud (OCI), and Alibaba Cloud under the \"" +
                category + "\" category.\n\n" +
                "Return a JSON array with EXACTLY 5 objects (one per provider). Each object must have:\n" +
                "{\n" +
                "  \"provider\": \"<AWS|GCP|Azure|OCI|Alibaba>\",\n" +
                "  \"service_name\": \"<official product name>\",\n" +
                "  \"performance_score\": <1-10>,\n" +
                "  \"popularity_score\": <1-10>,\n" +
                "  \"price_per_hour\": <number>,\n" +
                "  \"price_per_gb\": <number>,\n" +
                "  \"cpu\": <number>,\n" +
                "  \"ram\": <number>,\n" +
                "  \"storage\": <number>,\n" +
                "  \"region\": \"<code-e.g.-us-east-1>\",\n" +
                "  \"description\": \"<text>\"\n" +
                "}\n\n" +
                "Output ONLY the raw JSON array.";
    }

    private String buildAiPrompt(String purpose) {
        return "Recommend top 5 AI tools for: \"" + purpose + "\".\n\n" +
                "Return a JSON array with EXACTLY 5 objects:\n" +
                "{\n" +
                "  \"tool_name\": \"<name>\",\n" +
                "  \"provider\": \"<company>\",\n" +
                "  \"model_number\": \"<model>\",\n" +
                "  \"score\": <1-10>,\n" +
                "  \"pricing\": \"<text>\",\n" +
                "  \"description\": \"<text>\"\n" +
                "}\n\n" +
                "Output ONLY raw JSON.";
    }
}
