
package com.meetingassistant.Service;

import com.meetingassistant.dto.AuthResponse;
import com.meetingassistant.dto.LoginRequest;
import com.meetingassistant.dto.RegisterRequest;
import com.meetingassistant.entity.User;
import com.meetingassistant.repository.UserRepository;


import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    // Kullanıcı kayıt işlemi
    public AuthResponse register(RegisterRequest request) {

        if (request.getFirstName() == null ||
                request.getFirstName().isBlank() ||
                request.getLastName() == null ||
                request.getLastName().isBlank() ||
                request.getEmail() == null ||
                request.getEmail().isBlank() ||
                request.getPassword() == null ||
                request.getPassword().length() < 8) {

            throw new IllegalArgumentException(
                    "Bilgileri kontrol edin. Şifre en az 8 karakter olmalıdır."
            );
        }

        String email = request.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException(
                    "Bu e-posta adresi zaten kayıtlı."
            );
        }

        User user = new User();

        user.setFirstName(request.getFirstName().trim());
        user.setLastName(request.getLastName().trim());
        user.setEmail(email);

        // Şifreyi veritabanına hash'leyerek kaydediyoruz.
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        User savedUser = userRepository.save(user);

        String token = jwtService.generateToken(savedUser.getEmail());

        return new AuthResponse(
                savedUser.getId(),
                savedUser.getFirstName(),
                savedUser.getLastName(),
                savedUser.getEmail(),
                token
        );
    }

    // Kullanıcı giriş işlemi
    public AuthResponse login(LoginRequest request) {

        if (request.getEmail() == null ||
                request.getEmail().isBlank() ||
                request.getPassword() == null ||
                request.getPassword().isBlank()) {

            throw new IllegalArgumentException(
                    "E-posta ve şifre zorunludur."
            );
        }

        String email = request.getEmail().trim().toLowerCase();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException(
                        "E-posta veya şifre hatalı."
                ));

        if (!passwordEncoder.matches(
                request.getPassword(),
                user.getPassword())) {

            throw new IllegalArgumentException(
                    "E-posta veya şifre hatalı."
            );
        }

        String token = jwtService.generateToken(user.getEmail());

        return new AuthResponse(
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                token
        );
    }
}
