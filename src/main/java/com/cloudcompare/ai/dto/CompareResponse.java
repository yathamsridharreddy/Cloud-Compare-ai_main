package com.cloudcompare.ai.dto;

import java.util.List;
import java.util.Map;

/**
 * Response wrapper for POST /api/compare
 * Mirrors the JSON shape returned by rankAndRespond() in routes.js
 */
public class CompareResponse {

    private String category;
    private Map<String, Object> filters;
    private int totalResults;
    private List<ServiceResult> services;
    private List<ProviderStat> providerStats;
    private ServiceResult recommendation;

    // Getters and Setters
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public Map<String, Object> getFilters() { return filters; }
    public void setFilters(Map<String, Object> filters) { this.filters = filters; }

    public int getTotalResults() { return totalResults; }
    public void setTotalResults(int totalResults) { this.totalResults = totalResults; }

    public List<ServiceResult> getServices() { return services; }
    public void setServices(List<ServiceResult> services) { this.services = services; }

    public List<ProviderStat> getProviderStats() { return providerStats; }
    public void setProviderStats(List<ProviderStat> providerStats) { this.providerStats = providerStats; }

    public ServiceResult getRecommendation() { return recommendation; }
    public void setRecommendation(ServiceResult recommendation) { this.recommendation = recommendation; }
}
