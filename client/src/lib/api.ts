import type { SafeUser } from '@shared/schema';

const API_BASE = (import.meta as any).env?.PROD ? '/api' : 'http://localhost:3000/api';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  details?: any;
}

// Helper function for API calls
async function apiCall<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  const data: ApiResponse<T> = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Request failed');
  }

  return data.data as T;
}

// ============================================================================
// Auth API
// ============================================================================

export async function register(data: {
  email: string;
  displayName: string;
  password: string;
}): Promise<SafeUser> {
  return apiCall<SafeUser>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function login(data: {
  email: string;
  password: string;
}): Promise<SafeUser> {
  return apiCall<SafeUser>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function logout(): Promise<void> {
  await apiCall<void>('/auth/logout', {
    method: 'POST',
  });
}

export async function getCurrentUser(): Promise<SafeUser> {
  return apiCall<SafeUser>('/auth/me');
}

// ============================================================================
// Levels API
// ============================================================================

export async function getLevels() {
  return apiCall('/levels');
}

export async function getLevel(id: number) {
  return apiCall(`/levels/${id}`);
}

export async function getLevelExercises(id: number) {
  return apiCall(`/levels/${id}/exercises`);
}

export async function startLevel(id: number) {
  return apiCall(`/levels/${id}/start`, {
    method: 'POST',
  });
}

// ============================================================================
// Exercises API
// ============================================================================

export async function getExercise(id: number) {
  return apiCall(`/exercises/${id}`);
}

export async function submitExerciseAttempt(
  id: number,
  data: {
    userResponse: string;
    audioRecordingUrl?: string;
    attemptDuration?: number;
  }
) {
  return apiCall(`/exercises/${id}/attempt`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function skipExercise(id: number) {
  return apiCall(`/exercises/${id}/skip`, {
    method: 'POST',
  });
}

// ============================================================================
// Progress API
// ============================================================================

export async function getProgress() {
  return apiCall('/progress');
}

export async function getProgressStats() {
  return apiCall('/progress/stats');
}

export async function getLevelProgress(id: number) {
  return apiCall(`/progress/levels/${id}`);
}

// ============================================================================
// Garden API
// ============================================================================

export async function getGarden() {
  return apiCall('/garden');
}

export async function updateGarden(updates: any) {
  return apiCall('/garden', {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
}

export async function waterGarden() {
  return apiCall('/garden/water', {
    method: 'POST',
  });
}

export async function getGardenMessages() {
  return apiCall('/garden/messages');
}

export async function markMessageRead(id: number) {
  return apiCall(`/garden/messages/${id}/read`, {
    method: 'POST',
  });
}
