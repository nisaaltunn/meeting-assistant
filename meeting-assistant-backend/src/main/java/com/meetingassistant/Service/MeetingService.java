
package com.meetingassistant.Service;

import com.meetingassistant.entity.Meeting;
import com.meetingassistant.entity.User;
import com.meetingassistant.repository.MeetingRepository;
import com.meetingassistant.repository.UserRepository;
import com.meetingassistant.dto.MeetingSaveResponse;

import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class MeetingService {

    private final MeetingRepository meetingRepository;
    private final UserRepository userRepository;

    public MeetingService(
            MeetingRepository meetingRepository,
            UserRepository userRepository
    ) {
        this.meetingRepository = meetingRepository;
        this.userRepository = userRepository;
    }

    // Toplantı oluştur veya mevcut toplantıya ekleme yap
    public MeetingSaveResponse saveMeeting(Meeting meeting, String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı."));

        String title = meeting.getTitle().trim();

        Meeting existingMeeting = meetingRepository
                .findFirstByUser_IdAndTitleIgnoreCase(user.getId(), title)
                .orElse(null);

        if (existingMeeting != null) {

            String oldTranscript = existingMeeting.getTranscript();
            String newTranscript = meeting.getTranscript();

            if (oldTranscript == null || oldTranscript.isBlank()) {
                existingMeeting.setTranscript(newTranscript);
            } else if (newTranscript != null && !newTranscript.isBlank()) {
                existingMeeting.setTranscript(
                        oldTranscript + "\n\n" + newTranscript
                );
            }

            int oldDuration = existingMeeting.getDurationSeconds() != null
                    ? existingMeeting.getDurationSeconds() : 0;

            int newDuration = meeting.getDurationSeconds() != null
                    ? meeting.getDurationSeconds() : 0;

            existingMeeting.setDurationSeconds(oldDuration + newDuration);

            Meeting savedMeeting = meetingRepository.save(existingMeeting);

            return new MeetingSaveResponse(
                    savedMeeting,
                    true,
                    "Mevcut toplantı başarıyla güncellendi."
            );
        }

        meeting.setTitle(title);
        meeting.setUser(user);

        Meeting savedMeeting = meetingRepository.save(meeting);

        return new MeetingSaveResponse(
                savedMeeting,
                false,
                "Yeni toplantı başarıyla kaydedildi."
        );
    }

    // Kullanıcının toplantılarını getir
    public List<Meeting> getAllMeetings(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı."));

        return meetingRepository.findAllByUserId(user.getId());
    }

    // Kullanıcıya ait tek toplantıyı getir
    public Meeting getMeetingById(Long id, String email) {

        Meeting meeting = meetingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Toplantı bulunamadı."));

        if (!meeting.getUser().getEmail().equals(email)) {
            throw new RuntimeException("Bu toplantıya erişim izniniz yok.");
        }

        return meeting;
    }

    // Kullanıcıya ait toplantıyı sil
    public void deleteMeeting(Long id, String email) {

        Meeting meeting = getMeetingById(id, email);
        meetingRepository.delete(meeting);
    }
}
