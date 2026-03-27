package com.oficina.dto;

import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record VehicleRequestDTO(
    @NotBlank @JsonProperty("brand") String brand,
    @NotBlank @JsonProperty("model") String model,
    @NotBlank @JsonProperty("license_plate") String licensePlate,
    @NotNull @JsonProperty("year") Integer year,
    @NotNull @JsonProperty("ownerId") UUID ownerId,
    @NotNull @JsonProperty("userId") UUID userId
) {}
