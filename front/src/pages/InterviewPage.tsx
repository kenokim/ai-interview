import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mic, MicOff, MessageSquare, Send, Settings, LogOut, ImageOff, Loader2, Timer, ArrowRight } from "lucide-react";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useLanguage } from "@/contexts/LanguageContext";
import { useInterviewPageController } from "@/hooks/useInterviewPageController";

import type {
  InterviewStateType,
} from "@/types/interview";

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
  const state = location.state as InterviewStateType | undefined;
  const {
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
  } = useInterviewPageController({
    state,
    appLanguage: language,
    navigate,
  });

  if (!state) {
    return null; 
  }

  const { resume, jobDescription, jobRole, language: stateLanguage, interviewType, experience } = state;

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-indigo-500/10 -z-10"></div>
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -z-10"></div>

      <div className={`flex-1 flex flex-col transition-all duration-500 ease-in-out w-full md:w-auto ${isChatOpen ? 'md:w-3/5' : 'md:w-full'}`}>
        <div className="relative z-10 p-3 md:p-6 flex items-center justify-between">
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
          <div className="text-center space-y-4 md:space-y-8">
            <div className="relative" onClick={() => setShowAvatar(!showAvatar)}>
              <div className={`w-40 h-40 md:w-64 md:h-64 mx-auto bg-gradient-to-br from-blue-400 to-indigo-600 rounded-full flex items-center justify-center shadow-2xl cursor-pointer transition-transform duration-300 hover:scale-105`}>
                <div className="w-[9.5rem] h-[9.5rem] md:w-[15.25rem] md:h-[15.25rem] bg-gradient-to-br from-blue-300 to-indigo-500 rounded-full flex items-center justify-center overflow-hidden">
                  {showAvatar ? (
                    <img src={InterviewerImage} alt="AI Interviewer" className="w-full h-full object-cover select-none pointer-events-none" />
                  ) : (
                    <Settings className="h-12 w-12 md:h-24 md:w-24 text-white" />
                  )}
                </div>
              </div>
              {!showAvatar && (
                <div className="absolute top-3 right-3 md:top-5 md:right-5 bg-gray-900/50 p-1.5 md:p-2 rounded-full border-2 border-gray-500">
                  <ImageOff className="h-3 w-3 md:h-4 md:w-4 text-white" />
                </div>
              )}
            </div>
            <div className="flex justify-center pt-4 md:pt-8">
              <Button
                onClick={toggleRecording}
                size="lg"
                disabled={!microphoneEnabled}
                className={`rounded-full w-16 h-16 md:w-20 md:h-20 flex items-center justify-center ${
                  !microphoneEnabled
                    ? "bg-gray-500/60 cursor-not-allowed"
                    : isRecording
                      ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                      : 'bg-blue-500 hover:bg-blue-600'
                }`}
              >
                {!microphoneEnabled ? (
                  <MicOff className="h-8 w-8 md:h-12 md:w-12" />
                ) : isRecording ? (
                  <MicOff className="h-8 w-8 md:h-12 md:w-12" />
                ) : (
                  <Mic className="h-8 w-8 md:h-12 md:w-12" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Next 버튼 - 우측 하단 고정, 모바일에서 채팅창과 함께 이동 */}
        <div className={`fixed right-4 md:right-6 bottom-4 md:bottom-6 z-40 transition-transform duration-500 ease-in-out ${isChatOpen ? '-translate-y-[50vh] md:translate-y-0' : 'translate-y-0'}`}>
          <Button
            onClick={handleNextQuestion}
            size="lg"
            className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-lg px-6 py-6 flex items-center gap-2 select-none"
          >
            <span className="font-semibold text-base md:text-lg">{texts.next || 'Next'}</span>
            {isSending ? (
              <Loader2 className="h-5 w-5 md:h-6 md:w-6 animate-spin" />
            ) : (
              <ArrowRight className="h-5 w-5 md:h-6 md:w-6" />
            )}
          </Button>
        </div>
      </div>

      <div className={`fixed md:relative bottom-0 md:bottom-auto right-0 md:right-auto flex flex-col bg-white/5 backdrop-blur-xl border-t md:border-t-0 md:border-l border-white/10 text-white shadow-2xl z-50 overflow-hidden transition-transform md:transition-all duration-500 ease-in-out w-full h-1/2 md:h-full ${isChatOpen ? 'translate-y-0 md:w-2/5' : 'translate-y-full md:w-0'}`}>
        <div className={`w-full h-full flex flex-col transition-opacity duration-300 ease-in-out ${isChatOpen ? 'opacity-100 delay-200' : 'opacity-0'}`}>
          <div className="p-2 md:p-4 border-b border-white/10 flex-shrink-0 bg-white/10">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm md:text-base">{texts.interviewChatTitle}</h3>
              <Button variant="ghost" size="sm" onClick={() => setIsChatOpen(false)} className="text-gray-400 hover:text-white">
                ✕
              </Button>
            </div>
          </div>
          <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-2 md:p-4 space-y-3 md:space-y-6 bg-white/10">
            {chatMessages.map((chat) => (
              <div key={chat.id} className={`flex items-start gap-2 md:gap-3 ${chat.type === 'user' ? 'justify-end' : ''}`}>
                {chat.type === 'ai' && (
                  <Avatar className="w-6 h-6 md:w-8 md:h-8 border border-white/20 flex-shrink-0">
                    <AvatarImage src={InterviewerImage} alt="AI Interviewer" />
                    <AvatarFallback className="bg-gray-700 text-xs">AI</AvatarFallback>
                  </Avatar>
                )}
                <div className={`max-w-[85%] md:max-w-[80%] p-2 md:p-3 rounded-xl md:rounded-2xl ${chat.type === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-gray-800/80 text-gray-200 rounded-bl-none'}`}>
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
                  <Avatar className="w-6 h-6 md:w-8 md:h-8 border border-white/20 flex-shrink-0">
                    <AvatarFallback className="bg-gray-600 text-xs">U</AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
          </div>
          <div className="p-2 md:p-4 border-t border-white/10 flex-shrink-0 bg-white/10">
            <div className="relative">
              <Input
                ref={inputRef}
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={texts.chatPlaceholder}
                className="bg-gray-800/80 border-gray-700 rounded-full h-9 md:h-11 pr-10 md:pr-12 text-sm md:text-base"
              />
              <Button
                onClick={handleSendMessage}
                size="icon"
                className="absolute top-1/2 right-1.5 md:right-2 -translate-y-1/2 w-7 h-7 md:w-8 md:h-8 rounded-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isSending ? <Loader2 className="h-3 w-3 md:h-4 md:w-4 animate-spin" /> : <Send className="h-3 w-3 md:h-4 md:w-4" />}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewPage;