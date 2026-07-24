import { Module } from '@nestjs/common';
import { OffcutsService } from './offcuts.service';
import { OffcutsController } from './offcuts.controller';

@Module({
  controllers: [OffcutsController],
  providers: [OffcutsService],
  exports: [OffcutsService],
})
export class OffcutsModule {}
