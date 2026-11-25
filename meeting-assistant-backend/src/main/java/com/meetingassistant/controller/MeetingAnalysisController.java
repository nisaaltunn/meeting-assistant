
package com.meetingassistant.controller;

import com.meetingassistant.entity.Meeting;
import com.meetingassistant.Service.MeetingService;
import com.meetingassistant.Service.MeetingAnalysisService;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/meetings")
public class MeetingAnalysisController {

    private final MeetingService meetingService;
    private final MeetingAnalysisService meetingAnalysisService;

    public MeetingAnalysisController(
            MeetingService meetingService,
            MeetingAnalysisService meetingAnalysisService) {

        this.meetingService = meetingService;
        this.meetingAnalysisService = meetingAnalysisService;
    }

    @PostMapping("/{id}/analyze")
    public Map<String, Object> analyzeMeeting(
            @PathVariable Long id,
            Authentication authentication) throws Exception {

        // Kullanıcının toplantıya erişim yetkisini kontrol et.
        Meeting meeting = meetingService.getMeetingById(
                id,
                authentication.getName()
        );

        // Gemini analizini yap ve PostgreSQL'e kaydet.
        return meetingAnalysisService.analyzeAndSave(meeting);
    }
}
