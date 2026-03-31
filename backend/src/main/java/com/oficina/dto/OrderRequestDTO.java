package com.oficina.dto;

import java.util.UUID;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record OrderRequestDTO(
    @NotNull UUID vehicleId,
    @NotBlank String description,
    @NotBlank String responsibleId
) {}
