import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { SettingsService } from './settings.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Settings')
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('public/storefront')
  @ApiOperation({ summary: 'Public storefront/contact info (no auth)' })
  getPublicStorefront() {
    return this.settingsService.getPublicStorefront();
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Get()
  @ApiOperation({ summary: 'Get all system settings as key-value map' })
  getAll() {
    return this.settingsService.getAll();
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Post('bulk')
  @ApiOperation({ summary: 'Bulk update multiple settings at once' })
  bulkUpsert(@Request() req: any, @Body() body: Record<string, unknown>) {
    return this.settingsService.bulkUpsert(body, req.user?.id ?? 'system');
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Patch(':key')
  @ApiOperation({ summary: 'Update a single setting by key' })
  upsert(
    @Request() req: any,
    @Param('key') key: string,
    @Body() body: { value: unknown },
  ) {
    return this.settingsService.upsert(key, body.value, req.user?.id ?? 'system');
  }
}
