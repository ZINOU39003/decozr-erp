import { Controller, Get, Post, Param, UseGuards, Request } from '@nestjs/common';
import { ProductionService } from './production.service';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('production')
export class ProductionController {
  constructor(private readonly productionService: ProductionService) {}

  @Get('shortage-report/:orderId')
  async getShortageReport(@Param('orderId') orderId: string) {
    return this.productionService.getShortageReport(orderId);
  }

  @Post('start/:orderId')
  async startProduction(@Request() req, @Param('orderId') orderId: string) {
    return this.productionService.startProduction(orderId, req.user.id);
  }
}
