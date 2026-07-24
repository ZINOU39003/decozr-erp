import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async check() {
    let database: 'ok' | 'error' = 'ok';
    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch {
      database = 'error';
    }

    const status = database === 'ok' ? 'ok' : 'degraded';

    return {
      status,
      service: 'DecoZR ERP API',
      version: '0.1.0',
      timestamp: new Date().toISOString(),
      checks: { database },
    };
  }
}
