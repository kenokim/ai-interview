import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mic, MicOff, MessageSquare, Send, Settings, LogOut, ImageOff, Loader2, Timer, AlertCircle } from "lucide-react";
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
import { startInterview, sendMessage, endInterview } from "@/services/api";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import FancyAvatar from "@/components/ui/FancyAvatar";
import { voiceService } from "@/services/VoiceService";
import { toast } from "@/components/ui/use-toast";

// ... (기존 인터페이스 및 헬퍼 함수들은 변경 없음)

const InterviewPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [userTranscript, setUserTranscript] = useState('');
  const userTranscriptRef = useRef('');
  const lastUserMessageId = useRef<number | null>(null);

  useEffect(() => {
    if (location.state?.sessionId) {
      setSessionId(location.state.sessionId);
    } else {
      // sessionId가 없으면 메인 페이지로 리다이렉트
      toast({
        title: "잘못된 접근",
        description: "세션 ID 없이 면접 페이지에 접근할 수 없습니다.",
        variant: "destructive",
      });
      navigate('/');
    }
  }, [location, navigate]);

  useEffect(() => {
    if (!sessionId) return; // sessionId가 없으면 아무것도 하지 않음

    const handleTranscript = (text: string) => {
      userTranscriptRef.current += text;
      setUserTranscript(userTranscriptRef.current);
      
      if (lastUserMessageId.current) {
        setChatMessages(prev => prev.map(msg => 
            msg.id === lastUserMessageId.current ? { ...msg, message: userTranscriptRef.current } : msg
        ));
      } else {
        const newUserMessage: ChatMessage = {
          id: Date.now(),
          type: 'user',
          message: userTranscriptRef.current,
        };
        lastUserMessageId.current = newUserMessage.id;
        setChatMessages(prev => [...prev, newUserMessage]);
      }
    };
    
    const handleOpen = () => {
        setIsRecording(true);
        userTranscriptRef.current = '';
        setUserTranscript('');
        lastUserMessageId.current = null;
    };

    const handleClose = () => {
        setIsRecording(false);
        if (userTranscriptRef.current && sessionId) {
            // 녹음이 중지되면, AI가 답변을 시작하도록 빈 메시지를 보낼 수 있습니다.
            // 혹은 사용자가 직접 버튼을 눌러 전송하게 할 수도 있습니다.
            // 여기서는 자동으로 AI의 답변을 유도합니다.
            const thinkingMessage: ChatMessage = {
                id: Date.now() + 1,
                type: 'ai',
                message: '...',
                isThinking: true,
            };
            setChatMessages(prev => [...prev, thinkingMessage]);
            sendMessage({ sessionId, message: userTranscriptRef.current }).then(response => {
                if (response && response.message) {
                    setChatMessages(prev =>
                        prev.map(msg =>
                            msg.id === thinkingMessage.id
                                ? { ...msg, message: response.message, isThinking: false }
                                : msg
                        )
                    );
                }
            }).catch(console.error);
        }
    };
    
    const handleError = (error: any) => {
        console.error("Voice Service Error:", error);
        toast({
            variant: "destructive",
            title: "음성 서비스 오류",
            description: "마이크 연결 또는 통신 중 오류가 발생했습니다.",
        });
        setIsRecording(false);
    };

    voiceService.on('transcript', handleTranscript);
    voiceService.on('open', handleOpen);
    voiceService.on('close', handleClose);
    voiceService.on('error', handleError);

    return () => {
        voiceService.off('transcript', handleTranscript);
        voiceService.off('open', handleOpen);
        voiceService.off('close', handleClose);
        voiceService.off('error', handleError);
        voiceService.stop();
    };
  }, [sessionId]);

  const toggleRecording = () => {
    if (isRecording) {
      voiceService.stop();
    } else {
      voiceService.start();
    }
  };
  
  // ... (기존 렌더링 로직)
  
  // Input 렌더링 부분 수정
  <Input
    value={isRecording ? '음성으로 답변 중...' : currentMessage}
    onChange={(e) => !isRecording && setCurrentMessage(e.target.value)}
    onKeyPress={handleKeyPress}
    placeholder={isRecording ? "마이크에 대고 말씀하세요..." : "답변을 입력하세요..."}
    className="bg-gray-800/80 border-gray-700 rounded-full h-11 pr-12"
    disabled={isSending || isRecording}
  />
  
  // ... (나머지 렌더링 로직)
};

export default InterviewPage;
