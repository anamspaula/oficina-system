package com.oficina.controllers;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.oficina.dto.AuthenticationDTO;
import com.oficina.dto.LoginResponseDTO;
import com.oficina.entities.User;

/**
 * Controlador responsável por gerenciar as operações de autenticação, como login.
 */
@RestController
@RequestMapping("auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    /**
     * Endpoint para autenticar um usuário e gerar um token de acesso.
     * @param data
     * @return ResponseEntity<LoginResponseDTO>
     */
    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(@RequestBody @Valid AuthenticationDTO data) {
        // Cria um token interno do Spring com as credenciais recebidas
        var usernamePassword = new UsernamePasswordAuthenticationToken(data.email(), data.password());
        
        //O Manager vai usar o AuthorizationService que foi criado para validar no banco
        var auth = this.authenticationManager.authenticate(usernamePassword);

        var user = (User) auth.getPrincipal();

        String token = "token-para-" + user.getEmail();

        return ResponseEntity.ok(new LoginResponseDTO(token));
    }
}
