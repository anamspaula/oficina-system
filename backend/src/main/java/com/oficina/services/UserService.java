package com.oficina.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.oficina.dto.AdminUserUpdateDTO;
import com.oficina.dto.UserProfileDTO;
import com.oficina.entities.User;
import com.oficina.repositories.UserRepository;

@Service
public class UserService {

    @Autowired
    private UserRepository repository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public List<UserProfileDTO> listUsersForAdmin() {
        return repository.findAll().stream()
            .map(this::toUserProfile)
            .toList();
    }

    public UserProfileDTO getUserById(String userId) {
        User user = repository.findById(userId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado."));

        return toUserProfile(user);
    }

    public UserProfileDTO updateUserAsAdmin(String targetUserId, User actingUser, AdminUserUpdateDTO data) {
        User targetUser = repository.findById(targetUserId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado."));

        repository.findByEmail(data.email())
            .filter(found -> !found.getId().equals(targetUser.getId()))
            .ifPresent(found -> {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Já existe usuário com este email.");
            });

        boolean updatingSelf = actingUser.getId().equals(targetUser.getId());
        boolean changingRole = targetUser.getRole() != data.role();
        boolean changingMechanicFlag = targetUser.isMechanic() != data.isMechanic();

        if (updatingSelf && (changingRole || changingMechanicFlag)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Não é permitido alterar seus próprios privilégios.");
        }

        targetUser.setName(data.name());
        targetUser.setEmail(data.email());
        targetUser.setPhone(data.phone());
        targetUser.setAddress(data.address());
        targetUser.setBirthDate(data.birthDate());
        targetUser.setRole(data.role());
        targetUser.setMechanic(Boolean.TRUE.equals(data.isMechanic()));

        if (data.newPassword() != null && !data.newPassword().isBlank()) {
            targetUser.setPassword(passwordEncoder.encode(data.newPassword()));
        }

        User savedUser = repository.save(targetUser);
        return toUserProfile(savedUser);
    }

    private UserProfileDTO toUserProfile(User user) {
        return new UserProfileDTO(
            user.getId(),
            user.getName(),
            user.getEmail(),
            user.getRole().name(),
            user.isMechanic(),
            user.getPhone(),
            user.getAddress(),
            user.getBirthDate()
        );
    }
}
