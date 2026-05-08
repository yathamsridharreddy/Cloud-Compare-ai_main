package com.cloudcompare.ai.service;

import com.cloudcompare.ai.dto.AiToolResult;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Service to provide fallback mock data when API keys are missing.
 * Keeps core logic clean and separate from demo data.
 */
@Service
public class MockDataService {

    public List<Map<String, Object>> getMockComparison(String serviceType) {
        return new ArrayList<>(List.of(
            Map.ofEntries(Map.entry("provider", "AWS"), Map.entry("service_name", "AWS " + serviceType), Map.entry("performance_score", 9.2), Map.entry("popularity_score", 9.8), Map.entry("price_per_hour", 0.05), Map.entry("price_per_gb", 0.0), Map.entry("cpu", 2), Map.entry("ram", 4), Map.entry("storage", 100), Map.entry("region", "us-east-1"), Map.entry("description", "Highly reliable and scalable.")),
            Map.ofEntries(Map.entry("provider", "GCP"), Map.entry("service_name", "Google " + serviceType), Map.entry("performance_score", 9.5), Map.entry("popularity_score", 9.0), Map.entry("price_per_hour", 0.045), Map.entry("price_per_gb", 0.0), Map.entry("cpu", 2), Map.entry("ram", 4), Map.entry("storage", 100), Map.entry("region", "us-central1"), Map.entry("description", "Excellent performance and analytics integration.")),
            Map.ofEntries(Map.entry("provider", "Azure"), Map.entry("service_name", "Azure " + serviceType), Map.entry("performance_score", 9.0), Map.entry("popularity_score", 9.5), Map.entry("price_per_hour", 0.048), Map.entry("price_per_gb", 0.0), Map.entry("cpu", 2), Map.entry("ram", 4), Map.entry("storage", 100), Map.entry("region", "eastus"), Map.entry("description", "Seamless enterprise integration.")),
            Map.ofEntries(Map.entry("provider", "OCI"), Map.entry("service_name", "Oracle " + serviceType), Map.entry("performance_score", 8.8), Map.entry("popularity_score", 7.5), Map.entry("price_per_hour", 0.035), Map.entry("price_per_gb", 0.0), Map.entry("cpu", 2), Map.entry("ram", 4), Map.entry("storage", 100), Map.entry("region", "us-ashburn-1"), Map.entry("description", "Cost-effective for high workloads.")),
            Map.ofEntries(Map.entry("provider", "Alibaba"), Map.entry("service_name", "Alibaba " + serviceType), Map.entry("performance_score", 8.5), Map.entry("popularity_score", 8.0), Map.entry("price_per_hour", 0.038), Map.entry("price_per_gb", 0.0), Map.entry("cpu", 2), Map.entry("ram", 4), Map.entry("storage", 100), Map.entry("region", "ap-southeast-1"), Map.entry("description", "Strong presence in APAC with competitive pricing."))
        ));
    }

    public List<AiToolResult> getMockAiTools() {
        return new ArrayList<>(List.of(
            createAiTool(1, "ChatGPT", "OpenAI", "GPT-4o", 9.8, "Free tier, $20/mo Pro", "Excellent general purpose AI."),
            createAiTool(2, "Claude", "Anthropic", "Claude 3.5 Sonnet", 9.6, "Free tier, $20/mo Pro", "Superior reasoning and writing."),
            createAiTool(3, "Gemini", "Google", "Gemini 1.5 Pro", 9.3, "Free tier, $20/mo Advanced", "Deep integration with Google Workspace."),
            createAiTool(4, "Copilot", "Microsoft", "GPT-4", 9.0, "Included in M365, $30/mo", "Best for enterprise productivity."),
            createAiTool(5, "Perplexity", "Perplexity AI", "Sonar", 8.8, "Free tier, $20/mo Pro", "Outstanding for research and search.")
        ));
    }

    private AiToolResult createAiTool(int rank, String name, String provider, String model, double score, String price, String desc) {
        AiToolResult res = new AiToolResult();
        res.setRank(rank);
        res.setToolName(name);
        res.setProvider(provider);
        res.setModelNumber(model);
        res.setScore(score);
        res.setPricing(price);
        res.setDescription(desc);
        return res;
    }
}
