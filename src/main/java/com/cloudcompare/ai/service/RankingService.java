package com.cloudcompare.ai.service;

import com.cloudcompare.ai.dto.*;
import com.cloudcompare.ai.entity.CloudServiceEntity;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Ranking and response builder — exact port of rankAndRespond() from routes.js
 */
@Service
public class RankingService {

    private static final List<String> ALL_PROVIDERS = List.of("AWS", "GCP", "Azure", "OCI", "Alibaba");

    private static final Map<String, String> REGION_DEFAULTS = Map.of(
            "AWS", "us-east-1",
            "GCP", "us-central1",
            "Azure", "eastus",
            "OCI", "us-ashburn-1",
            "Alibaba", "ap-southeast-1"
    );

    /**
     * Normalise Groq output into the UI schema, guarantee all 5 providers,
     * then rank and build the full CompareResponse.
     */
    public CompareResponse buildResponse(
            List<Map<String, Object>> grokResults,
            String category, String serviceType,
            int hours, String region, int cpu, int ram, int storage, String priority) {

        // Normalise Groq output into the UI schema
        Map<String, ServiceResult> merged = new LinkedHashMap<>();

        for (Map<String, Object> g : grokResults) {
            String provider = (String) g.get("provider");
            ServiceResult sr = new ServiceResult();
            sr.setId(0);
            sr.setPlatform(provider);
            sr.setServiceName(g.get("service_name") != null ? (String) g.get("service_name") : provider + " " + serviceType);
            sr.setCategory(category);
            sr.setCpu(toInt(g.get("cpu")));
            sr.setRam(toInt(g.get("ram")));
            sr.setStorage(toInt(g.get("storage")));
            sr.setPricePerHour(toDouble(g.get("price_per_hour")));
            sr.setPricePerGb(toDouble(g.get("price_per_gb")));
            sr.setPerformanceScore(g.get("performance_score") != null ? toDouble(g.get("performance_score")) : 7);
            sr.setPopularityScore(g.get("popularity_score") != null ? toDouble(g.get("popularity_score")) : 7);
            sr.setRegion(g.get("region") != null ? (String) g.get("region") : REGION_DEFAULTS.getOrDefault(provider, "global"));
            sr.setDescription(g.get("description") != null ? (String) g.get("description") : serviceType);
            merged.put(provider, sr);
        }

        // Guarantee all 5 providers exist
        fillMissingProviders(merged, category, serviceType);

        List<ServiceResult> results = new ArrayList<>(merged.values());
        return rankAndRespond(results, category, hours, region, cpu, ram, storage, priority);
    }

    /**
     * Build response from Database entities
     */
    public CompareResponse buildResponseFromDb(
            List<CloudServiceEntity> dbResults,
            String category, String serviceType,
            int hours, String region, int cpu, int ram, int storage, String priority) {

        Map<String, ServiceResult> merged = new LinkedHashMap<>();

        for (CloudServiceEntity entity : dbResults) {
            ServiceResult sr = new ServiceResult();
            sr.setId(entity.getId().intValue());
            sr.setPlatform(entity.getPlatform());
            sr.setServiceName(entity.getServiceName());
            sr.setCategory(entity.getCategory());
            sr.setCpu(entity.getCpu());
            sr.setRam(entity.getRam());
            sr.setStorage(entity.getStorage());
            sr.setPricePerHour(entity.getPricePerHour());
            sr.setPricePerGb(entity.getPricePerGb());
            sr.setPerformanceScore(entity.getPerformanceScore());
            sr.setPopularityScore(entity.getPopularityScore());
            sr.setRegion(entity.getRegion());
            sr.setDescription(entity.getDescription());
            merged.put(entity.getPlatform(), sr);
        }

        // Guarantee all 5 providers exist
        fillMissingProviders(merged, category, serviceType);

        List<ServiceResult> results = new ArrayList<>(merged.values());
        return rankAndRespond(results, category, hours, region, cpu, ram, storage, priority);
    }

