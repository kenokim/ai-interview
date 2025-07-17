import axios from 'axios';

const API_URL = 'http://localhost:3000/api/interview';

// Define types for API requests and responses
// These should match the types in the backend (server/src/types/api.ts)
interface StartInterviewRequest {
  initial_state?: Record<string, any>;
}

interface SendMessageRequest {
  sessionId: string;
  message: string;
}

interface EndInterviewRequest {
  sessionId: string;
}

// API functions
export const startInterview = async (data: StartInterviewRequest) => {
  const response = await axios.post(`${API_URL}/start`, data);
  return response.data;
};

export const sendMessage = async (data: SendMessageRequest) => {
  const response = await axios.post(`${API_URL}/message`, data);
  return response.data;
};

export const getSessionStatus = async (sessionId: string) => {
  const response = await axios.get(`${API_URL}/status/${sessionId}`);
  return response.data;
};

export const endInterview = async (data: EndInterviewRequest) => {
  const response = await axios.post(`${API_URL}/end`, data);
  return response.data;
};

export const getAllSessions = async () => {
  const response = await axios.get(`${API_URL}/sessions`);
  return response.data;
}; 