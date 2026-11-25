
package com.meetingassistant.Service;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;

@Service
public class JwtService {

    @Value("${JWT_SECRET}")
    private String secret;

    private SecretKey getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secret);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    // Kullanıcı için JWT token oluşturur
    public String generateToken(String email) {

        long expirationTime = 1000 * 60 * 60 * 24;

        return Jwts.builder()
                .subject(email)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expirationTime))
                .signWith(getSigningKey())
                .compact();
    }

    // Token içerisindeki e-posta adresini getirir
    public String extractEmail(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getSubject();
    }

    // Token geçerli mi kontrol eder
    public boolean isTokenValid(String token, String email) {
        try {
            return extractEmail(token).equals(email);
        } catch (Exception e) {
            return false;
        }
    }
}
