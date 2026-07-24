import { Controller, Get, Post, Delete, Param, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { WorkspaceService } from './workspace.service';

@ApiTags('Workspace')
@Controller()
export class WorkspaceController {
  constructor(private readonly workspaceService: WorkspaceService) {}

  @Get('orders/:id/workspace')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Get full order workspace' })
  getWorkspace(@Param('id') id: string) {
    return this.workspaceService.getOrderWorkspace(id);
  }

  @Get('orders/:id/timeline')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Get order timeline events' })
  async getTimeline(@Param('id') id: string) {
    const ws = await this.workspaceService.getOrderWorkspace(id);
    return ws.timeline;
  }

  @Get('orders/:id/messages')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'List order messages' })
  listMessages(@Param('id') id: string) {
    return this.workspaceService.listMessages(id);
  }

  @Post('orders/:id/messages')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Create order message' })
  createMessage(@Request() req, @Param('id') id: string, @Body() body: any) {
    return this.workspaceService.createMessage(id, {
      user_id: req.user?.id || body.user_id,
      body_ar: body.body_ar,
      attachment_file_id: body.attachment_file_id,
    });
  }

  @Delete('orders/messages/:messageId')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Delete order message' })
  deleteMessage(@Param('messageId') messageId: string) {
    return this.workspaceService.deleteMessage(messageId);
  }

  @Get('customers/:id/activities')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'List customer timeline activities' })
  listActivities(@Param('id') id: string) {
    return this.workspaceService.listCustomerActivities(id);
  }

  @Post('customers/:id/activities')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Create customer activity' })
  createActivity(@Request() req, @Param('id') id: string, @Body() body: any) {
    return this.workspaceService.createActivity({
      ...body,
      customer_id: id,
      created_by: req.user?.id || body.created_by,
    });
  }
}
