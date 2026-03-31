package com.oficina.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.oficina.dto.AdminUserUpdateDTO;
import com.oficina.dto.UserProfileDTO;
import com.oficina.entities.User;
import com.oficina.services.UserService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("admin/users")
public class AdminUserController {

    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<List<UserProfileDTO>> listUsersAsAdmin() {
        return ResponseEntity.ok(userService.listUsersForAdmin());
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserProfileDTO> getUserAsAdmin(@PathVariable String id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserProfileDTO> updateUserAsAdmin(
        @PathVariable String id,
        @RequestBody @Valid AdminUserUpdateDTO data
    ) {
        var actingUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        UserProfileDTO response = userService.updateUserAsAdmin(id, actingUser, data);
        return ResponseEntity.ok(response);
    }
}
