package com.oficina.dto;

import jakarta.validation.constraints.NotBlank;

public record OwnerUpdateDTO(
    @NotBlank String name,
    @NotBlank String phone
) {}
