
package com.meetingassistant.Service;

import com.fasterxml.jackson.databind.JsonNode;
import com.meetingassistant.Service.GeminiService;
import com.meetingassistant.entity.*;
import com.meetingassistant.repository.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.type.TypeReference;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Map;

@Service
public class MeetingAnalysisService {
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final GeminiService geminiService;
    private final SummaryRepository summaryRepository;
    private final DecisionRepository decisionRepository;
    private final TaskRepository taskRepository;
    private final ParticipantRepository participantRepository;

    public MeetingAnalysisService(
            GeminiService geminiService,
            SummaryRepository summaryRepository,
            DecisionRepository decisionRepository,
            TaskRepository taskRepository,
            ParticipantRepository participantRepository) {

        this.geminiService = geminiService;
        this.summaryRepository = summaryRepository;
        this.decisionRepository = decisionRepository;
        this.taskRepository = taskRepository;
        this.participantRepository = participantRepository;
    }

    @Transactional
    public Map<String, Object> analyzeAndSave(Meeting meeting) throws Exception {

        JsonNode analysis = geminiService.analyzeMeeting(
                meeting.getTranscript()
        );

        // Özeti kaydet veya güncelle.
        Summary summary = summaryRepository
                .findByMeeting_Id(meeting.getId())
                .orElseGet(Summary::new);

        summary.setMeeting(meeting);
        summary.setContent(analysis.path("summary").asText());

        summaryRepository.save(summary);

        // Önceki kararları sil, yenilerini kaydet.
        decisionRepository.deleteAllByMeeting_Id(meeting.getId());

        for (JsonNode item : analysis.path("decisions")) {
            if (item.isTextual() && !item.asText().isBlank()) {
                Decision decision = new Decision();
                decision.setMeeting(meeting);
                decision.setDescription(item.asText());

                decisionRepository.save(decision);
            }
        }

        // Önceki görevleri sil, yenilerini kaydet.
        taskRepository.deleteAllByMeeting_Id(meeting.getId());

        for (JsonNode item : analysis.path("tasks")) {
            if (!item.isObject()) {
                continue;
            }

            String description = item.path("description").asText();

            if (description.isBlank()) {
                continue;
            }

            Task task = new Task();
            task.setMeeting(meeting);
            task.setDescription(description);

            JsonNode responsiblePerson = item.get("responsiblePerson");
            if (responsiblePerson != null && !responsiblePerson.isNull()) {
                task.setResponsiblePerson(responsiblePerson.asText());
            }

            JsonNode deadline = item.get("deadline");
            if (deadline != null && !deadline.isNull()
                    && !deadline.asText().isBlank()) {
                task.setDeadline(LocalDate.parse(deadline.asText()));
            }

            task.setCompleted(false);
            taskRepository.save(task);
        }

        // Önceki katılımcıları sil, yenilerini kaydet.
        participantRepository.deleteAllByMeeting_Id(meeting.getId());

        for (JsonNode item : analysis.path("participants")) {
            if (!item.isObject()) {
                continue;
            }

            String speakerLabel = item.path("speakerLabel").asText();

            if (speakerLabel.isBlank()) {
                continue;
            }

            Participant participant = new Participant();
            participant.setMeeting(meeting);
            participant.setSpeakerLabel(speakerLabel);

            JsonNode name = item.get("name");
            if (name != null && !name.isNull()) {
                participant.setName(name.asText());
            }

            participantRepository.save(participant);
        }

        Map<String, Object> analysisMap = objectMapper.convertValue(
                analysis,
                new TypeReference<Map<String, Object>>() {}
        );

        return Map.of(
                "meetingId", meeting.getId(),
                "message", "Toplantı analizi başarıyla kaydedildi.",
                "analysis", analysisMap
        );
    }
}
