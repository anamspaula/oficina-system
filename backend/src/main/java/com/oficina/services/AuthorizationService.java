package com.oficina.services;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import com.oficina.repositories.UserRepository;

/** Serviço de autorização para gerenciar detalhes do usuário. */
@Service
public class AuthorizationService implements UserDetailsService {

    @Autowired
    UserRepository repository;

    /**
     * Carrega os detalhes do usuário com base no nome de usuário.
     * @param username
     * @return UserDetails
     * @throws UsernameNotFoundException
     */
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return (UserDetails) repository.findByEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException("Usuário não encontrado"));
    }
}
