package com.meetingassistant.Service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.net.http.HttpTimeoutException;
import java.time.Duration;
import java.util.Base64;
import java.util.List;
import java.util.Map;

@Service
public class GeminiService {

    @Value("${GEMINI_API_KEY}")
    private String apiKey;

    private static final List<String> MODEL_CANDIDATES = List.of(
            "gemini-3.5-flash-lite",
            "gemini-3.8-flash",
            "gemini-3.7-flash"
    );

    private final HttpClient httpClient = HttpClient.newBuilder()
            .version(HttpClient.Version.HTTP_1_1)
            .connectTimeout(Duration.ofSeconds(30))
            .build();

    private final ObjectMapper objectMapper = new ObjectMapper();

    private HttpResponse<String> sendWithFallback(String jsonBody, String errorPrefix) throws Exception {
        String lastErrorBody = "";
        int lastStatusCode = 500;

        for (String model : MODEL_CANDIDATES) {
            String url = "https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent";

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .timeout(Duration.ofSeconds(25))
                    .header("Content-Type", "application/json")
                    .header("x-goog-api-key", apiKey)
                    .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
                    .build();

            try {
                HttpResponse<String> response = httpClient.send(
                        request,
                        HttpResponse.BodyHandlers.ofString()
                );

                if (response.statusCode() >= 200 && response.statusCode() < 300) {
                    System.out.println("Başarılı yanıt alınan model: " + model);
                    return response;
                }

                lastStatusCode = response.statusCode();
                lastErrorBody = response.body();
                System.out.println(model + " başarısız (" + lastStatusCode + "), sıradaki modele geçiliyor...");
            } catch (HttpTimeoutException e) {
                lastStatusCode = 504;
                lastErrorBody = "Model zaman aşımına uğradı: " + model;
                System.out.println(model + " zaman aşımına uğradı, sıradaki modele geçiliyor...");
            }
        }

        throw new RuntimeException(
                errorPrefix + " (" + lastStatusCode + "): " + lastErrorBody
        );
    }

    public String askGemini(String prompt) throws Exception {

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

        HttpResponse<String> response = sendWithFallback(jsonBody, "Gemini API hatası");

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

        HttpResponse<String> response = sendWithFallback(jsonBody, "Gemini toplantı analiz hatası");

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

        if (fileName != null && fileName.toLowerCase().endsWith(".m4a")) {
            mimeType = "audio/mp4";
        } else if (fileName != null && fileName.toLowerCase().endsWith(".wav")) {
            mimeType = "audio/wav";
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

        String promptText = """
                Bu ses kaydındaki konuşmaları Türkçe olarak metne dönüştür ve farklı konuşmacıları ayırt et.
                Sonucu yalnızca geçerli bir JSON dizisi olarak döndür. Markdown veya ek açıklama ekleme.

                Şu JSON formatını kullan:
                [
                  {
                    "speaker": "Konuşmacı 1",
                    "text": "Söylenen cümle"
                  },
                  {
                    "speaker": "Konuşmacı 2",
                    "text": "Diğer kişinin cevabı"
                  }
                ]

                Kurallar:
                - Ses tonu ve konuşma sırasına göre kişileri "Konuşmacı 1", "Konuşmacı 2" şeklinde numaralandır.
                - Konuşma içinde kişinin adı açıkça geçiyorsa (örneğin "Ben Ahmet" diyorsa) o kişi için "Ahmet (Konuşmacı 1)" etiketini kullan.
                - Aynı kişi konuşmaya devam ediyorsa veya çok kısa bir duraksama yaptıysa konuşmacıyı değiştirme.
                - Konuşmacının değiştiğinden emin olmadıkça mevcut konuşmacıyı devam ettir.
                - Sadece ses kaydında gerçekten söylenen sözleri yaz, yorum ekleme.
                """;

        Map<String, Object> textPart = Map.of("text", promptText);

        Map<String, Object> requestBody = Map.of(
                "contents", List.of(
                        Map.of(
                                "parts", List.of(textPart, audioPart)
                        )
                ),
                "generationConfig", Map.of(
                        "responseMimeType", "application/json"
                )
        );

        String jsonBody = objectMapper.writeValueAsString(requestBody);

        HttpResponse<String> response = sendWithFallback(jsonBody, "Gemini ses dönüştürme hatası");

        JsonNode root = objectMapper.readTree(response.body());

        String transcriptJson = root.path("candidates")
                .path(0)
                .path("content")
                .path("parts")
                .path(0)
                .path("text")
                .asText();

        if (transcriptJson.isBlank()) {
            throw new RuntimeException("Gemini ses kaydından metin üretemedi.");
        }

        // Geçerli bir JSON dizisi döndüğünü doğrula
        JsonNode parsedNode = objectMapper.readTree(transcriptJson);
        if (!parsedNode.isArray() || parsedNode.isEmpty()) {
            throw new RuntimeException("Gemini konuşmacı ayrıştırma formatı geçersiz döndü.");
        }

        return transcriptJson;
    }
}