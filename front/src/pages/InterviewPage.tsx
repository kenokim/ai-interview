
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mic, MicOff, MessageSquare, Send, Settings, LogOut, ImageOff, Loader2 } from "lucide-react";
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
import AndrewNg from "@/assets/andrew-ng.jpg";
import { startInterview, sendMessage, endInterview } from "@/services/api";

interface InterviewState {
  resume: string;
  jobDescription: string;
  jobRole: string;
  interviewType: string;
  experience: number;
}

type ChatMessage = {
  type: 'ai' | 'user';
  message: string;
};

const getJobRoleDisplay = (role: string) => {
  const roles: { [key: string]: string } = {
    'ai_agent': 'AI Agent 개발자',
    'frontend': '프론트엔드 개발자',
    'backend': '백엔드 개발자',
    'fullstack': '풀스택 개발자',
    'mobile': '모바일 개발자',
    'devops': 'DevOps 엔지니어',
    'data': '데이터 사이언티스트',
    'pm': '프로덕트 매니저',
    'designer': 'UI/UX 디자이너',
    'qa': 'QA 엔지니어'
  };
  return roles[role] || role;
};

const InterviewPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as InterviewState;

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(() => {
    const saved = localStorage.getItem("isChatOpen");
    return saved ? JSON.parse(saved) : false;
  });
  const [isRecording, setIsRecording] = useState(false);
  const [showAvatar, setShowAvatar] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    localStorage.setItem("isChatOpen", JSON.stringify(isChatOpen));
  }, [isChatOpen]);

  useEffect(() => {
    const initializeInterview = async () => {
      if (state) {
        try {
          const getExperienceLevel = (exp: number): string => {
            if (exp <= 2) return 'junior';
            if (exp <= 5) return 'mid-level';
            return 'senior';
          };

          const payload = {
            jobRole: state.jobRole,
            experience: getExperienceLevel(state.experience),
            interviewType: state.interviewType,
            resume: state.resume,
            jobDescription: state.jobDescription,
            userName: "사용자", // userName 필드 추가
          };

          const response = await startInterview(payload);
          if (response.success) {
            setSessionId(response.data.sessionId);
            setChatMessages([{ type: 'ai', message: response.data.initial_message }]);
          } else {
            console.error("Failed to start interview:", response.error);
            setChatMessages([{ type: 'ai', message: "면접 시작에 실패했습니다. 잠시 후 다시 시도해주세요." }]);
          }
        } catch (error) {
          console.error("Error starting interview:", error);
          setChatMessages([{ type: 'ai', message: "서버와 통신 중 오류가 발생했습니다." }]);
        } finally {
          setIsLoading(false);
        }
      } else {
        navigate('/');
      }
    };
    initializeInterview();
  }, [state, navigate]);

  const handleSendMessage = async () => {
    if (currentMessage.trim() && sessionId && !isLoading) {
      const userMessage = currentMessage;
      setChatMessages(prev => [...prev, { type: 'user', message: userMessage }]);
      setCurrentMessage('');
      setIsLoading(true);

      try {
        const response = await sendMessage({ sessionId, message: userMessage });
        if (response.success) {
          setChatMessages(prev => [...prev, { type: 'ai', message: response.data.response }]);
        } else {
          console.error("Failed to send message:", response.error);
          setChatMessages(prev => [...prev, { type: 'ai', message: "죄송합니다. 메시지 처리에 실패했습니다." }]);
        }
      } catch (error) {
        console.error("Error sending message:", error);
        setChatMessages(prev => [...prev, { type: 'ai', message: "서버와 통신 중 오류가 발생했습니다." }]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleEndInterview = async () => {
    if (sessionId) {
      try {
        await endInterview({ sessionId });
        navigate('/report', { state: { sessionId } });
      } catch (error) {
        console.error("Error ending interview:", error);
        navigate('/report', { state: { sessionId } });
      }
    } else {
      navigate('/report');
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
    return state?.interviewType === 'technical' ? '기술면접' : '컬쳐핏면접';
  };
  
  if (!state) {
    return null; 
  }

  const { resume, jobDescription, jobRole, interviewType, experience } = state;

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
                <SheetTitle>현재 면접 설정</SheetTitle>
                <SheetDescription>현재 진행중인 면접의 설정 정보입니다.</SheetDescription>
              </SheetHeader>
              <div className="py-4 space-y-6 text-sm">
              <div>
                <Label className="text-base font-semibold">직무</Label>
                <p className="p-2 mt-1 rounded-md bg-gray-50">{getJobRoleDisplay(jobRole)}</p>
              </div>
              <div>
                <Label className="text-base font-semibold">경력</Label>
                <p className="p-2 mt-1 rounded-md bg-gray-50">{experience}년차</p>
              </div>
              <div>
                <Label className="text-base font-semibold">면접 유형</Label>
                <p className="p-2 mt-1 rounded-md bg-gray-50">{getInterviewTypeDisplay()}</p>
              </div>
              <div>
                <Label htmlFor="resume-display" className="text-base font-semibold">이력서</Label>
                <div id="resume-display" className="p-2 mt-1 overflow-y-auto rounded-md border bg-gray-50 max-h-48">
                  <pre className="text-xs whitespace-pre-wrap font-sans">{resume || '제출되지 않음'}</pre>
                </div>
              </div>
              <div>
                <Label htmlFor="jd-display" className="text-base font-semibold">채용 공고</Label>
                <div id="jd-display" className="p-2 mt-1 overflow-y-auto rounded-md border bg-gray-50 max-h-48">
                  <pre className="text-xs whitespace-pre-wrap font-sans">{jobDescription || '제출되지 않음'}</pre>
                </div>
              </div>
            </div>
            </SheetContent>
          </Sheet>
          
          <div className="flex items-center gap-2">
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
                  <AlertDialogTitle>면접을 종료하시겠습니까?</AlertDialogTitle>
                  <AlertDialogDescription>종료하시면, 면접 내용에 대한 최종 리포트 화면으로 이동합니다.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>취소</AlertDialogCancel>
                  <AlertDialogAction onClick={handleEndInterview}>종료하고 리포트 보기</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <div className="relative z-10 flex-1 flex items-center justify-center px-6">
          <div className="text-center space-y-8">
            <div className="relative" onClick={() => setShowAvatar(!showAvatar)}>
              <div className="w-64 h-64 mx-auto bg-gradient-to-br from-blue-400 to-indigo-600 rounded-full flex items-center justify-center shadow-2xl cursor-pointer transition-transform duration-300 hover:scale-105">
                <div className="w-[15.25rem] h-[15.25rem] bg-gradient-to-br from-blue-300 to-indigo-500 rounded-full flex items-center justify-center overflow-hidden">
                  {showAvatar ? (
                    <img src={AndrewNg} alt="Andrew Ng" className="w-full h-full object-cover select-none pointer-events-none" />
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
                className={`rounded-full w-24 h-24 flex items-center justify-center ${
                  isRecording 
                    ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                    : 'bg-blue-500 hover:bg-blue-600'
                }`}
              >
                {isRecording ? <MicOff className="h-20 w-20" /> : <Mic className="h-20 w-20" />}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className={`flex flex-col bg-white/5 backdrop-blur-xl border-l border-white/10 text-white shadow-2xl transition-all duration-500 ease-in-out z-50 overflow-hidden whitespace-nowrap ${isChatOpen ? 'w-2/5' : 'w-0'}`}>
        <div className={`w-full h-full flex flex-col transition-opacity duration-300 ease-in-out ${isChatOpen ? 'opacity-100 delay-200' : 'opacity-0'}`}>
          <div className="p-4 border-b border-white/10 flex-shrink-0 bg-white/10">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">면접 채팅</h3>
              <Button variant="ghost" size="sm" onClick={() => setIsChatOpen(false)} className="text-gray-400 hover:text-white">
                ✕
              </Button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-black/10">
            {isLoading && chatMessages.length === 0 && (
              <div className="text-center py-10">
                <p>면접을 준비중입니다...</p>
              </div>
            )}
            {chatMessages.map((chat, index) => (
              <div key={index} className={`flex items-start gap-3 ${chat.type === 'user' ? 'justify-end' : ''}`}>
                {chat.type === 'ai' && (
                  <Avatar className="w-8 h-8 border border-white/20">
                    <AvatarImage src={AndrewNg} alt="AI Interviewer" />
                    <AvatarFallback className="bg-gray-700 text-xs">AI</AvatarFallback>
                  </Avatar>
                )}
                <div className={`max-w-[80%] p-3 rounded-2xl ${chat.type === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-gray-800/80 text-gray-200 rounded-bl-none'}`}>
                  <p className="text-sm whitespace-normal">{chat.message}</p>
                </div>
                {chat.type === 'user' && (
                  <Avatar className="w-8 h-8 border border-white/20">
                    <AvatarFallback className="bg-gray-600 text-xs">U</AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            {isLoading && chatMessages.length > 0 && (
              <div className="flex items-start gap-3">
                <Avatar className="w-8 h-8 border border-white/20">
                  <AvatarImage src={AndrewNg} alt="AI Interviewer" />
                  <AvatarFallback className="bg-gray-700 text-xs">AI</AvatarFallback>
                </Avatar>
                <div className="max-w-[80%] p-3 rounded-2xl bg-gray-800/80 text-gray-200 rounded-bl-none">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">생각 중...</span>
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-pulse-fast"></span>
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-pulse-medium"></span>
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-pulse-slow"></span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="p-4 border-t border-white/10 flex-shrink-0 bg-white/10">
            <div className="relative">
              <Input
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="답변을 입력하세요..."
                className="bg-gray-800/80 border-gray-700 rounded-full h-11 pr-12"
                disabled={isLoading}
              />
              <Button
                onClick={handleSendMessage}
                size="icon"
                className="absolute top-1/2 right-2 -translate-y-1/2 w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-700 text-white disabled:bg-blue-400"
                disabled={isLoading || !currentMessage.trim()}
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewPage;
