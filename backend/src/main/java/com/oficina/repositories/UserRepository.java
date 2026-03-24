package com.oficina.repositories;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import com.oficina.entities.User;

public interface UserRepository extends JpaRepository<User, String> {
    Optional<User> findByEmail(String email);
}
    