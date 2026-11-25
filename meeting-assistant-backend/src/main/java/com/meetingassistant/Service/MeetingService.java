package com.meetingassistant.Service;

import com.meetingassistant.entity.Meeting;
import com.meetingassistant.entity.User;
import com.meetingassistant.repository.MeetingRepository;
import com.meetingassistant.repository.UserRepository;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MeetingService {

    private final MeetingRepository meetingRepository;
    private final UserRepository userRepository;

    public MeetingService(
            MeetingRepository meetingRepository,
            UserRepository userRepository) {

        this.meetingRepository = meetingRepository;
        this.userRepository = userRepository;
    }

    // Toplantı oluştur
    public Meeting saveMeeting(Meeting meeting, String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("Kullanıcı bulunamadı."));

        meeting.setUser(user);

        return meetingRepository.save(meeting);
    }

    // Kullanıcının toplantılarını getir
    public List<Meeting> getAllMeetings(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("Kullanıcı bulunamadı."));

        return meetingRepository.findAllByUserId(user.getId());
    }

    // Kullanıcıya ait tek toplantıyı getir
    public Meeting getMeetingById(Long id, String email) {

        Meeting meeting = meetingRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Toplantı bulunamadı."));

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