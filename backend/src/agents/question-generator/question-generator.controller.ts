import { 
  Controller, 
  Post, 
  Body, 
  HttpStatus, 
  HttpException,
  Logger 
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBadRequestResponse, 
  ApiInternalServerErrorResponse 
} from '@nestjs/swagger';
import { QuestionGeneratorService } from './question-generator.service';
import { 
  GenerateQuestionRequestDto, 
  GenerateQuestionResponseDto 
} from './question-generator.dto';

@ApiTags('agents')
@Controller('agents/question-generator')
export class QuestionGeneratorController {
  private readonly logger = new Logger(QuestionGeneratorController.name);

  constructor(
    private readonly questionGeneratorService: QuestionGeneratorService
  ) {}

  @Post()
  @ApiOperation({ 
    summary: 'Generate interview question',
    description: 'Generates an appropriate interview question based on user profile and interview context'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Question generated successfully',
    type: GenerateQuestionResponseDto 
  })
  @ApiBadRequestResponse({ 
    description: 'Invalid request data',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: { type: 'array', items: { type: 'string' } },
        error: { type: 'string', example: 'Bad Request' }
      }
    }
  })
  @ApiInternalServerErrorResponse({ 
    description: 'Internal server error',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 500 },
        message: { type: 'string', example: 'Internal server error' },
        error: { type: 'string', example: 'Internal Server Error' }
      }
    }
  })
  async generateQuestion(
    @Body() request: GenerateQuestionRequestDto
  ): Promise<GenerateQuestionResponseDto> {
    try {
      this.logger.log(`Received question generation request for session: ${request.sessionId}`);
      
      const result = await this.questionGeneratorService.generateQuestion(request);
      
      this.logger.log(`Successfully generated question for session: ${result.sessionId}`);
      return result;
      
    } catch (error) {
      this.logger.error(`Failed to generate question: ${error.message}`, error.stack);
      
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Failed to generate interview question',
          error: 'Internal Server Error',
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
