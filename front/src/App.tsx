import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useParams } from "react-router-dom";
import { LanguageProvider } from "./contexts/LanguageContext";
import Index from "./pages/Index";
import InterviewPage from "./pages/InterviewPage";
import ReportPage from "./pages/ReportPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Language-aware page wrappers
const LanguageAwareIndex = () => {
  const { lang } = useParams<{ lang: string }>();
  const language = (lang === 'ko' || lang === 'en') ? lang : 'en';
  
  return (
    <LanguageProvider language={language}>
      <Index />
    </LanguageProvider>
  );
};

const LanguageAwareInterviewPage = () => {
  const { lang } = useParams<{ lang: string }>();
  const language = (lang === 'ko' || lang === 'en') ? lang : 'en';
  
  return (
    <LanguageProvider language={language}>
      <InterviewPage />
    </LanguageProvider>
  );
};

const LanguageAwareReportPage = () => {
  const { lang } = useParams<{ lang: string }>();
  const language = (lang === 'ko' || lang === 'en') ? lang : 'en';
  
  return (
    <LanguageProvider language={language}>
      <ReportPage />
    </LanguageProvider>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Default redirect to English */}
          <Route path="/" element={<Navigate to="/en" replace />} />
          
          {/* Language-based routes */}
          <Route path="/:lang" element={<LanguageAwareIndex />} />
          <Route path="/:lang/interview" element={<LanguageAwareInterviewPage />} />
          <Route path="/:lang/report" element={<LanguageAwareReportPage />} />
          
          {/* Catch-all route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
