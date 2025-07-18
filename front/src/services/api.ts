import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api/interview';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 면접 시작 요청 데이터 타입
interface StartInterviewPayload {
  jobRole: string;
  experience: string;
  interviewType: string;
  resume?: string;
  jobDescription?: string;
  userName?: string;
}

// 면접 시작 응답 데이터 타입
interface StartInterviewData {
  sessionId: string;
  message: string;
  stage: string;
}

// 메시지 전송 요청 데이터 타입
interface SendMessagePayload {
  sessionId: string;
  message: string;
}

// 메시지 전송 응답 데이터 타입
interface SendMessageData {
  message: string;
  stage: string;
}

// 면접 종료 요청 데이터 타입
interface EndInterviewPayload {
  sessionId: string;
}

// 면접 종료 응답 데이터 타입
interface EndInterviewData {
  message: string;
  finalEvaluation: {
    overallScore: number;
    summary: string;
  };
}

// 세션 상태 응답 데이터 타입
interface SessionStatusData {
  sessionId: string;
  stage: string;
  turnCount: number;
  lastEvaluation: {
    score: number;
    reasoning: string;
  };
}

export const startInterview = async (
  payload: StartInterviewPayload
): Promise<StartInterviewData> => {
  try {
    const response = await apiClient.post('/start', payload);
    return response.data;
  } catch (error) {
    console.error('Error starting interview:', error);
    throw error;
  }
};

export const sendMessage = async (
  payload: SendMessagePayload
): Promise<SendMessageData> => {
  try {
    const response = await apiClient.post('/message', payload);
    return response.data;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

export const endInterview = async (
  payload: EndInterviewPayload
): Promise<EndInterviewData> => {
  try {
    const response = await apiClient.post('/end', payload);
    return response.data;
  } catch (error) {
    console.error('Error ending interview:', error);
    throw error;
  }
};

export const getSessionStatus = async (
  sessionId: string
): Promise<SessionStatusData> => {
  try {
    const response = await apiClient.get(`/status/${sessionId}`);
    return response.data;
  } catch (error) {
    console.error('Error getting session status:', error);
    throw error;
  }
}; 