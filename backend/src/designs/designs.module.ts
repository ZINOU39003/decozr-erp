import { Module } from '@nestjs/common';
import { DesignsService } from './designs.service';
import { DesignsController } from './designs.controller';
import { DesignVersionsService } from './design-versions.service';
import { DesignVersionsController } from './design-versions.controller';

@Module({
  providers: [DesignsService, DesignVersionsService],
  controllers: [DesignsController, DesignVersionsController],
  exports: [DesignsService, DesignVersionsService],
})
export class DesignsModule {}
