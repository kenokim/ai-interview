import { useEffect, useMemo, useRef, useState } from "react";
import type { NavigateFunction } from "react-router-dom";

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
  readonly handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  readonly getInterviewTypeDisplay: () => string;
  readonly formatTime: (totalSeconds: number) => string;

  // Question flow
  readonly questionText: string | null;
  readonly questionPhase: "idle" | "prep" | "answer" | "done";
  readonly prepSecondsLeft: number;
  readonly answerSecondsLeft: number;
};

function getApiBaseUrl(): string {
  const raw =
    (import.meta as unknown as { env?: { VITE_API_BASE_URL?: string } }).env
      ?.VITE_API_BASE_URL ?? "http://localhost:8000";
  return raw.replace(/\/+$/, "");
}

const API_BASE_URL = `${getApiBaseUrl()}/api/v1/interview`;

function buildAssetUrl(path: string): string {
  const normalized = path.replace(/^\/+/, "");
  return `${getApiBaseUrl()}/${normalized}`;
}

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

async function getJson<TResponse>(path: string): Promise<TResponse> {
  const response = await fetch(`${API_BASE_URL}${path}`, { method: "GET" });

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

type InterviewQuestionType = {
  readonly id: string;
  readonly type?: string;
  readonly role?: string;
  readonly difficulty?: string;
  readonly question: {
    readonly ko?: string;
    readonly en?: string;
  };
  readonly tts?: {
    readonly ko?: string | null;
    readonly en?: string | null;
  };
};

async function fetchQuestions(params: {
  readonly interviewType: string;
  readonly role: string;
}): Promise<readonly InterviewQuestionType[]> {
  const questionType =
    params.interviewType === "culture" ? "culture" : "tech";

  const qs = new URLSearchParams();
  qs.set("type", questionType);
  if (questionType === "tech") {
    qs.set("role", params.role);
  }

  return getJson<readonly InterviewQuestionType[]>(`/questions?${qs.toString()}`);
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
  const speakerEnabled = state?.speakerEnabled ?? true;
  const audioPlaybackReady = state?.audioPlaybackReady ?? false;

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

  const [questions, setQuestions] = useState<readonly InterviewQuestionType[]>(
    []
  );
  const [questionIndex, setQuestionIndex] = useState(0);
  const [questionText, setQuestionText] = useState<string | null>(null);
  const [questionPhase, setQuestionPhase] = useState<
    "idle" | "prep" | "answer" | "done"
  >("idle");
  const [prepSecondsLeft, setPrepSecondsLeft] = useState(0);
  const [answerSecondsLeft, setAnswerSecondsLeft] = useState(0);

  const prepTimerRef = useRef<number | null>(null);
  const answerTimerRef = useRef<number | null>(null);
  const hasAutoStartedRef = useRef(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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

          // Load questions from repository-backed API as soon as the session starts.
          try {
            const loaded = await fetchQuestions({
              interviewType: state.interviewType,
              role: state.jobRole,
            });
            // Shuffle once for variety.
            const shuffled = [...loaded].sort(() => Math.random() - 0.5);
            setQuestions(shuffled);
            setQuestionIndex(0);
          } catch (e) {
            console.error("Failed to fetch questions:", e);
          }

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

  const clearQuestionTimers = (): void => {
    if (prepTimerRef.current !== null) {
      window.clearInterval(prepTimerRef.current);
      prepTimerRef.current = null;
    }
    if (answerTimerRef.current !== null) {
      window.clearInterval(answerTimerRef.current);
      answerTimerRef.current = null;
    }
  };

  const stopAudio = (): void => {
    const current = audioRef.current;
    if (!current) return;
    try {
      current.pause();
      current.currentTime = 0;
    } catch {
      // Ignore playback stop errors.
    } finally {
      audioRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      clearQuestionTimers();
      stopAudio();
    };
  }, []);

  const pickQuestionText = (q: InterviewQuestionType): string | null => {
    const lang = state?.language ?? "korean";
    const isKo = lang === "korean";
    const txt = isKo ? q.question.ko : q.question.en;
    return typeof txt === "string" && txt.trim() ? txt.trim() : null;
  };

  const startQuestionFlow = (q: InterviewQuestionType): void => {
    clearQuestionTimers();
    stopAudio();

    const txt = pickQuestionText(q);
    if (!txt) return;

    setQuestionText(txt);
    setChatMessages((prev) => [
      ...prev,
      { id: Date.now(), type: "ai", message: txt },
    ]);

    setQuestionPhase("prep");
    setPrepSecondsLeft(3);
    setAnswerSecondsLeft(60);

    if (speakerEnabled && audioPlaybackReady) {
      const lang = state?.language ?? "korean";
      const langKey = lang === "korean" ? "ko" : "en";
      const ttsPath = q.tts?.[langKey];
      if (typeof ttsPath === "string" && ttsPath.trim()) {
        const url = buildAssetUrl(ttsPath);
        try {
          const audio = new Audio(url);
          audioRef.current = audio;
          void audio.play().catch((e) => {
            // If audio wasn't unlocked on the settings page, browsers can block autoplay here.
            console.warn("Audio play blocked or failed:", e);
          });
        } catch (e) {
          console.warn("Failed to initialize audio playback:", e);
        }
      }
    }

    prepTimerRef.current = window.setInterval(() => {
      setPrepSecondsLeft((prev) => {
        if (prev <= 1) {
          // switch to answer phase
          window.clearInterval(prepTimerRef.current ?? 0);
          prepTimerRef.current = null;
          setQuestionPhase("answer");

          answerTimerRef.current = window.setInterval(() => {
            setAnswerSecondsLeft((sec) => {
              if (sec <= 1) {
                window.clearInterval(answerTimerRef.current ?? 0);
                answerTimerRef.current = null;
                return 0;
              }
              return sec - 1;
            });
          }, 1000);

          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Auto-advance when answer timer hits 0.
  useEffect(() => {
    if (questionPhase !== "answer") return;
    if (answerSecondsLeft !== 0) return;

    void (async () => {
      await handleNextQuestion();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answerSecondsLeft, questionPhase]);

  // Auto-start first question once session + questions are ready.
  useEffect(() => {
    if (!sessionId) return;
    if (hasAutoStartedRef.current) return;
    if (questions.length === 0) return;
    hasAutoStartedRef.current = true;
    void handleNextQuestion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, questions.length]);

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

    if (questions.length === 0) {
      const msg =
        appLanguage === "ko"
          ? "질문을 불러오지 못했습니다. (서버 질문 API를 확인해 주세요)"
          : "Failed to load questions. (Check the server questions API.)";
      setChatMessages((prev) => [...prev, { id: Date.now(), type: "ai", message: msg }]);
      setQuestionPhase("done");
      return;
    }

    if (questionIndex >= questions.length) {
      const endMessage =
        appLanguage === "ko"
          ? "모든 질문이 완료되었습니다. 면접을 종료하시겠습니까?"
          : "All questions have been completed. Would you like to end the interview?";
      setChatMessages((prev) => [
        ...prev,
        { id: Date.now(), type: "ai", message: endMessage },
      ]);
      setQuestionPhase("done");
      clearQuestionTimers();
      return;
    }

    const q = questions[questionIndex];
    startQuestionFlow(q);
    setQuestionIndex((i) => i + 1);
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Enter") void handleSendMessage();
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
    handleKeyDown,
    getInterviewTypeDisplay,
    formatTime,
    questionText,
    questionPhase,
    prepSecondsLeft,
    answerSecondsLeft,
  };
}


