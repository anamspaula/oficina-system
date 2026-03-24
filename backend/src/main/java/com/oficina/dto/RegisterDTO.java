package com.oficina.dto;

import com.oficina.UserRole;

public record RegisterDTO(
    String email, 
    String password, 
    String name, 
    UserRole role, 
    String phone,
    String address,
    String birthDate
) {

}
