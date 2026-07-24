import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Put,
  UseGuards,
} from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { PaginationDto } from '../common/dto/pagination.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { PermissionsGuard } from '../rbac/permissions.guard';
import { RequirePermissions } from '../rbac/permissions.decorator';
import { RolesService } from '../rbac/roles.service';

@ApiTags('Employees')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@Controller('employees')
export class EmployeesController {
  constructor(
    private readonly employeesService: EmployeesService,
    private readonly rolesService: RolesService,
  ) {}

  @Post()
  @RequirePermissions('manage_employees')
  @ApiOperation({ summary: 'Create an employee (+ optional login)' })
  create(@Body() createDto: any) {
    return this.employeesService.create(createDto);
  }

  @Get()
  @RequirePermissions('view_employees', 'manage_employees')
  @ApiOperation({ summary: 'Get all employees with pagination' })
  findAll(@Query() query: PaginationDto) {
    return this.employeesService.findAll(query);
  }

  @Get(':id')
  @RequirePermissions('view_employees', 'manage_employees')
  @ApiOperation({ summary: 'Get employee by ID' })
  findById(@Param('id') id: string) {
    return this.employeesService.findById(id);
  }

  @Get(':id/access')
  @RequirePermissions('manage_employees', 'manage_roles')
  @ApiOperation({ summary: 'Get employee role + permission overrides' })
  async getAccess(@Param('id') id: string) {
    const emp = await this.employeesService.findById(id);
    if (!emp.user_id) return { user_id: null, role: null, permissions: [], overrides: [] };
    return this.rolesService.getUserAccess(emp.user_id);
  }

  @Put(':id/access')
  @RequirePermissions('manage_employees', 'manage_roles')
  @ApiOperation({ summary: 'Set employee role + permissions' })
  async setAccess(@Param('id') id: string, @Body() body: any) {
    const emp = await this.employeesService.findById(id);
    if (!emp.user_id) {
      return { error: 'لا يوجد حساب دخول لهذا الموظف' };
    }
    return this.rolesService.setUserAccess(emp.user_id, body);
  }

  @Post(':id/attendance')
  @RequirePermissions('manage_employees')
  @ApiOperation({ summary: 'Record attendance' })
  addAttendance(@Param('id') id: string, @Body() body: any) {
    return this.employeesService.addAttendance(id, body);
  }

  @Post(':id/salary')
  @RequirePermissions('manage_employees')
  @ApiOperation({ summary: 'Record salary' })
  addSalary(@Param('id') id: string, @Body() body: any) {
    return this.employeesService.addSalary(id, body);
  }

  @Patch(':id')
  @RequirePermissions('manage_employees')
  @ApiOperation({ summary: 'Update an employee' })
  update(@Param('id') id: string, @Body() updateDto: any) {
    return this.employeesService.update(id, updateDto);
  }

  @Delete(':id')
  @RequirePermissions('manage_employees')
  @ApiOperation({ summary: 'Soft delete an employee' })
  remove(@Param('id') id: string) {
    return this.employeesService.softDelete(id);
  }
}
