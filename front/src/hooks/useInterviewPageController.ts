import { useEffect, useMemo, useRef, useState } from "react";
import type { NavigateFunction } from "react-router-dom";

import cultureFitQuestions from "@/assets/culturefit_questions.json";
import type {
  ChatMessageType,
  EndInterviewPayloadType,
  ExperienceLevelType,
  InterviewStateType,
  SendMessagePayloadType,
  SendMessageResponseType,
  StartInterviewPayloadType,
  StartInterviewResponseType,
} from "@/types/interview";

type UseInterviewPageControllerParamsType = {
  readonly state: InterviewStateType | undefined;
  readonly appLanguage: string;
  readonly navigate: NavigateFunction;
};

type UseInterviewPageControllerReturnType = {
  readonly sessionId: string | null;
  readonly isChatOpen: boolean;
  readonly setIsChatOpen: (next: boolean) => void;
  readonly isRecording: boolean;
  readonly microphoneEnabled: boolean;
  readonly toggleRecording: () => void;
  readonly showAvatar: boolean;
  readonly setShowAvatar: (next: boolean) => void;
  readonly chatMessages: readonly ChatMessageType[];
  readonly currentMessage: string;
  readonly setCurrentMessage: (next: string) => void;
  readonly isSending: boolean;
  readonly elapsedTime: number;
  readonly chatContainerRef: React.RefObject<HTMLDivElement>;
  readonly inputRef: React.RefObject<HTMLInputElement>;
  readonly handleSendMessage: () => Promise<void>;
  readonly handleNextQuestion: () => Promise<void>;
  readonly handleEndInterview: () => Promise<void>;
  readonly handleKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  readonly getInterviewTypeDisplay: () => string;
  readonly formatTime: (totalSeconds: number) => string;
};

const API_BASE_URL =
  (import.meta as unknown as { env?: { VITE_API_BASE_URL?: string } }).env
    ?.VITE_API_BASE_URL ?? "http://localhost:3000/api/interview";

