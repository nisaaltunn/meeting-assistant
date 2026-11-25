
import { API_URL } from './api';
import type { AuthResponse } from './authService';

export interface MeetingData {
  title: string;
  transcript: string;
  durationSeconds: number;
}

export async function saveMeeting(
  data: MeetingData,
  token: string
) {
  const response = await fetch(`${API_URL}/api/meetings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Toplantı kaydedilemedi.');
  }

  return result;
}
