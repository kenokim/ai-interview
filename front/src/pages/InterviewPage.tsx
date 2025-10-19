import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mic, MicOff, MessageSquare, Send, Settings, LogOut, ImageOff, Loader2, Timer } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import InterviewerImage from "@/assets/interviewer.png";
import { startInterview, endInterview, sendMessage } from "@/services/api";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useLanguage } from "@/contexts/LanguageContext";

interface InterviewState {
  resume: string;
  jobDescription: string;
  jobRole: string;
  language: string;
  interviewType: string;
  experience: number;
}

type ChatMessage = {
  id: number;
  type: 'ai' | 'user';
  message: string;
  isThinking?: boolean;
};

const getJobRoleDisplay = (role: string, texts: any) => {
  const roles: { [key: string]: string } = {
    'backend': texts.backendDeveloper,
    'frontend': texts.frontendDeveloper,
    'typescript': 'TypeScript Developer',
    'ai_agent': 'AI Agent Developer',
    'fullstack': 'Fullstack Developer',
    'mobile': 'Mobile Developer',
    'devops': 'DevOps Engineer',
    'data': 'Data Scientist',
    'pm': 'Product Manager',
    'designer': 'UI/UX Designer',
    'qa': 'QA Engineer'
  };
  return roles[role] || role;
};

const getLanguageDisplay = (lang: string) => {
  const languages: { [key: string]: string } = {
    'english': 'English',
    'korean': '한국어'
  };
  return languages[lang] || lang;
};

const InterviewPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { language, texts } = useLanguage();
  const state = location.state as InterviewState;

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(() => {
    const saved = localStorage.getItem("isChatOpen");
    return saved ? JSON.parse(saved) : false;
  });
  const [isRecording, setIsRecording] = useState(false);
  const [showAvatar, setShowAvatar] = useState(true);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const WS_URL = (import.meta as any).env.VITE_WS_URL || 'ws://localhost:3000/ws/interview';
  const wsRef = useRef<WebSocket | null>(null);
  const [wsReady, setWsReady] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const thinkingIdRef = useRef<number | null>(null);
  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // WebSocket 연결
  useEffect(() => {
    if (!sessionId) return;
    console.log('🔗 [UI] WebSocket 연결 시도:', WS_URL);
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('🔌 [UI] WebSocket 연결 성공');
      const initPayload = { type: 'init', sessionId };
      console.log('📤 [UI] 세션 초기화 전송:', initPayload);
      ws.send(JSON.stringify(initPayload));
      setWsReady(true);
      console.log('✅ [UI] WebSocket 준비 완료');
    };

    ws.onmessage = (e) => {
      console.log('📥 [UI] WebSocket 메시지 수신:', e.data);
      const { type, chunk, data } = JSON.parse(e.data);
      console.log('📋 [UI] 파싱된 메시지:', { type, chunk, data });
      
      if (type === 'chunk') {
        const [mode, payload] = chunk;
        console.log('📦 [UI] 청크 수신:', { mode, payload });
        // 1) 서버 테스트용 ping 청크를 채팅창에 표시
        if (mode === 'ping') {
          setChatMessages(prev => [
            ...prev,
            {
              id: Date.now(),
              type: 'ai',
              message: `🟢 서버 ping: ${new Date(payload.serverTime).toLocaleTimeString()}`,
            },
          ]);
        }

        // 2) LLM 토큰 스트림 처리
        if (mode === 'messages') {
          const token = payload[0]?.content || '';
          console.log('💬 [UI] 토큰 수신:', token);

          if (thinkingIdRef.current) {
            // 기존 placeholder 업데이트
            setChatMessages(prev => prev.map(m => m.id === thinkingIdRef.current ? { ...m, message: m.message + token } : m));
          } else {
            // placeholder 가 없으면 새로 만들고 토큰을 넣는다 (서버 자동 메시지 스트림 등)
            const newId = Date.now();
            thinkingIdRef.current = newId;
            setChatMessages(prev => [
              ...prev,
              { id: newId, type: 'ai', message: token, isThinking: true },
            ]);
          }
        }
      }
      if (type === 'response') {
        console.log('✅ [UI] 최종 응답 수신:', data);

        const updatePlaceholder = (placeholderId: number | null) => {
          if (!placeholderId) return false;
          let updated = false;
          setChatMessages(prev => prev.map(m => {
            if (m.id === placeholderId) {
              updated = true;
              return { ...m, message: data.message, isThinking: false };
            }
            return m;
          }));
          return updated;
        };

        // 1) 우선 thinkingIdRef 로 업데이트 시도
        let handled = updatePlaceholder(thinkingIdRef.current);

        // 2) 실패하면 가장 오래된 isThinking 메시지 찾아 업데이트
        if (!handled) {
          const firstThinking = chatMessages.find(m => m.isThinking);
          handled = updatePlaceholder(firstThinking ? firstThinking.id : null);
        }

        // 3) 그래도 못했으면, 직전에 추가된 AI 메시지와 동일한지 확인 후 중복 방지
        if (!handled) {
          setChatMessages(prev => {
            const last = prev[prev.length - 1];
            if (last && last.type === 'ai' && last.message.trim() === data.message.trim()) {
              return prev; // 이미 같은 내용이 있다면 추가하지 않음
            }
            return [
              ...prev,
              { id: Date.now(), type: 'ai', message: data.message },
            ];
          });
        }

        setIsSending(false);
        thinkingIdRef.current = null;
      }
    };

    ws.onclose = () => {
      console.log('🔌 [UI] WebSocket 연결 종료');
      setWsReady(false);
    };
    ws.onerror = (error) => {
      console.error('❌ [UI] WebSocket 오류:', error);
      setWsReady(false);
    };

    return () => ws.close();
  }, [sessionId]);

  useEffect(() => {
    localStorage.setItem("isChatOpen", JSON.stringify(isChatOpen));
  }, [isChatOpen]);

  // 새 메시지 도착 시 스크롤을 맨 아래로 이동
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages, isChatOpen]);

  useEffect(() => {
    if (sessionId) {
      const timer = setInterval(() => {
        // This is a placeholder logic for start time.
        // In a real app, you would get the start time from the session.
        const start = new Date(parseInt(sessionId.split('_')[1])).getTime();
        const now = Date.now();
        setElapsedTime(Math.floor((now - start) / 1000));
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [sessionId]);

  useEffect(() => {
    const initializeInterview = async () => {
      if (state) {
        const thinkingMessageId = Date.now();
        setChatMessages([
          {
            id: thinkingMessageId,
            type: 'ai',
            message: '...',
            isThinking: true,
          },
        ]);

        try {
          const getExperienceLevel = (exp: number): string => {
            if (exp <= 2) return 'junior';
            if (exp <= 5) return 'mid-level';
            return 'senior';
          };

          const payload = {
            jobRole: state.jobRole,
            language: stateLanguage,
            experience: getExperienceLevel(state.experience),
            interviewType: state.interviewType,
            resume: state.resume,
            jobDescription: state.jobDescription,
            userName: "사용자",
          };
          console.log("Interview Start Request Payload:", payload);
          const response = await startInterview(payload);
          console.log("Interview Start Response:", response);

          if (response && response.sessionId) {
            setSessionId(response.sessionId);
            setChatMessages(prev =>
              prev.map(msg =>
                msg.id === thinkingMessageId
                  ? { ...msg, message: response.message, isThinking: false }
                  : msg
              )
            );
          } else {
            console.error("Failed to start interview: Invalid response structure", response);
            setChatMessages(prev =>
              prev.map(msg =>
                msg.id === thinkingMessageId
                  ? { ...msg, message: "면접 시작에 실패했습니다. 서버 응답이 올바르지 않습니다.", isThinking: false }
                  : msg
              )
            );
          }
        } catch (error) {
          console.error("Error starting interview:", error);
          setChatMessages(prev =>
            prev.map(msg =>
              msg.id === thinkingMessageId
                ? { ...msg, message: "서버와 통신 중 오류가 발생했습니다.", isThinking: false }
                : msg
            )
          );
        }
      } else {
        navigate(`/${language}`);
      }
    };
    initializeInterview();
  }, [state, navigate]);

  const handleSendMessage = async () => {
    console.log('🟢 [UI] handleSendMessage 호출됨');
    console.log('🟢 [UI] currentMessage:', currentMessage);
    console.log('🟢 [UI] sessionId:', sessionId);
    console.log('🟢 [UI] isSending:', isSending);
    console.log('🟢 [UI] wsReady:', wsReady);
    console.log('🟢 [UI] wsRef.current:', wsRef.current);

    if (currentMessage.trim() && sessionId && !isSending) {
      const userMessage: ChatMessage = {
        id: Date.now(),
        type: 'user',
        message: currentMessage.trim(),
      };
      
      const thinkingMessage: ChatMessage = {
        id: Date.now() + 1,
        type: 'ai',
        message: '...',
        isThinking: true,
      };

      console.log('📝 [UI] 메시지 객체 생성:', { userMessage, thinkingMessage });
      setChatMessages(prev => [...prev, userMessage, thinkingMessage]);
      setCurrentMessage('');
      inputRef.current?.focus();
      setIsSending(true);
      thinkingIdRef.current = thinkingMessage.id;

      if (wsReady && wsRef.current) {
        console.log('🔌 [UI] WebSocket으로 메시지 전송 시도');
        const wsPayload = { type: 'user', text: userMessage.message };
        console.log('📤 [UI] WS Payload:', wsPayload);
        wsRef.current.send(JSON.stringify(wsPayload));
        console.log('✅ [UI] WebSocket 메시지 전송 완료');
      } else {
        console.log('🔄 [UI] WebSocket 미연결, REST API 사용');
        try {
          const apiPayload = { sessionId, message: userMessage.message };
          console.log('📤 [UI] API Payload:', apiPayload);
          const response = await sendMessage(apiPayload);
          console.log('📥 [UI] API Response:', response);
          setChatMessages(prev => prev.map(m => m.id === thinkingMessage.id ? { ...m, message: response.message, isThinking: false } : m));
        } catch (error) {
          console.error('❌ [UI] 메시지 전송 실패:', error);
          setChatMessages(prev =>
            prev.map(msg =>
              msg.id === thinkingMessage.id
                ? { ...msg, message: '서버 오류: 메시지를 전송할 수 없습니다.', isThinking: false }
                : msg
            )
          );
        } finally {
          setIsSending(false);
          thinkingIdRef.current = null;
        }
      }
    } else {
      console.log('⚠️ [UI] 메시지 전송 조건 불충족:', {
        hasMessage: !!currentMessage.trim(),
        hasSessionId: !!sessionId,
        notSending: !isSending
      });
    }
  };

  const handleEndInterview = async () => {
    if (sessionId) {
      try {
        await endInterview({ sessionId });
        navigate(`/${language}/report`, { state: { sessionId } });
      } catch (error) {
        console.error("Error ending interview:", error);
        navigate(`/${language}/report`, { state: { sessionId } });
      }
    } else {
      navigate(`/${language}/report`);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
  };

  const getInterviewTypeDisplay = () => {
    return state?.interviewType === 'technical' ? texts.technicalInterview : texts.cultureInterview;
  };
  
  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const parts = [];
    if (hours > 0) {
      parts.push(String(hours).padStart(2, '0'));
    }
    parts.push(String(minutes).padStart(2, '0'));
    parts.push(String(seconds).padStart(2, '0'));

    return parts.join(':');
  };

  if (!state) {
    return null; 
  }

  const { resume, jobDescription, jobRole, language: stateLanguage, interviewType, experience } = state;

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-indigo-500/10 -z-10"></div>
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -z-10"></div>

      <div className={`flex-1 flex flex-col transition-all duration-500 ease-in-out ${isChatOpen ? 'w-3/5' : 'w-full'}`}>
        <div className="relative z-10 p-6 flex items-center justify-between">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" className="text-white hover:bg-white/10">
                <Settings className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="bg-white text-black">
              <SheetHeader>
                <SheetTitle>{texts.currentInterviewSettings}</SheetTitle>
                <SheetDescription>{texts.settingsDescription}</SheetDescription>
              </SheetHeader>
              <div className="py-4 space-y-6 text-sm">
              <div>
                <Label className="text-base font-semibold">{texts.jobLabel}</Label>
                <p className="p-2 mt-1 rounded-md bg-gray-50">{getJobRoleDisplay(jobRole, texts)}</p>
              </div>
              <div>
                <Label className="text-base font-semibold">{texts.languageLabel}</Label>
                <p className="p-2 mt-1 rounded-md bg-gray-50">{getLanguageDisplay(stateLanguage)}</p>
              </div>
              <div>
                <Label className="text-base font-semibold">{texts.experienceShort}</Label>
                <p className="p-2 mt-1 rounded-md bg-gray-50">{experience} {texts.experienceYears}</p>
              </div>
              <div>
                <Label className="text-base font-semibold">{texts.interviewTypeShort}</Label>
                <p className="p-2 mt-1 rounded-md bg-gray-50">{getInterviewTypeDisplay()}</p>
              </div>
              <div>
                <Label htmlFor="resume-display" className="text-base font-semibold">{texts.resumeDisplay}</Label>
                <div id="resume-display" className="p-2 mt-1 overflow-y-auto rounded-md border bg-gray-50 max-h-48">
                  <pre className="text-xs whitespace-pre-wrap font-sans">{resume || texts.notSubmitted}</pre>
                </div>
              </div>
              <div>
                <Label htmlFor="jd-display" className="text-base font-semibold">{texts.jobDescriptionDisplay}</Label>
                <div id="jd-display" className="p-2 mt-1 overflow-y-auto rounded-md border bg-gray-50 max-h-48">
                  <pre className="text-xs whitespace-pre-wrap font-sans">{jobDescription || texts.notSubmitted}</pre>
                </div>
              </div>
            </div>
            </SheetContent>
          </Sheet>
          
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" className="text-white hover:bg-white/10">
                  <Timer className="h-5 w-5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-2 bg-gray-800 text-white border-gray-700">
                <p className="text-sm">{texts.elapsedTime}: {formatTime(elapsedTime)}</p>
              </PopoverContent>
            </Popover>
            <Button variant="ghost" onClick={() => setIsChatOpen(!isChatOpen)} className="text-white hover:bg-white/10">
              <MessageSquare className="h-5 w-5" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" className="text-white hover:bg-red-500/20">
                  <LogOut className="h-5 w-5" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{texts.endInterviewTitle}</AlertDialogTitle>
                  <AlertDialogDescription>{texts.endInterviewDescription}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{texts.cancel}</AlertDialogCancel>
                  <AlertDialogAction onClick={handleEndInterview}>{texts.endAndReport}</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <div className="relative z-10 flex-1 flex items-center justify-center px-6">
          <div className="text-center space-y-8">
            <div className="relative" onClick={() => setShowAvatar(!showAvatar)}>
              <div className={`w-64 h-64 mx-auto bg-gradient-to-br from-blue-400 to-indigo-600 rounded-full flex items-center justify-center shadow-2xl cursor-pointer transition-transform duration-300 hover:scale-105`}>
                <div className="w-[15.25rem] h-[15.25rem] bg-gradient-to-br from-blue-300 to-indigo-500 rounded-full flex items-center justify-center overflow-hidden">
                  {showAvatar ? (
                    <img src={InterviewerImage} alt="AI Interviewer" className="w-full h-full object-cover select-none pointer-events-none" />
                  ) : (
                    <Settings className="h-24 w-24 text-white" />
                  )}
                </div>
              </div>
              {!showAvatar && (
                <div className="absolute top-5 right-5 bg-gray-900/50 p-2 rounded-full border-2 border-gray-500">
                  <ImageOff className="h-4 w-4 text-white" />
                </div>
              )}
            </div>
            <div className="flex justify-center pt-8">
              <Button
                onClick={toggleRecording}
                size="lg"
                className={`rounded-full w-20 h-20 flex items-center justify-center ${
                  isRecording 
                    ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                    : 'bg-blue-500 hover:bg-blue-600'
                }`}
              >
                {isRecording ? <MicOff className="h-12 w-12" /> : <Mic className="h-12 w-12" />}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className={`flex flex-col bg-white/5 backdrop-blur-xl border-l border-white/10 text-white shadow-2xl transition-all duration-500 ease-in-out z-50 overflow-hidden whitespace-nowrap ${isChatOpen ? 'w-2/5' : 'w-0'}`}>
        <div className={`w-full h-full flex flex-col transition-opacity duration-300 ease-in-out ${isChatOpen ? 'opacity-100 delay-200' : 'opacity-0'}`}>
          <div className="p-4 border-b border-white/10 flex-shrink-0 bg-white/10">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">{texts.interviewChatTitle}</h3>
              <Button variant="ghost" size="sm" onClick={() => setIsChatOpen(false)} className="text-gray-400 hover:text-white">
                ✕
              </Button>
            </div>
          </div>
          <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-6 bg-white/10">
            {chatMessages.map((chat) => (
              <div key={chat.id} className={`flex items-start gap-3 ${chat.type === 'user' ? 'justify-end' : ''}`}>
                {chat.type === 'ai' && (
                  <Avatar className="w-8 h-8 border border-white/20">
                    <AvatarImage src={InterviewerImage} alt="AI Interviewer" />
                    <AvatarFallback className="bg-gray-700 text-xs">AI</AvatarFallback>
                  </Avatar>
                )}
                <div className={`max-w-[80%] p-3 rounded-2xl ${chat.type === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-gray-800/80 text-gray-200 rounded-bl-none'}`}>
                  {chat.isThinking ? (
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-pulse-fast"></span>
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-pulse-medium"></span>
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-pulse-slow"></span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm whitespace-normal prose prose-sm max-w-none prose-invert">
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm]}
                        components={{
                          // 마크다운 컴포넌트 스타일링
                          p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                          code: ({ children, className }) => {
                            const isInline = !className;
                            return isInline ? (
                              <code className="bg-gray-700 px-1 py-0.5 rounded text-xs">{children}</code>
                            ) : (
                              <pre className="bg-gray-700 p-2 rounded text-xs overflow-x-auto">
                                <code>{children}</code>
                              </pre>
                            );
                          },
                          ul: ({ children }) => <ul className="list-disc list-inside mb-2">{children}</ul>,
                          ol: ({ children }) => <ol className="list-decimal list-inside mb-2">{children}</ol>,
                          li: ({ children }) => <li className="mb-1">{children}</li>,
                          strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                          em: ({ children }) => <em className="italic">{children}</em>,
                          h1: ({ children }) => <h1 className="text-lg font-bold mb-2">{children}</h1>,
                          h2: ({ children }) => <h2 className="text-base font-bold mb-2">{children}</h2>,
                          h3: ({ children }) => <h3 className="text-sm font-bold mb-1">{children}</h3>,
                          blockquote: ({ children }) => (
                            <blockquote className="border-l-2 border-gray-500 pl-2 italic mb-2">{children}</blockquote>
                          ),
                          a: ({ children, href }) => (
                            <a href={href} className="text-blue-300 hover:text-blue-200 underline" target="_blank" rel="noopener noreferrer">
                              {children}
                            </a>
                          ),
                        }}
                      >
                        {chat.message}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
                {chat.type === 'user' && (
                  <Avatar className="w-8 h-8 border border-white/20">
                    <AvatarFallback className="bg-gray-600 text-xs">U</AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-white/10 flex-shrink-0 bg-white/10">
            <div className="relative">
              <Input
                ref={inputRef}
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={texts.chatPlaceholder}
                className="bg-gray-800/80 border-gray-700 rounded-full h-11 pr-12"
              />
              <Button
                onClick={handleSendMessage}
                size="icon"
                className="absolute top-1/2 right-2 -translate-y-1/2 w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-700 text-white disabled:bg-blue-400"
                disabled={isSending || !currentMessage.trim() || !wsReady}
              >
                {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewPage;