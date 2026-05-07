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

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    /**
     * Fetch a live comparison for ANY cloud service category + sub-type.
     * Works for compute, storage, database, and AI services.
     * Always returns exactly 5 providers.
     */
    public List<Map<String, Object>> fetchComparisonFromGrok(String category, String serviceType) throws Exception {
        String prompt = buildPrompt(category, serviceType);

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
                if (choices == null || choices.isEmpty()) {
                    throw new RuntimeException("Empty Groq response");
                }

                @SuppressWarnings("unchecked")
                Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
                String raw = ((String) message.get("content")).trim();

                if (raw.isEmpty()) {
                    throw new RuntimeException("Empty Groq response");
                }

                // Strip markdown fences if present
                String cleaned = raw.replaceAll("^```json?\\n?", "").replaceAll("\\n?```$", "").trim();

                List<Map<String, Object>> parsed;
                try {
                    parsed = objectMapper.readValue(cleaned, new TypeReference<>() {});
                } catch (Exception parseErr) {
                    log.error("Groq returned invalid JSON. Raw content: {}", cleaned.substring(0, Math.min(200, cleaned.length())));
                    throw new RuntimeException("Groq returned invalid JSON");
                }

                if (parsed.isEmpty()) {
                    throw new RuntimeException("Groq returned an empty array");
                }

                return parsed;

            } catch (Exception err) {
                lastError = err;
                if (err instanceof java.net.http.HttpTimeoutException) {
                    log.warn("Groq API timeout on attempt {}/{}", attempt, maxRetries);
                } else {
                    log.warn("Groq API error on attempt {}/{}: {}", attempt, maxRetries, err.getMessage());
                }

                if (attempt < maxRetries) {
                    // Brief backoff before retry
                    Thread.sleep(1000L * attempt);
                }
            }
        }

        throw lastError != null ? lastError : new RuntimeException("Groq API failed after all retries");
    }

    private String buildPrompt(String category, String serviceType) {
        return "You are an expert cloud infrastructure analyst. Compare the \"" + serviceType +
                "\" services offered by AWS, Google Cloud (GCP), Microsoft Azure, Oracle Cloud (OCI), and Alibaba Cloud under the \"" +
                category + "\" category.\n\n" +
                "Return a JSON array with EXACTLY 5 objects (one per provider). Each object must have:\n" +
                "{\n" +
                "  \"provider\": \"<AWS|GCP|Azure|OCI|Alibaba>\",\n" +
                "  \"service_name\": \"<official product name for this service type>\",\n" +
                "  \"performance_score\": <number from 1 to 10, be realistic>,\n" +
                "  \"popularity_score\": <number from 1 to 10, be realistic>,\n" +
                "  \"price_per_hour\": <number in USD, realistic current pricing>,\n" +
                "  \"price_per_gb\": <number in USD, only relevant for storage, else 0>,\n" +
                "  \"cpu\": <number of vCPUs if applicable, else 0>,\n" +
                "  \"ram\": <GB of RAM if applicable, else 0>,\n" +
                "  \"storage\": <GB of storage if applicable, else 0>,\n" +
                "  \"region\": \"<default region code e.g. us-east-1, us-central1, eastus, us-ashburn-1, ap-southeast-1>\",\n" +
                "  \"description\": \"<one-line description of the service>\"\n" +
                "}\n\n" +
                "Rules:\n" +
                "- Always include ALL 5 providers even if a provider has a weaker offering.\n" +
                "- Use realistic, current pricing and scores based on your knowledge.\n" +
                "- For storage services, price_per_gb is the key cost metric; price_per_hour should be 0.\n" +
                "- For compute/database services, price_per_hour is the key cost metric.\n" +
                "- For AI services and serverless offerings, provide a simulated \"price_per_hour\" assuming a typical continuous enterprise workload. Do NOT use 0.\n" +
                "- Output ONLY the raw JSON array. No markdown fences, no explanation, no extra text.";
    }

    public List<AiToolResult> fetchAiToolsComparisonFromGrok(String purpose) throws Exception {
        String prompt = buildAiPrompt(purpose);

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
                if (choices == null || choices.isEmpty()) {
                    throw new RuntimeException("Empty Groq response");
                }

                @SuppressWarnings("unchecked")
                Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
                String raw = ((String) message.get("content")).trim();

                if (raw.isEmpty()) {
                    throw new RuntimeException("Empty Groq response");
                }

                String cleaned = raw.replaceAll("^```json?\\n?", "").replaceAll("\\n?```$", "").trim();

                List<AiToolResult> parsed;
                try {
                    parsed = objectMapper.readValue(cleaned, new TypeReference<>() {});
                } catch (Exception parseErr) {
                    log.error("Groq returned invalid JSON. Raw content: {}", cleaned.substring(0, Math.min(200, cleaned.length())));
                    throw new RuntimeException("Groq returned invalid JSON");
                }

                if (parsed.isEmpty()) {
                    throw new RuntimeException("Groq returned an empty array");
                }

                return parsed;

            } catch (Exception err) {
                lastError = err;
                log.warn("Groq API error on attempt {}/{}: {}", attempt, maxRetries, err.getMessage());
                if (attempt < maxRetries) {
                    Thread.sleep(1000L * attempt);
                }
            }
        }
        throw lastError != null ? lastError : new RuntimeException("Groq API failed after all retries");
    }

    private String buildAiPrompt(String purpose) {
        return "You are an expert AI integrations analyst. Recommend the top 5 AI tools specifically suited for the purpose of: \"" + purpose + "\".\n\n" +
                "Return a JSON array with EXACTLY 5 objects (one per tool). Each object must have:\n" +
                "{\n" +
                "  \"tool_name\": \"<official product name of the AI tool>\",\n" +
                "  \"provider\": \"<company that owns it (e.g. OpenAI, Anthropic, Midjourney)>\",\n" +
                "  \"model_number\": \"<the specific AI model driving it (e.g. GPT-4o, Claude 3.5 Sonnet, Midjourney v6)>\",\n" +
                "  \"score\": <number from 1 to 10 for suitability for this specific task>,\n" +
                "  \"pricing\": \"<one short sentence summarizing pricing model (e.g. 'Free tier, $20/mo Pro')>\",\n" +
                "  \"description\": \"<one short sentence on why this tool excels at " + purpose + ">\"\n" +
                "}\n\n" +
                "Rules:\n" +
                "- Rank the tools starting from highest score to lowest.\n" +
                "- Include different vendors if they have competitive offerings.\n" +
                "- Output ONLY the raw JSON array. No markdown fences, no explanation, no extra text.";
    }
}
