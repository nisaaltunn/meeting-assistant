
package com.meetingassistant.Service;
import com.meetingassistant.dto.ProfileUpdateRequest;

import com.meetingassistant.dto.AuthResponse;
import com.meetingassistant.dto.LoginRequest;
import com.meetingassistant.dto.RegisterRequest;
import com.meetingassistant.entity.User;
import com.meetingassistant.repository.UserRepository;


import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.meetingassistant.dto.ChangePasswordRequest;

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


    // Kullanıcı profil bilgilerini güncelle
    public AuthResponse updateProfile(
            ProfileUpdateRequest request,
            String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Kullanıcı bulunamadı."
                ));

        if (request.getFirstName() == null ||
                request.getFirstName().isBlank() ||
                request.getLastName() == null ||
                request.getLastName().isBlank()) {

            throw new IllegalArgumentException(
                    "Ad ve soyad boş bırakılamaz."
            );
        }

        user.setFirstName(request.getFirstName().trim());
        user.setLastName(request.getLastName().trim());

        User updatedUser = userRepository.save(user);

        String token = jwtService.generateToken(updatedUser.getEmail());

        return new AuthResponse(
                updatedUser.getId(),
                updatedUser.getFirstName(),
                updatedUser.getLastName(),
                updatedUser.getEmail(),
                token
        );
    }
    public void changePassword(ChangePasswordRequest request, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Kullanıcı bulunamadı."));

        if (request.getCurrentPassword() == null ||
                request.getCurrentPassword().isBlank() ||
                request.getNewPassword() == null ||
                request.getNewPassword().isBlank()) {
            throw new IllegalArgumentException("Tüm şifre alanları zorunludur.");
        }

        if (request.getNewPassword().length() < 8) {
            throw new IllegalArgumentException("Yeni şifre en az 8 karakter olmalıdır.");
        }

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Mevcut şifreniz hatalı.");
        }

        if (request.getCurrentPassword().equals(request.getNewPassword())) {
            throw new IllegalArgumentException("Yeni şifreniz mevcut şifrenizden farklı olmalıdır.");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }
}
