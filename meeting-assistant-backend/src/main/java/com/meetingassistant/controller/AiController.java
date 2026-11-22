
package com.meetingassistant.controller;

import com.meetingassistant.Service.GeminiService;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
public class AiController {

    private final GeminiService geminiService;

    public AiController(GeminiService geminiService) {
        this.geminiService = geminiService;
    }

    // Metin tabanlı Gemini testi
    @PostMapping("/test")
    public Map<String, String> testGemini(
            @RequestBody Map<String, String> request
    ) throws Exception {

        String prompt = request.get("prompt");

        if (prompt == null || prompt.isBlank()) {
            throw new IllegalArgumentException("Prompt boş olamaz.");
        }

        String answer = geminiService.askGemini(prompt);

        return Map.of("answer", answer);
    }

    // Ses dosyasını metne dönüştürme
    @PostMapping(
            value = "/transcribe",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public Map<String, String> transcribeAudio(
            @RequestParam("file") MultipartFile file
    ) throws Exception {

        String transcript = geminiService.transcribeAudio(file);

        return Map.of("transcript", transcript);
    }
}