    private void fillMissingProviders(Map<String, ServiceResult> merged, String category, String serviceType) {
        for (String prov : ALL_PROVIDERS) {
            if (!merged.containsKey(prov)) {
                ServiceResult sr = new ServiceResult();
                sr.setId(0);
                sr.setPlatform(prov);
                sr.setServiceName(prov + " " + serviceType);
                sr.setCategory(category);
                sr.setCpu(0);
                sr.setRam(0);
                sr.setStorage(0);
                sr.setPricePerHour(0);
                sr.setPricePerGb(0);
                sr.setPerformanceScore(5);
                sr.setPopularityScore(5);
                sr.setRegion(REGION_DEFAULTS.getOrDefault(prov, "global"));
                sr.setDescription(serviceType + " (data pending)");
                merged.put(prov, sr);
            }
        }
    }

    private CompareResponse rankAndRespond(
            List<ServiceResult> results, String category,
            int hours, String region, int cpu, int ram, int storage, String priority) {

        // Determine weights
        double performanceWeight = 0.40;
        double popularityWeight = 0.25;
        double costWeight = 0.35;

        if ("cost".equals(priority)) {
            performanceWeight = 0.20;
            popularityWeight = 0.15;
            costWeight = 0.65;
        } else if ("performance".equals(priority)) {
            performanceWeight = 0.55;
            popularityWeight = 0.20;
            costWeight = 0.25;
        }

        // Precompute cost bounds
        double[] costValues = new double[results.size()];
        for (int i = 0; i < results.size(); i++) {
            ServiceResult r = results.get(i);
            if ("storage".equals(category)) {
                costValues[i] = r.getPricePerGb() * (storage > 0 ? storage : 1000);
            } else {
                costValues[i] = r.getPricePerHour() * (hours > 0 ? hours : 1);
            }
        }
        double costMin = Arrays.stream(costValues).min().orElse(0);
        double costMax = Arrays.stream(costValues).max().orElse(0);

        List<ServiceResult> processed = new ArrayList<>();
        final double pw = performanceWeight, ppw = popularityWeight, cw = costWeight;

        for (int i = 0; i < results.size(); i++) {
            ServiceResult s = results.get(i);
            double costVal, costPerHour;

            if ("storage".equals(category)) {
                double msc = s.getPricePerGb() * (storage > 0 ? storage : 1000);
                costPerHour = msc / 730.0;
                costVal = costPerHour * (hours > 0 ? hours : 730);
            } else {
                costPerHour = s.getPricePerHour();
                costVal = costPerHour * (hours > 0 ? hours : 730);
            }

            double costPerDay = costPerHour * 24;
            double costPerWeek = costPerDay * 7;
            double costPerMonth = costPerHour * 730;

            double performanceNorm = s.getPerformanceScore() > 0 ? s.getPerformanceScore() : 5;
            double popularityNorm = s.getPopularityScore() > 0 ? s.getPopularityScore() : 5;

            double costScore = 5;
            if (costMax > costMin && costVal > 0) {
                costScore = 10 * (1 - (costVal - costMin) / (costMax - costMin));
            } else if (costVal == costMin && costVal > 0) {
                costScore = 10;
            }

            double score = (performanceNorm * pw) + (popularityNorm * ppw) + (costScore * cw);

            ServiceResult p = new ServiceResult();
            p.setId(s.getId());
            p.setPlatform(s.getPlatform());
            p.setServiceName(s.getServiceName());
            p.setCategory(s.getCategory());
            p.setCpu(s.getCpu());
            p.setRam(s.getRam());
            p.setStorage(s.getStorage());
            p.setPricePerHour(s.getPricePerHour());
            p.setPricePerGb(s.getPricePerGb());
            p.setPerformanceScore(s.getPerformanceScore());
            p.setPopularityScore(s.getPopularityScore());
            p.setRegion(s.getRegion());
            p.setDescription(s.getDescription());
            p.setCost(round(costVal, 2));
            p.setCostPerHour(round(costPerHour, 4));
            p.setCostPerDay(round(costPerDay, 2));
            p.setCostPerWeek(round(costPerWeek, 2));
            p.setCostPerMonth(round(costPerMonth, 2));
            p.setScore(round(score, 2));
            p.setPerformanceLevel(getPerformanceLevel(s.getPerformanceScore()));
            p.setCostScore(round(costScore, 2));

            processed.add(p);
        }

        // Sort by score descending
        processed.sort((a, b) -> Double.compare(b.getScore(), a.getScore()));

        // Assign ranks
        for (int i = 0; i < processed.size(); i++) {
            processed.get(i).setRank(i + 1);
        }

        // Provider stats aggregation
        Map<String, double[]> provMap = new LinkedHashMap<>();
        // provMap values: [totalCost, totalPerf, count]
        for (ServiceResult s : processed) {
            provMap.computeIfAbsent(s.getPlatform(), k -> new double[3]);
            double[] vals = provMap.get(s.getPlatform());
            vals[0] += s.getCost();
            vals[1] += s.getPerformanceScore();
            vals[2] += 1;
        }

        List<ProviderStat> providerStats = provMap.entrySet().stream()
                .map(e -> new ProviderStat(
                        e.getKey(),
                        round(e.getValue()[0] / e.getValue()[2], 2),
                        round(e.getValue()[1] / e.getValue()[2], 1),
                        (int) e.getValue()[2]
                ))
                .collect(Collectors.toList());

        // Recommendation = top service with reason
        ServiceResult recommendation = null;
        if (!processed.isEmpty()) {
            recommendation = cloneResult(processed.get(0));
            recommendation.setReason(getRecommendationReason(recommendation, category));
        }

        // Build response
        CompareResponse resp = new CompareResponse();
        resp.setCategory(category);
        resp.setFilters(Map.of(
                "hours", hours,
                "region", region != null ? region : "all",
                "cpu", 0,
                "ram", 0,
                "storage", storage > 0 ? storage : 0
        ));
        resp.setTotalResults(processed.size());
        resp.setServices(processed);
        resp.setProviderStats(providerStats);
        resp.setRecommendation(recommendation);

        return resp;
    }

