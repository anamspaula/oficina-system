package com.oficina.config;

import com.oficina.repositories.UserRepository;
import com.oficina.services.TokenService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;

/**
 * Filtro de segurança para validar tokens JWT nas requisições.
 */
@Component
public class SecurityFilter extends OncePerRequestFilter {

    @Autowired
    TokenService tokenService;

    @Autowired
    UserRepository userRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        var token = this.recoverToken(request);
        
        if(token != null) {
            var login = tokenService.validateToken(token);
            var userOptional = userRepository.findByEmail(login);

            if(userOptional.isPresent()) {
                UserDetails user = userOptional.get();
                // Cria o objeto de autenticação com as permissões (Roles) do usuário
                var authentication = new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities());
                // Autentica o usuário no contexto do Spring para esta requisição específica
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        }
        // Segue para o próximo filtro (ou para o Controller)
        filterChain.doFilter(request, response);
    }

    /**
     * Recupera o token JWT do header "Authorization" da requisição, removendo o prefixo "Bearer ".
     * @param request
     * @return String token JWT ou null se não estiver presente
     */
    private String recoverToken(HttpServletRequest request) {
        var authHeader = request.getHeader("Authorization");
        if(authHeader == null) return null;
        return authHeader.replace("Bearer ", "");
    }
}