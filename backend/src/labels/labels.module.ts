import { Module } from '@nestjs/common';
import { LabelsController } from './labels.controller';
import { LabelsService } from './labels.service';
import { AuthModule } from '../auth/auth.module';
import { FirestoreModule } from '../firestore/firestore.module';

@Module({
  imports: [AuthModule, FirestoreModule],
  controllers: [LabelsController],
  providers: [LabelsService],
  exports: [LabelsService],
})
export class LabelsModule {}

