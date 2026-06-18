const BASE_URL = import.meta.env.VITE_API_URL || "/api";

/**
 * Core fetch wrapper with auth token and error handling
 */
async function request(path, options = {}) {
  const token = localStorage.getItem("sakina_token");

  const headers = {
    "Content-Type": "application/json",
    "Bypass-Tunnel-Reminder": "true",
    "ngrok-skip-browser-warning": "true",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  // Safely parse JSON — handle empty bodies (204, network errors, etc.)
  let data = {};
  const contentType = response.headers.get("content-type") || "";
  const text = await response.text();
  if (text && contentType.includes("application/json")) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text };
    }
  } else if (text) {
    data = { message: text };
  }

  if (!response.ok) {
    const error = new Error(data.message || `Request failed: ${response.status}`);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}


// ================= AUTH =================
export const loginUser = (email, password) =>
  request("/users/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

export const registerUser = (name, email, password) =>
  request("/users/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });

export const getProfile = () => request("/users/profile");

export const updateProfile = (data) =>
  request("/users/profile", {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const deleteProfile = () =>
  request("/users/profile", {
    method: "DELETE",
  });

// ================= MOODS =================
export const createMood = (moodLevel, note) =>
  request("/moods", {
    method: "POST",
    body: JSON.stringify({ moodLevel, note }),
  });

export const getMoods = (page = 1, limit = 30) =>
  request(`/moods?page=${page}&limit=${limit}`);

// ================= SURVEYS =================
export const createSurvey = (surveyData) =>
  request("/surveys", {
    method: "POST",
    body: JSON.stringify(surveyData),
  });

export const getSurvey = () => request("/surveys");

// ================= EXERCISES =================
export const getExercises = () => request("/exercises");

export const generatePersonalizedExercises = (assessment) =>
  request("/exercises/generate", {
    method: "POST",
    body: JSON.stringify({ assessment }),
  });

// ================= CHAT =================
export const sendChatMessage = (text, context = {}, conversationId = null) =>
  request("/chat", {
    method: "POST",
    body: JSON.stringify({ text, context, conversationId }),
  });

export const getConversations = () => request("/chat/conversations");

export const getChatHistory = (conversationId) => request(`/chat/history/${conversationId}`);

export const generateTTSAudio = (text) =>
  request("/chat/tts", {
    method: "POST",
    body: JSON.stringify({ text }),
  });

export const transcribeVoice = async (audioBlob) => {
  const token = localStorage.getItem("sakina_token");
  const formData = new FormData();
  formData.append("file", audioBlob, "recording.webm");

  const response = await fetch(`${BASE_URL}/chat/voice-to-text`, {
    method: "POST",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: formData,
  });

  if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Transcription failed: ${errText}`);
  }
  return response.json();
};

export const saveJournalEntry = (text, detectedMood, reflectionQuestion) =>
  request("/journal", {
    method: "POST",
    body: JSON.stringify({ text, detectedMood, reflectionQuestion }),
  });

export const getJournalEntries = () => request("/journal");

export const deleteJournalEntry = (id) =>
  request(`/journal/${id}`, {
    method: "DELETE",
  });

// ================= INTERVENTIONS / SESSIONS =================
export const saveInterventionSession = (sessionData) =>
  request("/interventions", {
    method: "POST",
    body: JSON.stringify(sessionData),
  });

export const getInterventionHistory = () => request("/interventions");

export const getInterventionStats = () => request("/interventions/stats");

// ================= RISK ASSESSMENT =================
export const getRiskAssessment = () => request("/risk-assessment");

// ================= ADMIN MANAGEMENT =================
export const getUsersAdmin = () => request("/users");

export const deleteUserAdmin = (id) =>
  request(`/users/manage/${id}`, {
    method: "DELETE",
  });

export const changeUserPasswordAdmin = (userId, newPassword) =>
  request("/users/change-password-admin", {
    method: "POST",
    body: JSON.stringify({ userId, newPassword }),
  });

export const createExerciseAdmin = (exerciseData) =>
  request("/exercises", {
    method: "POST",
    body: JSON.stringify(exerciseData),
  });

export const updateExerciseAdmin = (id, exerciseData) =>
  request(`/exercises/${id}`, {
    method: "PUT",
    body: JSON.stringify(exerciseData),
  });

export const deleteExerciseAdmin = (id) =>
  request(`/exercises/${id}`, {
    method: "DELETE",
  });
