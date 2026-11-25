
package com.meetingassistant.Service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.multipart.MultipartFile;

import java.util.Base64;
import java.util.List;
import java.util.Map;

@Service
public class GeminiAudioService {

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.url}")
    private String apiUrl;

    private final RestClient restClient = RestClient.create();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public String transcribeAudio(MultipartFile file) throws Exception {

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Ses dosyası boş.");
        }

        String mimeType = file.getContentType();

        if (mimeType == null || !mimeType.startsWith("audio/")) {
            throw new IllegalArgumentException("Geçersiz ses dosyası.");
        }

        String base64Audio = Base64.getEncoder()
                .encodeToString(file.getBytes());

        String prompt = """
                Bu ses kaydını Türkçe olarak yazıya dök.

                Kurallar:
                1. Konuşmaları duyulduğu sırayla yaz.
                2. Farklı konuşmacıları ayırt edebiliyorsan
                   Konuşmacı 1, Konuşmacı 2 şeklinde belirt.
                3. Her konuşmacının cümlesini ayrı satıra yaz.
                4. Konuşmada olmayan kelimeleri ekleme.
                5. Anlaşılmayan bölümleri [anlaşılmadı] şeklinde belirt.
                6. Özet veya yorum ekleme. Yalnızca transkript üret.

                Örnek çıktı:
                Konuşmacı 1: Bugünkü toplantıya başlayalım.
                Konuşmacı 2: Öncelikle proje takvimini konuşalım.
                """;

        Map<String, Object> requestBody = Map.of(
                "contents", List.of(
                        Map.of(
                                "parts", List.of(
                                        Map.of("text", prompt),
                                        Map.of(
                                                "inlineData", Map.of(
                                                        "mimeType", mimeType,
                                                        "data", base64Audio
                                                )
                                        )
                                )
                        )
                )
        );

        String rawResponse = restClient.post()
                .uri(apiUrl)
                .header("x-goog-api-key", apiKey)
                .contentType(MediaType.APPLICATION_JSON)
                .body(requestBody)
                .retrieve()
                .body(String.class);

        JsonNode rootNode = objectMapper.readTree(rawResponse);

        JsonNode candidates = rootNode.path("candidates");

        if (!candidates.isArray() || candidates.isEmpty()) {
            throw new RuntimeException("Gemini transkript oluşturamadı.");
        }

        JsonNode parts = candidates.get(0)
                .path("content")
                .path("parts");

        StringBuilder transcript = new StringBuilder();

        for (JsonNode part : parts) {
            if (part.has("text")) {
                transcript.append(part.get("text").asText());
            }
        }

        if (transcript.toString().isBlank()) {
            throw new RuntimeException("Gemini boş transkript döndürdü.");
        }

        return transcript.toString().trim();
    }
}
