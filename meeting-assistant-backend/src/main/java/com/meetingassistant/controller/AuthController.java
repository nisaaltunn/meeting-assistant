
package com.meetingassistant.controller;

import com.meetingassistant.dto.ChangePasswordRequest;

import com.meetingassistant.dto.AuthResponse;
import com.meetingassistant.dto.LoginRequest;
import com.meetingassistant.dto.RegisterRequest;
import com.meetingassistant.dto.ProfileUpdateRequest;
import com.meetingassistant.Service.AuthService;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    // Kullanıcı kayıt
    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse register(@RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    // Kullanıcı giriş
    @PostMapping("/login")
    public AuthResponse login(@RequestBody LoginRequest request) {
        return authService.login(request);
    }

    // Profil bilgilerini güncelle
    @PutMapping("/profile")
    public AuthResponse updateProfile(
            @RequestBody ProfileUpdateRequest request,
            Authentication authentication) {

        return authService.updateProfile(
                request,
                authentication.getName()
        );
    }
    @PutMapping("/change-password")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void changePassword(
            @RequestBody ChangePasswordRequest request,
            Authentication authentication) {
        authService.changePassword(request, authentication.getName());
    }
}
