import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export enum JobRole {
  BACKEND = 'backend',
  FRONTEND = 'frontend',
  FULLSTACK = 'fullstack',
}

export enum InterviewType {
  TECHNICAL = 'technical',
  CULTURE = 'culture',
}

export enum ExperienceLevel {
  JUNIOR = 'junior',
  MID_LEVEL = 'mid-level',
  SENIOR = 'senior',
}

export class UserProfile {
  @ApiProperty({ 
    description: 'Job role of the candidate',
    enum: JobRole,
    example: JobRole.BACKEND 
  })
  @IsEnum(JobRole)
  jobRole: JobRole;

  @ApiProperty({ 
    description: 'Experience level of the candidate',
    enum: ExperienceLevel,
    example: ExperienceLevel.MID_LEVEL 
  })
  @IsEnum(ExperienceLevel)
  experience: ExperienceLevel;

  @ApiProperty({ 
    description: 'Type of interview',
    enum: InterviewType,
    example: InterviewType.TECHNICAL 
  })
  @IsEnum(InterviewType)
  interviewType: InterviewType;

  @ApiProperty({ 
    description: 'Candidate resume content',
    required: false,
    example: 'Software Engineer with 3 years of experience...'
  })
  @IsOptional()
  @IsString()
  resume?: string;

  @ApiProperty({ 
    description: 'Job description content',
    required: false,
    example: 'We are looking for a backend developer...'
  })
  @IsOptional()
  @IsString()
  jobDescription?: string;

  @ApiProperty({ 
    description: 'Interview language',
    example: 'en',
    required: false,
    default: 'en'
  })
  @IsOptional()
  @IsString()
  language?: string;
}

export class PreviousQA {
  @ApiProperty({ 
    description: 'Previously asked question',
    example: 'What is your experience with Node.js?'
  })
  @IsString()
  question: string;

  @ApiProperty({ 
    description: 'Candidate answer',
    example: 'I have been working with Node.js for 3 years...'
  })
  @IsString()
  answer: string;
}

export class GenerateQuestionRequestDto {
  @ApiProperty({ 
    description: 'User profile information',
    type: UserProfile
  })
  @ValidateNested()
  @Type(() => UserProfile)
  userProfile: UserProfile;

  @ApiProperty({ 
    description: 'Array of previous questions and answers',
    type: [PreviousQA],
    required: false,
    example: []
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PreviousQA)
  previousQAs?: PreviousQA[];

  @ApiProperty({ 
    description: 'Session ID for tracking',
    required: false,
    example: 'session_123456'
  })
  @IsOptional()
  @IsString()
  sessionId?: string;
}

export class GeneratedQuestion {
  @ApiProperty({ 
    description: 'Generated interview question',
    example: 'Can you explain the difference between REST and GraphQL APIs?'
  })
  @IsString()
  question: string;

  @ApiProperty({ 
    description: 'Question category or topic',
    example: 'API Design'
  })
  @IsString()
  category: string;

  @ApiProperty({ 
    description: 'Difficulty level of the question',
    example: 'intermediate'
  })
  @IsString()
  difficulty: string;

  @ApiProperty({ 
    description: 'Expected answer points or hints',
    example: ['Explain REST principles', 'Mention GraphQL benefits', 'Compare use cases']
  })
  @IsArray()
  @IsString({ each: true })
  expectedPoints: string[];
}

export class GenerateQuestionResponseDto {
  @ApiProperty({ 
    description: 'Success status',
    example: true
  })
  success: boolean;

  @ApiProperty({ 
    description: 'Generated question details',
    type: GeneratedQuestion
  })
  @ValidateNested()
  @Type(() => GeneratedQuestion)
  data: GeneratedQuestion;

  @ApiProperty({ 
    description: 'Session ID',
    example: 'session_123456'
  })
  sessionId: string;

  @ApiProperty({ 
    description: 'Timestamp of generation',
    example: '2024-01-20T10:00:00.000Z'
  })
  timestamp: string;
}
