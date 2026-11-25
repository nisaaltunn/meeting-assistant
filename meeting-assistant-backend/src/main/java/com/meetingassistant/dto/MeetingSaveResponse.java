package com.meetingassistant.dto;

import com.meetingassistant.entity.Meeting;

public class MeetingSaveResponse {

    private Meeting meeting;
    private boolean updated;
    private String message;

    public MeetingSaveResponse(Meeting meeting, boolean updated, String message) {
        this.meeting = meeting;
        this.updated = updated;
        this.message = message;
    }

    public Meeting getMeeting() {
        return meeting;
    }

    public boolean isUpdated() {
        return updated;
    }

    public String getMessage() {
        return message;
    }
}