async function postJson<TResponse, TBody extends Record<string, unknown>>(
  path: string,
  body: TBody
): Promise<TResponse> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} ${response.statusText}`);
  }

  const json: unknown = await response.json();
  return json as TResponse;
}

async function startInterview(
  payload: StartInterviewPayloadType
): Promise<StartInterviewResponseType> {
  return postJson<StartInterviewResponseType, StartInterviewPayloadType>(
    "/start",
    payload
  );
}

async function sendMessage(
  payload: SendMessagePayloadType
): Promise<SendMessageResponseType> {
  return postJson<SendMessageResponseType, SendMessagePayloadType>(
    "/message",
    payload
  );
}

async function endInterview(payload: EndInterviewPayloadType): Promise<unknown> {
  return postJson<unknown, EndInterviewPayloadType>("/end", payload);
}

function parseSessionStartTimeMs(sessionId: string): number | null {
  // Expected legacy format: session_<timestamp>_xxxx
  const parts = sessionId.split("_");
  const maybe = parts[1];
  const ts = maybe ? Number(maybe) : NaN;
  return Number.isFinite(ts) ? ts : null;
}

export function useInterviewPageController(
  params: UseInterviewPageControllerParamsType
): UseInterviewPageControllerReturnType {
  const { state, appLanguage, navigate } = params;

  const microphoneEnabled = state?.microphoneEnabled ?? false;

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(() => {
    const saved = localStorage.getItem("isChatOpen");
    if (saved === null) return false;
    try {
      return JSON.parse(saved) as boolean;
    } catch {
      return false;
    }
  });

  const [isRecording, setIsRecording] = useState(false);
  const [showAvatar, setShowAvatar] = useState(true);
  const [chatMessages, setChatMessages] = useState<ChatMessageType[]>([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [askedQuestionIds, setAskedQuestionIds] = useState<number[]>([]);

  const thinkingIdRef = useRef<number | null>(null);
  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const sessionStartTimeMsRef = useRef<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  const interviewType = state?.interviewType ?? "technical";
  const texts = useMemo<Record<string, string>>(() => {
    // The consumer uses LanguageContext texts; this hook keeps API-independent helpers.
    // We only need a stable object for getInterviewTypeDisplay in this hook.
    return {};
  }, []);

  useEffect(() => {
    localStorage.setItem("isChatOpen", JSON.stringify(isChatOpen));
  }, [isChatOpen]);

  useEffect(() => {
    if (!microphoneEnabled && isRecording) {
      setIsRecording(false);
    }
  }, [microphoneEnabled, isRecording]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages, isChatOpen]);

  useEffect(() => {
    if (!sessionId) return;

    if (sessionStartTimeMsRef.current === null) {
      sessionStartTimeMsRef.current =
        parseSessionStartTimeMs(sessionId) ?? Date.now();
    }

    const timer = window.setInterval(() => {
      const startMs = sessionStartTimeMsRef.current ?? Date.now();
      setElapsedTime(Math.floor((Date.now() - startMs) / 1000));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [sessionId]);

  useEffect(() => {
    const initializeInterview = async (): Promise<void> => {
      if (!state) {
        navigate(`/${appLanguage}`);
        return;
      }

      const thinkingMessageId = Date.now();
      setChatMessages([
        {
          id: thinkingMessageId,
          type: "ai",
          message: "...",
          isThinking: true,
        },
      ]);

      try {
        const getExperienceLevel = (exp: number): ExperienceLevelType => {
          if (exp <= 2) return "junior";
          if (exp <= 5) return "mid-level";
          return "senior";
        };

        const payload: StartInterviewPayloadType = {
          jobRole: state.jobRole,
          language: state.language,
          experience: getExperienceLevel(state.experience),
          interviewType: state.interviewType,
          resume: state.resume,
          jobDescription: state.jobDescription,
          userName: "사용자",
        };

        const response = await startInterview(payload);

        if (response && response.sessionId) {
          setSessionId(response.sessionId);
          sessionStartTimeMsRef.current =
            parseSessionStartTimeMs(response.sessionId) ?? Date.now();
          setChatMessages((prev) =>
            prev.map((msg) =>
              msg.id === thinkingMessageId
                ? { ...msg, message: response.message, isThinking: false }
                : msg
            )
          );
          return;
        }

        setChatMessages((prev) =>
          prev.map((msg) =>
            msg.id === thinkingMessageId
              ? {
                  ...msg,
                  message:
                    "면접 시작에 실패했습니다. 서버 응답이 올바르지 않습니다.",
                  isThinking: false,
                }
              : msg
          )
        );
      } catch (error) {
        console.error("Error starting interview:", error);
        setChatMessages((prev) =>
          prev.map((msg) =>
            msg.id === thinkingMessageId
              ? {
                  ...msg,
                  message: "서버와 통신 중 오류가 발생했습니다.",
                  isThinking: false,
                }
              : msg
          )
        );
      }
    };

    void initializeInterview();
  }, [state, navigate, appLanguage]);

  const handleSendMessage = async (): Promise<void> => {
    if (!currentMessage.trim() || !sessionId || isSending) return;

    const userMessage: ChatMessageType = {
      id: Date.now(),
      type: "user",
      message: currentMessage.trim(),
    };

    const thinkingMessage: ChatMessageType = {
      id: Date.now() + 1,
      type: "ai",
      message: "...",
      isThinking: true,
    };

    setChatMessages((prev) => [...prev, userMessage, thinkingMessage]);
    setCurrentMessage("");
    inputRef.current?.focus();
    setIsSending(true);
    thinkingIdRef.current = thinkingMessage.id;

    try {
      const apiPayload: SendMessagePayloadType = {
        sessionId,
        message: userMessage.message,
      };
      const response = await sendMessage(apiPayload);
      setChatMessages((prev) =>
        prev.map((m) =>
          m.id === thinkingMessage.id
            ? { ...m, message: response.message, isThinking: false }
            : m
        )
      );
    } catch (error) {
      console.error("❌ [UI] 메시지 전송 실패:", error);
      setChatMessages((prev) =>
        prev.map((msg) =>
          msg.id === thinkingMessage.id
            ? {
                ...msg,
                message: "서버 오류: 메시지를 전송할 수 없습니다.",
                isThinking: false,
              }
            : msg
        )
      );
    } finally {
      setIsSending(false);
      thinkingIdRef.current = null;
    }
  };

  const handleNextQuestion = async (): Promise<void> => {
    if (!sessionId || isSending) return;

    if (interviewType === "culture") {
      const remainingQuestions = cultureFitQuestions.questions.filter(
        (q: { id: number }) => !askedQuestionIds.includes(q.id)
      );

      if (remainingQuestions.length === 0) {
        const endMessage =
          appLanguage === "ko"
            ? "모든 질문이 완료되었습니다. 면접을 종료하시겠습니까?"
            : "All questions have been completed. Would you like to end the interview?";
        setChatMessages((prev) => [
          ...prev,
          { id: Date.now(), type: "ai", message: endMessage },
        ]);
        return;
      }

      const randomIndex = Math.floor(Math.random() * remainingQuestions.length);
      const selectedQuestion = remainingQuestions[randomIndex] as {
        id: number;
        question: string;
        question_en: string;
      };

      const questionText =
        appLanguage === "ko"
          ? selectedQuestion.question
          : selectedQuestion.question_en;

      setChatMessages((prev) => [
        ...prev,
        { id: Date.now(), type: "ai", message: questionText },
      ]);
      setAskedQuestionIds((prev) => [...prev, selectedQuestion.id]);
      return;
    }

    const thinkingMessage: ChatMessageType = {
      id: Date.now(),
      type: "ai",
      message: "...",
      isThinking: true,
    };

    setChatMessages((prev) => [...prev, thinkingMessage]);
    setIsSending(true);
    thinkingIdRef.current = thinkingMessage.id;

    const nextQuestionText =
      appLanguage === "ko" ? "다음 질문을 해주세요." : "Please give me the next question.";

    try {
      const apiPayload: SendMessagePayloadType = {
        sessionId,
        message: nextQuestionText,
      };
      const response = await sendMessage(apiPayload);
      setChatMessages((prev) =>
        prev.map((m) =>
          m.id === thinkingMessage.id
            ? { ...m, message: response.message, isThinking: false }
            : m
        )
      );
    } catch (error) {
      console.error("❌ [UI] 메시지 전송 실패:", error);
      setChatMessages((prev) =>
        prev.map((msg) =>
          msg.id === thinkingMessage.id
            ? {
                ...msg,
                message: "서버 오류: 메시지를 전송할 수 없습니다.",
                isThinking: false,
              }
            : msg
        )
      );
    } finally {
      setIsSending(false);
      thinkingIdRef.current = null;
    }
  };

  const handleEndInterview = async (): Promise<void> => {
    if (sessionId) {
      try {
        const payload: EndInterviewPayloadType = { sessionId };
        await endInterview(payload);
        navigate(`/${appLanguage}/report`, { state: { sessionId } });
      } catch (error) {
        console.error("Error ending interview:", error);
        navigate(`/${appLanguage}/report`, { state: { sessionId } });
      }
      return;
    }

    navigate(`/${appLanguage}/report`);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Enter") {
      void handleSendMessage();
    }
  };

  const toggleRecording = (): void => {
    if (!microphoneEnabled) return;
    setIsRecording((prev) => !prev);
  };

  const getInterviewTypeDisplay = (): string => {
    // This helper is kept for compatibility with the existing UI.
    // The caller already has LanguageContext texts; it can be moved later.
    if (interviewType === "technical") {
      return (texts.technicalInterview ?? "Technical Interview") as string;
    }
    return (texts.cultureInterview ?? "Culture Fit Interview") as string;
  };

  const formatTime = (totalSeconds: number): string => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const parts: string[] = [];
    if (hours > 0) {
      parts.push(String(hours).padStart(2, "0"));
    }
    parts.push(String(minutes).padStart(2, "0"));
    parts.push(String(seconds).padStart(2, "0"));
    return parts.join(":");
  };

  return {
    sessionId,
    isChatOpen,
    setIsChatOpen,
    isRecording,
    microphoneEnabled,
    toggleRecording,
    showAvatar,
    setShowAvatar,
    chatMessages,
    currentMessage,
    setCurrentMessage,
    isSending,
    elapsedTime,
    chatContainerRef,
    inputRef,
    handleSendMessage,
    handleNextQuestion,
    handleEndInterview,
    handleKeyPress,
    getInterviewTypeDisplay,
    formatTime,
  };
}


