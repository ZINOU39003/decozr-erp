import { Module } from '@nestjs/common';
import { AdminPortalController } from './admin-portal.controller';
import { AdminPortalService } from './admin-portal.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AdminPortalController],
  providers: [AdminPortalService],
  exports: [AdminPortalService],
})
export class AdminPortalModule {}
