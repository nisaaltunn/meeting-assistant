package com.meetingassistant.Service;




import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.List;
import java.util.Map;
import java.util.Base64;
import org.springframework.web.multipart.MultipartFile;
@Service
public class GeminiService {

    @Value("${GEMINI_API_KEY}")
    private String apiKey;

    private final HttpClient httpClient = HttpClient.newHttpClient();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public String askGemini(String prompt) throws Exception {

        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent";

        Map<String, Object> requestBody = Map.of(
                "contents", List.of(
                        Map.of(
                                "parts", List.of(
                                        Map.of("text", prompt)
                                )
                        )
                )
        );

        String jsonBody = objectMapper.writeValueAsString(requestBody);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .header("Content-Type", "application/json")
                .header("x-goog-api-key", apiKey)
                .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
                .build();

        HttpResponse<String> response = httpClient.send(
                request,
                HttpResponse.BodyHandlers.ofString()
        );

        if (response.statusCode() < 200 || response.statusCode() >= 300) {
            throw new RuntimeException(
                    "Gemini API hatası (" + response.statusCode() + "): "
                            + response.body()
            );
        }

        JsonNode root = objectMapper.readTree(response.body());

        return root.path("candidates")
                .path(0)
                .path("content")
                .path("parts")
                .path(0)
                .path("text")
                .asText();
    }


    public JsonNode analyzeMeeting(String transcript) throws Exception {

        if (transcript == null || transcript.isBlank()) {
            throw new IllegalArgumentException("Toplantı metni boş olamaz.");
        }

        String prompt = """
            Sen profesyonel bir toplantı analiz asistanısın.
            Sana verilen toplantı transkriptini analiz et.

            Sonucu yalnızca geçerli JSON formatında döndür.
            Markdown veya açıklama ekleme.

            Şu JSON yapısını kullan:

            {
              "summary": "Toplantının özeti",
              "decisions": [
                "Alınan karar 1",
                "Alınan karar 2"
              ],
              "tasks": [
                {
                  "description": "Yapılacak görev",
                  "responsiblePerson": "Sorumlu kişi veya null",
                  "deadline": "YYYY-MM-DD veya null"
                }
              ],
              "participants": [
                {
                  "speakerLabel": "Konuşmacı 1",
                  "name": null
                }
              ]
            }

            Kurallar:
            - Özeti Türkçe ve anlaşılır şekilde yaz.
            - Sadece gerçekten alınmış kararları ekle.
            - Görevleri açık ve anlaşılır yaz.
            - Sorumlu kişi belirtilmemişse null kullan.
            - Tarih belirtilmemişse null kullan.
            - Konuşmacı isimleri bilinmiyorsa isim uydurma.
            - Transkriptte açıkça ayırt edilebilen konuşmacıları listele.
            - Konuşmacılar kesin olarak ayırt edilemiyorsa tahmin yürütme.
            - Bilgi bulunmayan listeleri boş dizi olarak döndür.

            TOPLANTI TRANSKRİPTİ:

            """ + transcript;

        String url =
                "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent";

        Map<String, Object> requestBody = Map.of(
                "contents", List.of(
                        Map.of(
                                "parts", List.of(
                                        Map.of("text", prompt)
                                )
                        )
                ),
                "generationConfig", Map.of(
                        "responseMimeType", "application/json"
                )
        );

        String jsonBody = objectMapper.writeValueAsString(requestBody);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .header("Content-Type", "application/json")
                .header("x-goog-api-key", apiKey)
                .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
                .build();

        HttpResponse<String> response = httpClient.send(
                request,
                HttpResponse.BodyHandlers.ofString()
        );

        if (response.statusCode() < 200 || response.statusCode() >= 300) {
            throw new RuntimeException(
                    "Gemini toplantı analiz hatası (" +
                            response.statusCode() + "): " + response.body()
            );
        }

        JsonNode root = objectMapper.readTree(response.body());

        String analysisText = root.path("candidates")
                .path(0)
                .path("content")
                .path("parts")
                .path(0)
                .path("text")
                .asText();

        if (analysisText.isBlank()) {
            throw new RuntimeException("Gemini boş analiz yanıtı döndürdü.");
        }

        JsonNode analysis = objectMapper.readTree(analysisText);

        if (!analysis.isObject() || !analysis.hasNonNull("summary")) {
            throw new RuntimeException("Gemini geçersiz analiz formatı döndürdü.");
        }

        return analysis;
    }


    public String transcribeAudio(MultipartFile audioFile) throws Exception {

        if (audioFile == null || audioFile.isEmpty()) {
            throw new IllegalArgumentException("Ses dosyası boş olamaz.");
        }

        String mimeType = audioFile.getContentType();

        String fileName = audioFile.getOriginalFilename();

        if (fileName != null && fileName.toLowerCase().endsWith(".m4a")) {
            mimeType = "audio/mp4";
        }

        if (mimeType == null || !mimeType.startsWith("audio/")) {
            throw new IllegalArgumentException(
                    "Geçerli bir ses dosyası gönderilmelidir. Gelen tür: " + mimeType
            );
        }

        String encodedAudio = Base64.getEncoder()
                .encodeToString(audioFile.getBytes());

        Map<String, Object> audioPart = Map.of(
                "inline_data", Map.of(
                        "mime_type", mimeType,
                        "data", encodedAudio
                )
        );

        Map<String, Object> textPart = Map.of(
                "text", "Bu ses kaydındaki konuşmayı Türkçe olarak eksiksiz şekilde metne dönüştür. Sadece konuşma metnini döndür."
        );

        Map<String, Object> requestBody = Map.of(
                "contents", List.of(
                        Map.of(
                                "parts", List.of(textPart, audioPart)
                        )
                )
        );

        String jsonBody = objectMapper.writeValueAsString(requestBody);

        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent";

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .header("Content-Type", "application/json")
                .header("x-goog-api-key", apiKey)
                .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
                .build();

        HttpResponse<String> response = httpClient.send(
                request,
                HttpResponse.BodyHandlers.ofString()
        );

        if (response.statusCode() < 200 || response.statusCode() >= 300) {
            throw new RuntimeException(
                    "Gemini ses dönüştürme hatası (" +
                            response.statusCode() + "): " + response.body()
            );
        }

        JsonNode root = objectMapper.readTree(response.body());

        String transcript = root.path("candidates")
                .path(0)
                .path("content")
                .path("parts")
                .path(0)
                .path("text")
                .asText();

        if (transcript.isBlank()) {
            throw new RuntimeException("Gemini ses kaydından metin üretemedi.");
        }

        return transcript;
    }

}
