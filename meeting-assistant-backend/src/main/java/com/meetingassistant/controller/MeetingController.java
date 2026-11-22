package com.meetingassistant.controller;

import com.meetingassistant.entity.Meeting;
import com.meetingassistant.Service.MeetingService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/meetings")
@CrossOrigin(origins = "*")
public class MeetingController {

    private final MeetingService meetingService;

    public MeetingController(MeetingService meetingService) {
        this.meetingService = meetingService;
    }

    // Toplantı kaydetme
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Meeting createMeeting(@RequestBody Meeting meeting) {
        return meetingService.saveMeeting(meeting);
    }

    // Bütün toplantıları listeleme
    @GetMapping
    public List<Meeting> getAllMeetings() {
        return meetingService.getAllMeetings();
    }

    // ID ile toplantı getirme
    @GetMapping("/{id}")
    public Meeting getMeetingById(@PathVariable Long id) {
        return meetingService.getMeetingById(id);
    }

    // Toplantı silme
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteMeeting(@PathVariable Long id) {
        meetingService.deleteMeeting(id);
    }
}