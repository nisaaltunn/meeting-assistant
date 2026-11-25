
package com.meetingassistant.config;

import com.meetingassistant.repository.UserRepository;
import com.meetingassistant.Service.JwtService;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserRepository userRepository;

    public JwtAuthenticationFilter(
            JwtService jwtService,
            UserRepository userRepository) {

        this.jwtService = jwtService;
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {

        final String authHeader =
                request.getHeader("Authorization");
        System.out.println("İstek: " + request.getMethod()
                + " " + request.getRequestURI());

        System.out.println("Authorization başlığı var mı: "
                + (authHeader != null));
        // Authorization başlığı yoksa sonraki filtreye geç.
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);

        try {
            String email = jwtService.extractEmail(token);
            System.out.println("JWT e-posta bilgisi çözümlendi: " + email);
            System.out.println("Kullanıcı bulundu: " +
                    userRepository.findByEmail(email).isPresent());

            System.out.println("Token geçerli: " +
                    jwtService.isTokenValid(token, email));
            if (email != null &&
                    SecurityContextHolder.getContext().getAuthentication() == null &&
                    userRepository.findByEmail(email).isPresent() &&
                    jwtService.isTokenValid(token, email)) {

                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(
                                email,
                                null,
                                Collections.emptyList()
                        );

                authentication.setDetails(
                        new WebAuthenticationDetailsSource()
                                .buildDetails(request)
                );

                SecurityContextHolder.getContext()
                        .setAuthentication(authentication);
            }

        }  catch (Exception e) {
        System.err.println("JWT doğrulama hatası: "
                + e.getClass().getSimpleName()
                + " - "
                + e.getMessage());

        SecurityContextHolder.clearContext();
    }

        filterChain.doFilter(request, response);
    }
}
