
import { API_URL } from './api';

export interface AuthResponse {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  token: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export async function login(data: LoginData): Promise<AuthResponse> {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Giriş başarısız.');
  }

  return result;
}

export async function register(
  data: RegisterData,
): Promise<AuthResponse> {
  const response = await fetch(`${API_URL}/api/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Kayıt başarısız.');
  }

  return result;
}

export async function updateProfile(
  data: { firstName: string; lastName: string },
  token: string
): Promise<AuthResponse> {
  const response = await fetch(`${API_URL}/api/auth/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Profil güncellenemedi.');
  }

  return result;
}

export async function changePassword(
  data: {
    currentPassword: string;
    newPassword: string;
  },
  token: string
): Promise<void> {
  const response = await fetch(`${API_URL}/api/auth/change-password`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    let message = 'Şifre değiştirilemedi.';

    try {
      const result = await response.json();
      message = result.message || message;
    } catch {
      // Sunucu yanıtında JSON mesajı yoksa varsayılan mesaj kullanılır.
    }

    throw new Error(message);
  }
}