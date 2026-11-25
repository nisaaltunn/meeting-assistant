
import { API_URL } from './api';

export interface MeetingAnalysis {
  summary: string;
  decisions: string[];
  tasks: {
    description: string;
    responsiblePerson: string | null;
    deadline: string | null;
  }[];
  participants: {
    speakerLabel: string;
    name: string | null;
  }[];
}

export interface MeetingAnalysisResponse {
  meetingId: number;
  message: string;
  analysis: MeetingAnalysis;
}

export async function analyzeMeeting(
  meetingId: number,
  token: string
): Promise<MeetingAnalysisResponse> {

  const response = await fetch(
    `${API_URL}/api/meetings/${meetingId}/analyze`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message || 'Toplantı analizi başarısız.'
    );
  }

  return result as MeetingAnalysisResponse;
}
