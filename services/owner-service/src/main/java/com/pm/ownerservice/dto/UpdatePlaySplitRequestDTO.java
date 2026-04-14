package com.pm.ownerservice.dto;

import jakarta.validation.constraints.NotBlank;
import java.math.BigDecimal;
import java.util.Map;

public record UpdatePlaySplitRequestDTO(
        @NotBlank(message = "Host user ID is required") String hostUserId,
        Map<String, BigDecimal> splitPercentages) {
}