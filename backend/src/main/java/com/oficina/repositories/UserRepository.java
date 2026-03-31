package com.oficina.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.oficina.entities.User;

/**
 * Repositório para a entidade User. Ele estende JpaRepository, o que fornece métodos CRUD básicos.
 * Além disso, adicionamos um método personalizado findByEmail para buscar um usuário pelo seu email
 * (útil para autenticação e outras operações onde o email é um identificador único).
 */
public interface UserRepository extends JpaRepository<User, String> {
    Optional<User> findByEmail(String email);
    List<User> findByMechanicTrue();
}
    