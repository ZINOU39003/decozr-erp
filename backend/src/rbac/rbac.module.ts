import { Module } from '@nestjs/common';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { PermissionsGuard } from './permissions.guard';

@Module({
  controllers: [RolesController],
  providers: [RolesService, PermissionsGuard],
  exports: [RolesService, PermissionsGuard],
})
export class RbacModule {}
