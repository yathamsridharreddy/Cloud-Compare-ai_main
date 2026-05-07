package com.cloudcompare.ai.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * Request body for POST /api/ai-compare
 */
public class AiCompareRequest {

    @NotBlank(message = "Purpose is required")
    private String purpose;

    // Getters and Setters
    public String getPurpose() {
        return purpose;
    }

    public void setPurpose(String purpose) {
        this.purpose = purpose;
    }
}
