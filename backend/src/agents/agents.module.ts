import { Module } from '@nestjs/common';
import { QuestionGeneratorModule } from './question-generator/question-generator.module';

@Module({
  imports: [QuestionGeneratorModule],
  exports: [QuestionGeneratorModule],
})
export class AgentsModule {}
