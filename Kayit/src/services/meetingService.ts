
import { API_URL } from './api';

export interface MeetingData {
  title: string;
  transcript: string;
  durationSeconds: number;
}

export interface Meeting {
  id: number;
  title: string;
  transcript: string;
  durationSeconds: number;
  createdAt?: string;
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

export async function getMeetings(
  token: string
): Promise<Meeting[]> {
  const response = await fetch(`${API_URL}/api/meetings`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Toplantılar getirilemedi.');
  }

  return response.json();
}

export async function getMeetingById(
  id: number,
  token: string
): Promise<Meeting> {
  const response = await fetch(`${API_URL}/api/meetings/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Toplantı detayı getirilemedi.');
  }

  return response.json();
}

export async function deleteMeeting(
  id: number,
  token: string
) {
  const response = await fetch(`${API_URL}/api/meetings/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Toplantı silinemedi.');
  }
}
