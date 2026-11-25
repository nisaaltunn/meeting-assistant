package com.meetingassistant.controller;

import com.meetingassistant.entity.Meeting;
import com.meetingassistant.Service.MeetingService;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
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

    // Toplantı oluştur
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Meeting createMeeting(
            @RequestBody Meeting meeting,
            Authentication authentication) {

        return meetingService.saveMeeting(
                meeting,
                authentication.getName()
        );
    }

    // Kullanıcının tüm toplantıları
    @GetMapping
    public List<Meeting> getAllMeetings(
            Authentication authentication) {

        return meetingService.getAllMeetings(
                authentication.getName()
        );
    }

    // Tek toplantı getir
    @GetMapping("/{id}")
    public Meeting getMeetingById(
            @PathVariable Long id,
            Authentication authentication) {

        return meetingService.getMeetingById(
                id,
                authentication.getName()
        );
    }

    // Toplantı sil
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteMeeting(
            @PathVariable Long id,
            Authentication authentication) {

        meetingService.deleteMeeting(
                id,
                authentication.getName()
        );
    }
}