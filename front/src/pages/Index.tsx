import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useLanguage } from "@/contexts/LanguageContext";

const Index = () => {
  const navigate = useNavigate();
  const { language, texts } = useLanguage();
  const [jobRole, setJobRole] = useState('backend');
  const [interviewType, setInterviewType] = useState('technical');
  const [experience, setExperience] = useState([4]);
  const [speakerEnabled, setSpeakerEnabled] = useState(true);
  const [microphoneEnabled, setMicrophoneEnabled] = useState(false);

  const requestMicrophonePermission = async (): Promise<boolean> => {
    if (!("mediaDevices" in navigator) || !navigator.mediaDevices.getUserMedia) {
      return false;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
      return true;
    } catch {
      return false;
    }
  };

  const handleMicrophoneToggle = async (checked: boolean): Promise<void> => {
    if (!checked) {
      setMicrophoneEnabled(false);
      return;
    }

    const ok = await requestMicrophonePermission();
    if (!ok) {
      setMicrophoneEnabled(false);
      alert(texts.microphonePermissionRequired);
      return;
    }

    setMicrophoneEnabled(true);
  };

  const getExperienceDisplay = (years: number): string => {
    if (years === 0) return texts.experienceEntry;
    if (years >= 15) return texts.experience15Plus;
    if (language === "ko") return `${years}${texts.experienceYears}`;
    return `${years} ${texts.experienceYears}`;
  };

  const handleLanguageChange = (nextLanguage: string) => {
    if (nextLanguage !== "ko" && nextLanguage !== "en") return;
    if (nextLanguage === language) return;
    navigate(`/${nextLanguage}`, { replace: true });
  };

  const handleStartInterview = () => {
    navigate(`/${language}/interview`, {
      state: {
        resume: "",
        jobDescription: "",
        jobRole,
        language,
        interviewType,
        experience: experience[0],
        speakerEnabled,
        microphoneEnabled,
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
              <div className="flex justify-end">
                <RadioGroup
                  value={language}
                  onValueChange={handleLanguageChange}
                  className="inline-flex items-center gap-1 rounded-full border bg-white/70 px-1 py-1 text-xs"
                >
                  <div className="flex items-center">
                    <RadioGroupItem value="ko" id="lang-ko" className="sr-only" />
                    <Label
                      htmlFor="lang-ko"
                      className={`cursor-pointer select-none rounded-full px-2 py-1 ${
                        language === "ko" ? "bg-gray-900 text-white" : "text-gray-700"
                      }`}
                    >
                      {texts.korean}
                    </Label>
                  </div>
                  <div className="flex items-center">
                    <RadioGroupItem value="en" id="lang-en" className="sr-only" />
                    <Label
                      htmlFor="lang-en"
                      className={`cursor-pointer select-none rounded-full px-2 py-1 ${
                        language === "en" ? "bg-gray-900 text-white" : "text-gray-700"
                      }`}
                    >
                      {texts.english}
                    </Label>
                  </div>
                </RadioGroup>
              </div>
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
                    {getExperienceDisplay(experience[0])}
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

              {/* Audio Settings */}
              <div className="rounded-lg border bg-white/60 px-4 py-3">
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {texts.speakerLabel}
                      </p>
                      <p className="text-[11px] text-gray-600">
                        {speakerEnabled ? texts.audioOn : texts.audioOff}
                      </p>
                    </div>
                    <Switch checked={speakerEnabled} onCheckedChange={setSpeakerEnabled} />
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {texts.microphoneLabel}
                      </p>
                      <p className="text-[11px] text-gray-600">
                        {microphoneEnabled ? texts.audioOn : texts.audioOff}
                      </p>
                    </div>
                    <Switch
                      checked={microphoneEnabled}
                      onCheckedChange={handleMicrophoneToggle}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Start Interview Button */}
            <div className="text-center mt-6 border-t pt-6">
              <Button
                onClick={handleStartInterview}
                disabled={!jobRole}
                size="lg"
                className="w-full bg-gradient-to-r from-indigo-400 to-purple-400 hover:from-indigo-500 hover:to-purple-500 text-white font-medium py-3 text-lg shadow-md"
              >
                {texts.startButtonShort}
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
