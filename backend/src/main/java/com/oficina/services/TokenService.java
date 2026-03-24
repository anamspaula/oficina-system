package com.oficina.services;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTCreationException;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.oficina.entities.User;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;

/** Serviço responsável por gerenciar a geração e validação de tokens JWT. */
@Service
public class TokenService {

    @Value("${api.security.token.secret}")
    private String secret;

    // GERAÇÃO DO TOKEN
    public String generateToken(User user) {
        try {
            Algorithm algorithm = Algorithm.HMAC256(secret);
            return JWT.create()
                    .withIssuer("apollo-veiculos-api")
                    .withSubject(user.getEmail()) 
                    .withExpiresAt(genExpirationDate())
                    .sign(algorithm);
        } catch (JWTCreationException exception) {
            throw new RuntimeException("Erro ao gerar token JWT", exception);
        }
    }

    //VALIDAÇÃO DO TOKEN
    public String validateToken(String token) {
        try {
            Algorithm algorithm = Algorithm.HMAC256(secret);
            return JWT.require(algorithm)
                    .withIssuer("apollo-veiculos-api")
                    .build()
                    .verify(token)
                    .getSubject(); // Retorna o e-mail que está dentro do token
        } catch (JWTVerificationException exception) {
            // Se o token for inválido ou expirado, retorna vazio
            return "";
        }
    }

    // Define que o token vale por 2 horas
    private Instant genExpirationDate() {
        return LocalDateTime.now().plusHours(2).toInstant(ZoneOffset.of("-03:00"));
    }
}
