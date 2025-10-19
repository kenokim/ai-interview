import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { 
  GenerateQuestionRequestDto, 
  GenerateQuestionResponseDto,
  GeneratedQuestion
} from './question-generator.dto';

@Injectable()
export class QuestionGeneratorService {
  private readonly logger = new Logger(QuestionGeneratorService.name);
  private readonly llm: ChatGoogleGenerativeAI;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GOOGLE_API_KEY');
    
    if (!apiKey) {
      throw new Error('GOOGLE_API_KEY is required but not provided');
    }

    this.llm = new ChatGoogleGenerativeAI({
      apiKey,
      model: 'gemini-1.5-flash',
      temperature: 0.7,
    });
  }

  /**
   * Generates interview questions based on user profile and context
   */
  async generateQuestion(request: GenerateQuestionRequestDto): Promise<GenerateQuestionResponseDto> {
    this.logger.log(`Generating question for session: ${request.sessionId}`);
    
    try {
      const sessionId = request.sessionId || this.generateSessionId();
      const { userProfile, previousQAs = [] } = request;
      
      // Create prompt
      const systemPrompt = this.createSystemPrompt(userProfile);
      const userPrompt = this.createUserPrompt(userProfile, previousQAs);
      
      // Generate question with Gemini
      const response = await this.llm.invoke([
        new SystemMessage(systemPrompt),
        new HumanMessage(userPrompt)
      ]);
      
      const questionData = this.parseResponse(response.content as string);
      
      return {
        success: true,
        data: questionData,
        sessionId,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(`Error generating question: ${error.message}`, error.stack);
      throw error;
    }
  }

  private createSystemPrompt(userProfile: any): string {
    const language = userProfile.language === 'ko' ? 'Korean' : 'English';
    
    return `You are an experienced technical interviewer. Generate appropriate interview questions in ${language}.

Job Role: ${userProfile.jobRole}
Experience: ${userProfile.experience}
Interview Type: ${userProfile.interviewType}

Return only a JSON response with this structure:
{
  "question": "the interview question",
  "category": "category name", 
  "difficulty": "beginner/intermediate/advanced",
  "expectedPoints": ["point1", "point2"]
}`;
  }

  private createUserPrompt(userProfile: any, previousQAs: any[]): string {
    let prompt = 'Generate an interview question based on the profile above.';
    
    if (previousQAs && previousQAs.length > 0) {
      prompt += '\n\nPrevious questions asked:';
      previousQAs.forEach((qa, i) => {
        prompt += `\n${i + 1}. ${qa.question}`;
      });
      prompt += '\n\nAvoid repeating these questions.';
    }
    
    return prompt;
  }

  private parseResponse(response: string): GeneratedQuestion {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          question: parsed.question || 'Tell me about your experience.',
          category: parsed.category || 'General',
          difficulty: parsed.difficulty || 'intermediate',
          expectedPoints: parsed.expectedPoints || ['Technical knowledge', 'Experience']
        };
      }
    } catch (error) {
      this.logger.warn('Failed to parse JSON response, using fallback');
    }
    
    return {
      question: response.substring(0, 200) || 'Tell me about your experience.',
      category: 'General',
      difficulty: 'intermediate',
      expectedPoints: ['Technical knowledge', 'Experience']
    };
  }

  /**
   * Generates a unique session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
