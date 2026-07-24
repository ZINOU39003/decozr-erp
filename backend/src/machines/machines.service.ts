import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MachinesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.machine.findMany();
  }

  async findOne(id: string) {
    const machine = await this.prisma.machine.findUnique({
      where: { id },
    });
    if (!machine) throw new NotFoundException('Machine not found');
    return machine;
  }

  async create(data: any) {
    return this.prisma.machine.create({
      data,
    });
  }

  async update(id: string, data: any) {
    return this.prisma.machine.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return this.prisma.machine.delete({
      where: { id },
    });
  }

  // --- Machine Jobs ---
  async getMachineJobs(machineId?: string) {
    const where = machineId ? { machine_id: machineId } : {};
    return this.prisma.machineJob.findMany({
      where,
      include: {
        order: true,
        orderItem: true,
        machine: true,
        worker: true,
      },
      orderBy: { id: 'desc' }, // fallback since created_at is missing in schema
    });
  }

  async startJob(jobId: string, workerId: string) {
    const job = await this.prisma.machineJob.findUnique({ where: { id: jobId } });
    if (!job) throw new NotFoundException('Machine job not found');

    return this.prisma.machineJob.update({
      where: { id: jobId },
      data: {
        status: 'in_progress',
        worker_id: workerId,
        started_at: new Date(),
      }
    });
  }

  async completeJob(jobId: string, actualMinutes: number) {
    const job = await this.prisma.machineJob.findUnique({ where: { id: jobId } });
    if (!job) throw new NotFoundException('Machine job not found');

    return this.prisma.machineJob.update({
      where: { id: jobId },
      data: {
        status: 'completed',
        actual_minutes: actualMinutes,
        completed_at: new Date(),
      }
    });
  }
}
