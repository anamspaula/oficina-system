package com.oficina.entities;

import java.util.Collection;
import java.util.List;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import com.oficina.UserRole;
import jakarta.persistence.*;
import lombok.*;

/** Entidade que representa um usuário no sistema. */
@Entity
@Table(name = "users")
@Getter 
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class User implements org.springframework.security.core.userdetails.UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String name;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    private UserRole role;

    private String address;
    private String birthDate;
    private String phone;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // Se for ADMIN, recebe as duas permissões. Se for USER, apenas uma.
        if (this.role == UserRole.ADMIN) {
            return List.of(
                new SimpleGrantedAuthority("ROLE_ADMIN"), 
                new SimpleGrantedAuthority("ROLE_USER")
            );
        } else {
            return List.of(new SimpleGrantedAuthority("ROLE_USER"));
        }
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}