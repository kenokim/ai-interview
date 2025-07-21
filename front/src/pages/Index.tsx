
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Upload, FileText, Briefcase, Mic, MessageSquare, Settings } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const [resume, setResume] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [jobRole, setJobRole] = useState('typescript');
  const [interviewType, setInterviewType] = useState('technical');
  const [experience, setExperience] = useState([2]);

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            AI 면접 서비스
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            AI와 함께 실전같은 맞춤형 면접을 경험해보세요.
          </p>
        </div>

        {/* Input Form */}
        <div className="max-w-3xl mx-auto">
          <Card className="p-8 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <div className="space-y-8">
              {/* Job Role Selection */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <Briefcase className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">직무 선택</h2>
                    <p className="text-sm text-gray-600">면접을 진행할 직무를 선택해주세요</p>
                  </div>
                </div>
                
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
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Settings className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">면접 유형</h2>
                    <p className="text-sm text-gray-600">진행할 면접 유형을 선택해주세요</p>
                  </div>
                </div>
                
                <RadioGroup 
                  value={interviewType} 
                  onValueChange={setInterviewType}
                  className="grid grid-cols-2 gap-4"
                >
                  <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-gray-50">
                    <RadioGroupItem value="technical" id="technical" />
                    <Label htmlFor="technical" className="flex-1 cursor-pointer">
                      <div className="font-medium">기술면접</div>
                      <div className="text-sm text-gray-500">기술적 역량과 문제해결 능력 평가</div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-gray-50">
                    <RadioGroupItem value="culture" id="culture" />
                    <Label htmlFor="culture" className="flex-1 cursor-pointer">
                      <div className="font-medium">컬쳐핏면접</div>
                      <div className="text-sm text-gray-500">조직문화 적합성과 소프트스킬 평가</div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Experience Level */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">경력 연차</h2>
                    <p className="text-sm text-gray-600">본인의 경력 연차를 선택해주세요</p>
                  </div>
                  <div className="text-lg font-semibold text-blue-600">
                    {experience[0]}년차
                  </div>
                </div>
                
                <div className="space-y-4">
                  <Slider
                    value={experience}
                    onValueChange={setExperience}
                    max={15}
                    min={0}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>신입 (0년)</span>
                    <span>시니어 (15년+)</span>
                  </div>
                </div>
              </div>
              
              {/* Resume and JD Input (Optional) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Resume Input */}
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">
                        이력서 <span className="text-sm text-gray-500 font-normal">(선택사항)</span>
                      </h2>
                      <p className="text-sm text-gray-600">본인의 이력서를 입력해주세요</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <Textarea
                      id="resume"
                      placeholder="이력서 내용을 자유롭게 작성해주세요."
                      value={resume}
                      onChange={(e) => setResume(e.target.value)}
                      rows={8}
                      className="resize-none"
                    />
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Upload className="h-4 w-4" />
                      <span>직접 입력하거나 파일에서 복사</span>
                    </div>
                  </div>
                </div>

                {/* Job Description Input */}
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Briefcase className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">
                        채용공고 <span className="text-sm text-gray-500 font-normal">(선택사항)</span>
                      </h2>
                      <p className="text-sm text-gray-600">지원할 채용공고를 입력해주세요</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <Textarea
                      id="job-description"
                      placeholder="채용공고 내용을 자유롭게 작성해주세요."
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      rows={8}
                      className="resize-none"
                    />
                     <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Upload className="h-4 w-4" />
                      <span>직접 입력하거나 파일에서 복사</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Start Interview Button */}
            <div className="text-center mt-12 border-t pt-8">
              <div className="space-y-4 max-w-md mx-auto">
                <div className="flex justify-center space-x-4 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mic className="h-4 w-4" />
                    <span>음성 인터랙션</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MessageSquare className="h-4 w-4" />
                    <span>채팅 지원</span>
                  </div>
                </div>
                
                <Button
                  onClick={handleStartInterview}
                  disabled={!jobRole}
                  size="lg"
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 text-lg shadow-lg"
                >
                  면접 시작하기
                </Button>
                
                {!jobRole && (
                  <p className="text-sm text-gray-500">
                    직무를 선택해주세요
                  </p>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
