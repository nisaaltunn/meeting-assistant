package com.meetingassistant.dto;

import java.util.List;

public record AudioAnalysisResponse(
        String summary,
        List<String> keyPoints,
        List<DialogueLine> transcript
) {
    public record DialogueLine(
            String speaker,
            String text
    ) {}
}