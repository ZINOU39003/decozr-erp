import { Controller, Get, Post, Body, Patch, Param, Query, Put } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { PaginationDto } from '../common/dto/pagination.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Tasks')
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @ApiOperation({ summary: 'Create a production task' })
  create(@Body() createDto: any) {
    return this.tasksService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all tasks with pagination' })
  findAll(@Query() query: PaginationDto) {
    return this.tasksService.findAll(query);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a task' })
  update(@Param('id') id: string, @Body() updateDto: any) {
    return this.tasksService.update(id, updateDto);
  }

  @Put(':id/complete')
  @ApiOperation({ summary: 'Mark task as complete' })
  async completeTask(@Param('id') id: string) {
    return this.tasksService.completeTask(id);
  }
}
