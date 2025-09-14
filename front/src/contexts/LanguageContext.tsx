import React, { createContext, useContext, ReactNode } from 'react';

type Language = 'en' | 'ko';

interface LanguageContextType {
  language: Language;
  texts: {
    [key: string]: string;
  };
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
  language: Language;
}

const texts = {
  en: {
    // Header
    title: 'AI Interview',
    subtitle: 'Please make sure your speakers and microphone are properly connected before starting the interview.',
    
    // Job Selection
    jobSelectionLabel: 'Job Role',
    jobSelectionPlaceholder: 'Select a job role',
    backendDeveloper: 'Backend Developer',
    frontendDeveloper: 'Frontend Developer',
    
    // Interview Type
    interviewTypeLabel: 'Interview Type',
    technicalInterview: 'Technical Interview',
    cultureInterview: 'Culture Fit Interview',
    
    // Experience
    experienceLabel: 'Years of Experience',
    experienceYears: 'years',
    
    // Details
    detailsLabel: 'Details',
    resumeLabel: 'Resume (Optional)',
    resumePlaceholder: 'Paste your resume content here.',
    jobDescriptionLabel: 'Job Description (Optional)',
    jobDescriptionPlaceholder: 'Paste the job description here.',
    
    // Button
    startInterviewButton: 'Start Interview',
    selectJobRoleMessage: 'Please select a job role',
    
    // Interview Page
    currentInterviewSettings: 'Current Interview Settings',
    settingsDescription: 'Settings information for the current interview.',
    jobLabel: 'Job Role',
    languageLabel: 'Language',
    experienceShort: 'Experience',
    interviewTypeShort: 'Interview Type',
    resumeDisplay: 'Resume',
    jobDescriptionDisplay: 'Job Description',
    notSubmitted: 'Not submitted',
    
    // Interview Actions
    endInterviewTitle: 'End Interview?',
    endInterviewDescription: 'If you end the interview, you will be redirected to the final report screen.',
    cancel: 'Cancel',
    endAndReport: 'End & View Report',
    
    // Chat
    interviewChatTitle: 'Interview Chat',
    chatPlaceholder: 'Enter your answer...',
    elapsedTime: 'Elapsed Time',
    
    // Languages
    english: 'English',
    korean: '한국어'
  },
  ko: {
    // Header  
    title: 'AI 인터뷰',
    subtitle: '면접 시작 전에 스피커와 마이크가 올바르게 연결되어 있는지 확인해주세요.',
    
    // Job Selection
    jobSelectionLabel: '직무 선택',
    jobSelectionPlaceholder: '직무를 선택해주세요',
    backendDeveloper: '백엔드 개발자',
    frontendDeveloper: '프론트엔드 개발자',
    
    // Interview Type
    interviewTypeLabel: '면접 유형',
    technicalInterview: '기술면접',
    cultureInterview: '컬쳐핏면접',
    
    // Experience
    experienceLabel: '경력 연차',
    experienceYears: '년차',
    
    // Details
    detailsLabel: '세부 설정',
    resumeLabel: '이력서 (선택)',
    resumePlaceholder: '이력서 내용을 붙여넣으세요.',
    jobDescriptionLabel: '채용공고 (선택)',
    jobDescriptionPlaceholder: '채용공고 내용을 붙여넣으세요.',
    
    // Button
    startInterviewButton: '면접 시작하기',
    selectJobRoleMessage: '직무를 선택해주세요',
    
    // Interview Page
    currentInterviewSettings: '현재 면접 설정',
    settingsDescription: '현재 진행중인 면접의 설정 정보입니다.',
    jobLabel: '직무',
    languageLabel: '언어',
    experienceShort: '경력',
    interviewTypeShort: '면접 유형',
    resumeDisplay: '이력서',
    jobDescriptionDisplay: '채용 공고',
    notSubmitted: '제출되지 않음',
    
    // Interview Actions
    endInterviewTitle: '면접을 종료하시겠습니까?',
    endInterviewDescription: '종료하시면, 면접 내용에 대한 최종 리포트 화면으로 이동합니다.',
    cancel: '취소',
    endAndReport: '종료하고 리포트 보기',
    
    // Chat
    interviewChatTitle: '면접 채팅',
    chatPlaceholder: '답변을 입력하세요...',
    elapsedTime: '경과 시간',
    
    // Languages
    english: 'English',
    korean: '한국어'
  }
};

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children, language }) => {
  const contextValue: LanguageContextType = {
    language,
    texts: texts[language]
  };

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
