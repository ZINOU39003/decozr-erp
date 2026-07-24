import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Request } from '@nestjs/common';
import { MachinesService } from './machines.service';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('machines')
export class MachinesController {
  constructor(private readonly machinesService: MachinesService) {}

  @Get()
  async getMachines() {
    return this.machinesService.findAll();
  }

  @Get('jobs')
  async getAllJobs() {
    return this.machinesService.getMachineJobs();
  }

  @Post('jobs/:id/start')
  async startJob(@Request() req, @Param('id') id: string) {
    return this.machinesService.startJob(id, req.user.id);
  }

  @Post('jobs/:id/complete')
  async completeJob(@Param('id') id: string, @Body() data: { actual_minutes: number }) {
    return this.machinesService.completeJob(id, data.actual_minutes);
  }

  @Get(':id')
  async getMachineById(@Param('id') id: string) {
    return this.machinesService.findOne(id);
  }

  @Post()
  async createMachine(@Body() data: any) {
    return this.machinesService.create(data);
  }

  @Put(':id')
  async updateMachine(@Param('id') id: string, @Body() data: any) {
    return this.machinesService.update(id, data);
  }

  @Delete(':id')
  async deleteMachine(@Param('id') id: string) {
    return this.machinesService.delete(id);
  }
}
