package com.oficina.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.validation.constraints.NotBlank;

public record OwnerRequestDTO(
    @NotBlank @JsonProperty("name") String name,
    @NotBlank @JsonProperty("phone") String phone,
    @JsonProperty("cpf") String cpf,
    @JsonProperty("email") String email
) {}
