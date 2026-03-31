package com.oficina.dto;

public record UserProfileDTO(
    String id,
    String name,
    String email,
    String role,
    boolean isMechanic,
    String phone,
    String address,
    String birthDate
) {}