import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RolesService } from './roles.service';
import { RequirePermissions } from './permissions.decorator';
import { PermissionsGuard } from './permissions.guard';

@ApiTags('Roles & Permissions')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@Controller()
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get('roles')
  @RequirePermissions('manage_roles', 'view_settings', 'manage_employees')
  @ApiOperation({ summary: 'List roles' })
  listRoles() {
    return this.rolesService.listRoles();
  }

  @Get('permissions')
  @RequirePermissions('manage_roles', 'view_settings', 'manage_employees')
  @ApiOperation({ summary: 'List permissions (grouped)' })
  listPermissions() {
    return this.rolesService.listPermissionsGrouped();
  }

  @Post('roles')
  @RequirePermissions('manage_roles')
  @ApiOperation({ summary: 'Create role' })
  createRole(@Body() body: any) {
    return this.rolesService.createRole(body);
  }

  @Get('roles/:id')
  @RequirePermissions('manage_roles', 'view_settings')
  getRole(@Param('id') id: string) {
    return this.rolesService.getRole(id);
  }

  @Patch('roles/:id')
  @RequirePermissions('manage_roles')
  updateRole(@Param('id') id: string, @Body() body: any) {
    return this.rolesService.updateRole(id, body);
  }

  @Delete('roles/:id')
  @RequirePermissions('manage_roles')
  deleteRole(@Param('id') id: string) {
    return this.rolesService.deleteRole(id);
  }

  @Put('roles/:id/permissions')
  @RequirePermissions('manage_roles')
  setRolePermissions(@Param('id') id: string, @Body() body: { permissions: string[] }) {
    return this.rolesService.setRolePermissions(id, body.permissions || []);
  }

  @Get('users/:userId/access')
  @RequirePermissions('manage_roles', 'manage_employees')
  getUserAccess(@Param('userId') userId: string) {
    return this.rolesService.getUserAccess(userId);
  }

  @Put('users/:userId/access')
  @RequirePermissions('manage_roles', 'manage_employees')
  setUserAccess(@Param('userId') userId: string, @Body() body: any) {
    return this.rolesService.setUserAccess(userId, body);
  }
}
