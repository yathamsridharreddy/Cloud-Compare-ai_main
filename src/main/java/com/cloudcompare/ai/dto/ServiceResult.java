package com.cloudcompare.ai.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Individual service result — mirrors the processed object in rankAndRespond().
 * JSON field names match the original exactly (snake_case).
 */
@JsonInclude(JsonInclude.Include.ALWAYS)
public class ServiceResult {

    private int id;
    private String platform;

    @JsonProperty("service_name")
    private String serviceName;

    private String category;
    private int cpu;
    private int ram;
    private int storage;

    @JsonProperty("price_per_hour")
    private double pricePerHour;

    @JsonProperty("price_per_gb")
    private double pricePerGb;

    @JsonProperty("performance_score")
    private double performanceScore;

    @JsonProperty("popularity_score")
    private double popularityScore;

    private String region;
    private String description;

    private double cost;

    @JsonProperty("cost_per_hour")
    private double costPerHour;

    @JsonProperty("cost_per_day")
    private double costPerDay;

    @JsonProperty("cost_per_week")
    private double costPerWeek;

    @JsonProperty("cost_per_month")
    private double costPerMonth;

    private double score;
    private String performanceLevel;
    private double costScore;
    private int rank;

    // Only present on recommendation
    private String reason;

    // Getters and Setters
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getPlatform() { return platform; }
    public void setPlatform(String platform) { this.platform = platform; }

    public String getServiceName() { return serviceName; }
    public void setServiceName(String serviceName) { this.serviceName = serviceName; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public int getCpu() { return cpu; }
    public void setCpu(int cpu) { this.cpu = cpu; }

    public int getRam() { return ram; }
    public void setRam(int ram) { this.ram = ram; }

    public int getStorage() { return storage; }
    public void setStorage(int storage) { this.storage = storage; }

    public double getPricePerHour() { return pricePerHour; }
    public void setPricePerHour(double pricePerHour) { this.pricePerHour = pricePerHour; }

    public double getPricePerGb() { return pricePerGb; }
    public void setPricePerGb(double pricePerGb) { this.pricePerGb = pricePerGb; }

    public double getPerformanceScore() { return performanceScore; }
    public void setPerformanceScore(double performanceScore) { this.performanceScore = performanceScore; }

    public double getPopularityScore() { return popularityScore; }
    public void setPopularityScore(double popularityScore) { this.popularityScore = popularityScore; }

    public String getRegion() { return region; }
    public void setRegion(String region) { this.region = region; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public double getCost() { return cost; }
    public void setCost(double cost) { this.cost = cost; }

    public double getCostPerHour() { return costPerHour; }
    public void setCostPerHour(double costPerHour) { this.costPerHour = costPerHour; }

    public double getCostPerDay() { return costPerDay; }
    public void setCostPerDay(double costPerDay) { this.costPerDay = costPerDay; }

    public double getCostPerWeek() { return costPerWeek; }
    public void setCostPerWeek(double costPerWeek) { this.costPerWeek = costPerWeek; }

    public double getCostPerMonth() { return costPerMonth; }
    public void setCostPerMonth(double costPerMonth) { this.costPerMonth = costPerMonth; }

    public double getScore() { return score; }
    public void setScore(double score) { this.score = score; }

    public String getPerformanceLevel() { return performanceLevel; }
    public void setPerformanceLevel(String performanceLevel) { this.performanceLevel = performanceLevel; }

    public double getCostScore() { return costScore; }
    public void setCostScore(double costScore) { this.costScore = costScore; }

    public int getRank() { return rank; }
    public void setRank(int rank) { this.rank = rank; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
}
