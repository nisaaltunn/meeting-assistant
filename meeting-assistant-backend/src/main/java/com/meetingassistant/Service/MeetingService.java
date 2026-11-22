package com.meetingassistant.Service;

import com.meetingassistant.entity.Meeting;
import com.meetingassistant.repository.MeetingRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MeetingService {

    private final MeetingRepository meetingRepository;

    public MeetingService(MeetingRepository meetingRepository) {
        this.meetingRepository = meetingRepository;
    }

    public Meeting saveMeeting(Meeting meeting) {
        return meetingRepository.save(meeting);
    }

    public List<Meeting> getAllMeetings() {
        return meetingRepository.findAll();
    }

    public Meeting getMeetingById(Long id) {
        return meetingRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Toplantı bulunamadı: " + id));
    }

    public void deleteMeeting(Long id) {
        meetingRepository.deleteById(id);
    }
}