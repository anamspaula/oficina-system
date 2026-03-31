package com.oficina.dto;

import com.oficina.UserRole;

public record RegisterDTO(
    String email, 
    String password, 
    String name, 
    UserRole role, 
    Boolean isMechanic,
    String phone,
    String address,
    String birthDate
) {

}
