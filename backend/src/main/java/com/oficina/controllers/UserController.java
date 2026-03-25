package com.oficina.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.oficina.dto.UserProfileDTO;
import com.oficina.dto.UserUpdateDTO;
import com.oficina.entities.User;
import com.oficina.repositories.UserRepository;

import jakarta.validation.Valid;

/**
 * Controlador para gerenciamento do perfil do usuário.
 * Permite que o usuário autenticado atualize suas informações pessoais e senha.
 */
@RestController
@RequestMapping("user")
public class UserController {

    @Autowired
    private UserRepository repository;

    @Autowired
    private PasswordEncoder passwordEncoder; // Injetamos o encoder

    @GetMapping("/me")
    public ResponseEntity<UserProfileDTO> getProfile() {
        var user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        var response = new UserProfileDTO(
            user.getId(),
            user.getName(),
            user.getEmail(),
            user.getRole().name(),
            user.getPhone(),
            user.getAddress(),
            user.getBirthDate()
        );

        return ResponseEntity.ok(response);
    }

    /**
     * Endpoint para atualizar o perfil do usuário autenticado.
     * @param data DTO contendo os dados para atualização.
     * @return Resposta HTTP indicando sucesso ou falha da operação.
     */
    @PutMapping("/me")
    public ResponseEntity<Object> updateProfile(@RequestBody @Valid UserUpdateDTO data) {
        var user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        
        // Atualiza dados básicos
        user.setName(data.name());
        user.setPhone(data.phone());
        user.setAddress(data.address());
        user.setBirthDate(data.birthDate());

        // Lógica de alteração de senha
        if (data.currentPassword() != null && data.newPassword() != null) {
            // Verifica se a senha atual digitada bate com a do banco
            if (!passwordEncoder.matches(data.currentPassword(), user.getPassword())) {
                return ResponseEntity.badRequest().body("Senha atual incorreta.");
            }
            
            // Criptografa e define a nova senha
            String encryptedPassword = passwordEncoder.encode(data.newPassword());
            user.setPassword(encryptedPassword);
        }

        repository.save(user);
        return ResponseEntity.ok().build();
    }
}