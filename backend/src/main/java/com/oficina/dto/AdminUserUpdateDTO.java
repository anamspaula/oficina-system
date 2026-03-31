package com.oficina.dto;

import com.oficina.UserRole;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record AdminUserUpdateDTO(
    @NotBlank String name,
    @NotBlank @Email String email,
    @NotNull UserRole role,
    @NotNull Boolean isMechanic,
    String phone,
    String address,
    String birthDate,
    @Size(min = 6) String newPassword
) {}
