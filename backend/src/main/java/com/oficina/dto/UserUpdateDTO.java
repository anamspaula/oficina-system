package com.oficina.dto;

import jakarta.validation.constraints.NotBlank;

public record UserUpdateDTO(
    @NotBlank String name,
    String phone,
    String address,
    String birthDate,
    String currentPassword,
    String newPassword
) {}