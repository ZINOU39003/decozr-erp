import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CapacityService {
  constructor(private prisma: PrismaService) {}

  /**
   * Forecast machine capacity for a date range.
   * Combines machine daily capacity with pending/in-progress jobs and stored snapshots.
   */
  async forecast(from: string, days = 7) {
    const start = new Date(from);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + days);

    const machines = await this.prisma.machine.findMany({
      where: { is_active: true, deletedAt: null },
    });

    const jobs = await this.prisma.machineJob.findMany({
      where: {
        status: { in: ['pending', 'in_progress'] },
        OR: [
          { started_at: { gte: start, lt: end } },
          { started_at: null, createdAt: { gte: start, lt: end } },
        ],
      },
    });

    const snapshots = await this.prisma.capacitySnapshot.findMany({
      where: {
        date: { gte: start, lt: end },
      },
    });

    const result: Array<{
      date: string;
      machine_id: string;
      machine_code: string;
      machine_name_ar: string;
      available_min: number;
      required_min: number;
      overload: boolean;
      operational_status: string;
    }> = [];

    for (let d = 0; d < days; d++) {
      const day = new Date(start);
      day.setDate(start.getDate() + d);
      const dayKey = day.toISOString().slice(0, 10);
      const dayStart = new Date(day);
      const dayEnd = new Date(day);
      dayEnd.setDate(dayEnd.getDate() + 1);

      for (const machine of machines) {
        const snapshot = snapshots.find(
          (s) =>
            s.machine_id === machine.id &&
            s.date.toISOString().slice(0, 10) === dayKey,
        );

        const dayJobs = jobs.filter((j) => {
          if (j.machine_id !== machine.id) return false;
          const ref = j.started_at || j.createdAt;
          return ref >= dayStart && ref < dayEnd;
        });

        const requiredFromJobs = dayJobs.reduce(
          (sum, j) => sum + (j.estimated_minutes || 0),
          0,
        );

        const available =
          snapshot?.available_minutes ??
          (machine.operational_status === 'operational'
            ? machine.daily_capacity_minutes
            : 0);
        const required = snapshot?.required_minutes ?? requiredFromJobs;
        const overload = snapshot?.overload ?? required > available;

        result.push({
          date: dayKey,
          machine_id: machine.id,
          machine_code: machine.code,
          machine_name_ar: machine.name_ar,
          available_min: available,
          required_min: required,
          overload,
          operational_status: machine.operational_status,
        });
      }
    }

    return result;
  }

  async upsertSnapshot(data: {
    machine_id: string;
    date: string | Date;
    available_minutes: number;
    required_minutes: number;
  }) {
    const date = new Date(data.date);
    date.setHours(0, 0, 0, 0);
    const overload = data.required_minutes > data.available_minutes;

    return this.prisma.capacitySnapshot.upsert({
      where: {
        machine_id_date: { machine_id: data.machine_id, date },
      },
      update: {
        available_minutes: data.available_minutes,
        required_minutes: data.required_minutes,
        overload,
      },
      create: {
        machine_id: data.machine_id,
        date,
        available_minutes: data.available_minutes,
        required_minutes: data.required_minutes,
        overload,
      },
    });
  }
}
