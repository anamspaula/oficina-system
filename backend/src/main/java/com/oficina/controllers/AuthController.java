package com.oficina.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.oficina.dto.AuthenticationDTO;
import com.oficina.dto.LoginResponseDTO;
import com.oficina.dto.RegisterDTO;
import com.oficina.entities.User;
import com.oficina.repositories.UserRepository;
import com.oficina.services.TokenService;

import jakarta.validation.Valid;

/**
 * Controlador responsável por gerenciar as operações de autenticação, como login.
 */
@RestController
@RequestMapping("auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository repository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private TokenService tokenService;

    /**
     * Endpoint para autenticar um usuário e gerar um token de acesso.
     * @param data
     * @return ResponseEntity<LoginResponseDTO>
     */
    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(@RequestBody @Valid AuthenticationDTO data) {
        // Cria um token interno do Spring com as credenciais recebidas
        var usernamePassword = new UsernamePasswordAuthenticationToken(data.email(), data.password());
        var auth = this.authenticationManager.authenticate(usernamePassword);
        var user = (User) auth.getPrincipal();
        var token = tokenService.generateToken(user);

        return ResponseEntity.ok(new LoginResponseDTO(token));
    }

    /**
     * Endpoint para registrar um novo usuário. Verifica se o email já existe, 
     * criptografa a senha e salva o usuário no banco de dados.
     * @param data
     * @return ResponseEntity<LoginResponseDTO>
     */
    @PostMapping("/register")
    public ResponseEntity<LoginResponseDTO> register(@RequestBody @Valid RegisterDTO data) {
        if(this.repository.findByEmail(data.email()).isPresent()) return ResponseEntity.badRequest().build();

        // CRIPTOGRAFIA: Encriptamos a senha antes de salvar
        String encryptedPassword = passwordEncoder.encode(data.password());
        
        User newUser = new User();
        newUser.setEmail(data.email());
        newUser.setPassword(encryptedPassword);
        newUser.setName(data.name());
        newUser.setRole(data.role());
        newUser.setMechanic(Boolean.TRUE.equals(data.isMechanic()));
        newUser.setPhone(data.phone());
        newUser.setAddress(data.address());
        newUser.setBirthDate(data.birthDate());

        this.repository.save(newUser);

        return ResponseEntity.ok().build();
    }
}
