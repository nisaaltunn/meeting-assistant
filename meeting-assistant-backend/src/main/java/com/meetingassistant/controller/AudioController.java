package com.meetingassistant.controller;

import com.meetingassistant.Service.GeminiAudioService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/audio")
@CrossOrigin(origins = "*") // Geliştirme aşamasında mobil erişim için
public class AudioController {

    private final GeminiAudioService geminiAudioService;

    public AudioController(GeminiAudioService geminiAudioService) {
        this.geminiAudioService = geminiAudioService;
    }

    @PostMapping("/analyze")
    public ResponseEntity<?> analyzeAudio(@RequestParam("file") MultipartFile file) {
        try {
            String transcript = geminiAudioService.transcribeAudio(file);
            return ResponseEntity.ok(Map.of("transcript", transcript));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Hata oluştu: " + e.getMessage()));
        }
    }
}