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

const Index = () => {
  const navigate = useNavigate();
  const [resume, setResume] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [jobRole, setJobRole] = useState('typescript');
  const [interviewType, setInterviewType] = useState('technical');
  const [experience, setExperience] = useState([2]);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const handleStartInterview = () => {
    navigate('/interview', {
      state: {
        resume,
        jobDescription,
        jobRole,
        interviewType,
        experience: experience[0]
      }
    });
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="p-6 sm:p-8 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            {/* Header */}
            <div className="text-center mb-6">
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                AI 면접 서비스
              </h1>
              <p className="text-lg text-gray-600">
                AI와 함께 실전같은 맞춤형 면접을 경험해보세요.
              </p>
            </div>
            
            <div className="space-y-6">
              {/* Job Role Selection */}
              <div>
                <Label className="text-lg font-semibold text-gray-900 mb-2 block">직무 선택</Label>
                <Select value={jobRole} onValueChange={setJobRole}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="직무를 선택해주세요" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="typescript">TypeScript 개발자</SelectItem>
                    <SelectItem value="ai_agent">AI Agent 개발자</SelectItem>
                    <SelectItem value="frontend">프론트엔드 개발자</SelectItem>
                    <SelectItem value="backend">백엔드 개발자</SelectItem>
                    <SelectItem value="fullstack">풀스택 개발자</SelectItem>
                    <SelectItem value="mobile">모바일 개발자</SelectItem>
                    <SelectItem value="devops">DevOps 엔지니어</SelectItem>
                    <SelectItem value="data">데이터 사이언티스트</SelectItem>
                    <SelectItem value="pm">프로덕트 매니저</SelectItem>
                    <SelectItem value="designer">UI/UX 디자이너</SelectItem>
                    <SelectItem value="qa">QA 엔지니어</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Interview Type Selection */}
              <div>
                <Label className="text-lg font-semibold text-gray-900 mb-2 block">면접 유형</Label>
                <RadioGroup 
                  value={interviewType} 
                  onValueChange={setInterviewType}
                  className="grid grid-cols-2 gap-4"
                >
                  <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                    <RadioGroupItem value="technical" id="technical" />
                    <Label htmlFor="technical" className="flex-1 cursor-pointer">
                      <div className="font-medium">기술면접</div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                    <RadioGroupItem value="culture" id="culture" />
                    <Label htmlFor="culture" className="flex-1 cursor-pointer">
                      <div className="font-medium">컬쳐핏면접</div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Experience Level */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-lg font-semibold text-gray-900">경력 연차</Label>
                  <div className="text-base font-semibold text-blue-600">
                    {experience[0]}년차
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
                    <h3 className="text-sm font-medium">세부 설정</h3>
                    <ChevronDown className={`h-4 w-4 ml-1 transition-transform ${isDetailsOpen ? 'rotate-180' : ''}`} />
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="resume" className="text-base font-semibold text-gray-900 mb-2 block">이력서 (선택)</Label>
                      <Textarea
                        id="resume"
                        placeholder="이력서 내용을 붙여넣으세요."
                        value={resume}
                        onChange={(e) => setResume(e.target.value)}
                        rows={6}
                        className="resize-none"
                      />
                    </div>
                    <div>
                      <Label htmlFor="job-description" className="text-base font-semibold text-gray-900 mb-2 block">채용공고 (선택)</Label>
                      <Textarea
                        id="job-description"
                        placeholder="채용공고 내용을 붙여넣으세요."
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
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 text-lg shadow-lg"
              >
                면접 시작하기
              </Button>
              {!jobRole && (
                <p className="text-xs text-gray-500 mt-2">
                  직무를 선택해주세요
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
