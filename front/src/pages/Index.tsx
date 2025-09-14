import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Upload, FileText, Briefcase, Mic, MessageSquare, Settings, ChevronDown } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const Index = () => {
  const navigate = useNavigate();
  const { language, texts } = useLanguage();
  const [resume, setResume] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [jobRole, setJobRole] = useState('backend');
  const [interviewType, setInterviewType] = useState('technical');
  const [experience, setExperience] = useState([2]);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const handleStartInterview = () => {
    navigate(`/${language}/interview`, {
      state: {
        resume,
        jobDescription,
        jobRole,
        language,
        interviewType,
        experience: experience[0]
      }
    });
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="p-6 sm:p-8 shadow-md border border-gray-100 bg-white/70 backdrop-blur-md">
            {/* Header */}
            <div className="text-center mb-6">
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                {texts.title}
              </h1>
              <p className="text-m text-gray-600">
                {texts.subtitle}
              </p>
            </div>
            
            <div className="space-y-6">
              {/* Job Role Selection */}
              <div>
                <Label className="text-lg font-semibold text-gray-900 mb-2 block">{texts.jobSelectionLabel}</Label>
                <Select value={jobRole} onValueChange={setJobRole}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={texts.jobSelectionPlaceholder} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="backend">{texts.backendDeveloper}</SelectItem>
                    <SelectItem value="frontend">{texts.frontendDeveloper}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Interview Type Selection */}
              <div>
                <Label className="text-lg font-semibold text-gray-900 mb-2 block">{texts.interviewTypeLabel}</Label>
                <RadioGroup 
                  value={interviewType} 
                  onValueChange={setInterviewType}
                  className="grid grid-cols-2 gap-4"
                >
                  <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                    <RadioGroupItem value="technical" id="technical" />
                    <Label htmlFor="technical" className="flex-1 cursor-pointer">
                      <div className="font-medium">{texts.technicalInterview}</div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                    <RadioGroupItem value="culture" id="culture" />
                    <Label htmlFor="culture" className="flex-1 cursor-pointer">
                      <div className="font-medium">{texts.cultureInterview}</div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Experience Level */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-lg font-semibold text-gray-900">{texts.experienceLabel}</Label>
                  <div className="text-base font-semibold text-indigo-500">
                    {experience[0]} {texts.experienceYears}
                  </div>
                </div>
                <Slider
                  value={experience}
                  onValueChange={setExperience}
                  max={15}
                  min={0}
                  step={1}
                  className="w-full"
                />
              </div>
              
              <Collapsible open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                <CollapsibleTrigger asChild>
                  <div className="flex items-center cursor-pointer text-gray-500 hover:text-gray-800">
                    <h3 className="text-sm font-medium">{texts.detailsLabel}</h3>
                    <ChevronDown className={`h-4 w-4 ml-1 transition-transform ${isDetailsOpen ? 'rotate-180' : ''}`} />
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="resume" className="text-base font-semibold text-gray-900 mb-2 block">{texts.resumeLabel}</Label>
                      <Textarea
                        id="resume"
                        placeholder={texts.resumePlaceholder}
                        value={resume}
                        onChange={(e) => setResume(e.target.value)}
                        rows={6}
                        className="resize-none"
                      />
                    </div>
                    <div>
                      <Label htmlFor="job-description" className="text-base font-semibold text-gray-900 mb-2 block">{texts.jobDescriptionLabel}</Label>
                      <Textarea
                        id="job-description"
                        placeholder={texts.jobDescriptionPlaceholder}
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                        rows={6}
                        className="resize-none"
                      />
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>

            {/* Start Interview Button */}
            <div className="text-center mt-6 border-t pt-6">
              <Button
                onClick={handleStartInterview}
                disabled={!jobRole}
                size="lg"
                className="w-full bg-gradient-to-r from-indigo-400 to-purple-400 hover:from-indigo-500 hover:to-purple-500 text-white font-medium py-3 text-lg shadow-md"
              >
                {texts.startInterviewButton}
              </Button>
              {!jobRole && (
                <p className="text-xs text-gray-500 mt-2">
                  {texts.selectJobRoleMessage}
                </p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
