import { Module } from '@nestjs/common';
import { QuestionGeneratorController } from './question-generator.controller';
import { QuestionGeneratorService } from './question-generator.service';

@Module({
  controllers: [QuestionGeneratorController],
  providers: [QuestionGeneratorService],
  exports: [QuestionGeneratorService],
})
export class QuestionGeneratorModule {}
