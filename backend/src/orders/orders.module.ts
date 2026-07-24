import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { DesignsModule } from '../designs/designs.module';
import { MachinesModule } from '../machines/machines.module';
import { RbacModule } from '../rbac/rbac.module';

@Module({
  imports: [DesignsModule, MachinesModule, RbacModule],
  providers: [OrdersService],
  controllers: [OrdersController],
  exports: [OrdersService],
})
export class OrdersModule {}