    // ============================================================
    // HELPERS
    // ============================================================

    private String getPerformanceLevel(double score) {
        if (score >= 9) return "High";
        if (score >= 7.5) return "Medium";
        return "Low";
    }

    private String getRecommendationReason(ServiceResult service, String category) {
        Map<String, String> reasons = Map.of(
                "compute", "Best performance-to-cost ratio with " + service.getPerformanceLevel().toLowerCase() + " performance and excellent scalability",
                "storage", "Optimal storage solution with " + service.getPerformanceLevel().toLowerCase() + " durability and competitive pricing",
                "database", "Recommended for production workloads with excellent reliability and managed features",
                "ai", "Top-rated AI service with " + service.getPerformanceLevel().toLowerCase() + " accuracy and strong ecosystem"
        );
        return reasons.getOrDefault(category, "Best overall value for your requirements");
    }

    private ServiceResult cloneResult(ServiceResult s) {
        ServiceResult c = new ServiceResult();
        BeanUtils.copyProperties(s, c);
        return c;
    }

    private double round(double value, int places) {
        if (Double.isNaN(value) || Double.isInfinite(value)) return 0;
        return BigDecimal.valueOf(value).setScale(places, RoundingMode.HALF_UP).doubleValue();
    }

    private int toInt(Object val) {
        if (val == null) return 0;
        if (val instanceof Number) return ((Number) val).intValue();
        try {
            // Strip any non-digit characters except for initial parsing
            String cleaned = val.toString().replaceAll("[^0-9.-]", "");
            return cleaned.isEmpty() ? 0 : (int) Double.parseDouble(cleaned);
        } catch (NumberFormatException e) {
            return 0;
        }
    }

    private double toDouble(Object val) {
        if (val == null) return 0;
        if (val instanceof Number) return ((Number) val).doubleValue();
        try {
            // Strip currency symbols, commas, etc.
            String cleaned = val.toString().replaceAll("[^0-9.-]", "");
            return cleaned.isEmpty() ? 0 : Double.parseDouble(cleaned);
        } catch (NumberFormatException e) {
            return 0;
        }
    }
}
