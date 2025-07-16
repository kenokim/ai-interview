
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mic, MicOff, MessageSquare, Send, Settings, LogOut, ImageOff } from "lucide-react";
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
import AndrewNg from "@/assets/andrew-ng.jpg";

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

  if (!state) {
    navigate('/');
    return null;
  }

  const { resume, jobDescription, jobRole, interviewType, experience } = state;

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showAvatar, setShowAvatar] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      type: 'ai',
      message: `안녕하세요! ${interviewType === 'technical' ? '기술면접' : '컬쳐핏면접'}을 진행하겠습니다. ${experience}년차 ${getJobRoleDisplay(jobRole)} 포지션에 대해 질문드리겠습니다. 준비되시면 말씀해주세요.`
    }
  ]);
  const [currentMessage, setCurrentMessage] = useState('');

  const handleSendMessage = () => {
    if (currentMessage.trim()) {
      setChatMessages(prev => [...prev, { type: 'user', message: currentMessage }]);
      setCurrentMessage('');
      
      setTimeout(() => {
        setChatMessages(prev => [...prev, { 
          type: 'ai', 
          message: '좋은 답변이네요. 다음 질문을 드리겠습니다...' 
        }]);
      }, 1000);
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
  };

  const getInterviewTypeDisplay = () => {
    return interviewType === 'technical' ? '기술면접' : '컬쳐핏면접';
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-indigo-500/10 -z-10"></div>
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -z-10"></div>

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isChatOpen ? 'w-2/3' : 'w-full'}`}>
        {/* Header */}
        <div className="relative z-10 p-6 flex items-center justify-between">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                className="text-white hover:bg-white/10"
              >
                <Settings className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="bg-white text-black">
              <SheetHeader>
                <SheetTitle>현재 면접 설정</SheetTitle>
                <SheetDescription>
                  현재 진행중인 면접의 설정 정보입니다.
                </SheetDescription>
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
                  <pre className="text-xs whitespace-pre-wrap font-sans">
                    {resume || '제출되지 않음'}
                  </pre>
                </div>
              </div>
              <div>
                <Label htmlFor="jd-display" className="text-base font-semibold">채용 공고</Label>
                <div id="jd-display" className="p-2 mt-1 overflow-y-auto rounded-md border bg-gray-50 max-h-48">
                  <pre className="text-xs whitespace-pre-wrap font-sans">
                    {jobDescription || '제출되지 않음'}
                  </pre>
                </div>
              </div>
            </div>
            </SheetContent>
          </Sheet>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={() => setIsChatOpen(!isChatOpen)}
              className="text-white hover:bg-white/10"
            >
              <MessageSquare className="h-5 w-5" />
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  className="text-white hover:bg-red-500/20"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>면접을 종료하시겠습니까?</AlertDialogTitle>
                  <AlertDialogDescription>
                    종료하시면, 면접 내용에 대한 최종 리포트 화면으로 이동합니다.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>취소</AlertDialogCancel>
                  <AlertDialogAction onClick={() => navigate('/report')}>종료하고 리포트 보기</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* Main Content */}
        <div className="relative z-10 flex-1 flex items-end justify-center px-6 pb-16">
          <div className="text-center space-y-8">
            {/* Interviewer Avatar */}
            <div className="relative" onClick={() => setShowAvatar(!showAvatar)}>
              <div className="w-80 h-80 mx-auto bg-gradient-to-br from-blue-400 to-indigo-600 rounded-full flex items-center justify-center shadow-2xl cursor-pointer transition-transform duration-300 hover:scale-105">
                <div className="w-[19.25rem] h-[19.25rem] bg-gradient-to-br from-blue-300 to-indigo-500 rounded-full flex items-center justify-center overflow-hidden">
                  {showAvatar ? (
                    <img src={AndrewNg} alt="Andrew Ng" className="w-full h-full object-cover select-none pointer-events-none" />
                  ) : (
                    <Settings className="h-32 w-32 text-white" />
                  )}
                </div>
              </div>
              {!showAvatar && (
                <div className="absolute top-5 right-5 bg-gray-900/50 p-2 rounded-full border-2 border-gray-500">
                  <ImageOff className="h-6 w-6 text-white" />
                </div>
              )}
            </div>

            {/* Voice Controls */}
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
                {isRecording ? <MicOff className="h-16 w-16" /> : <Mic className="h-16 w-16" />}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Panel */}
      {isChatOpen && (
        <div className="flex flex-col w-1/3 bg-white text-black shadow-2xl transition-all duration-300 ease-in-out z-50 relative pointer-events-auto">
          {/* Chat Header */}
          <div className="p-4 border-b bg-gray-50 flex-shrink-0">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">면접 채팅</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsChatOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </Button>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {chatMessages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    msg.type === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {msg.message}
                </div>
              </div>
            ))}
          </div>

          {/* Chat Input */}
          <div className="p-4 border-t flex-shrink-0">
            <div className="flex gap-2">
              <Input
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                placeholder="메시지를 입력하세요..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                className="flex-1"
              />
              <Button onClick={handleSendMessage} size="sm">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewPage;
