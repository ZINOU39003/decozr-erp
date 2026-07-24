import { Controller, Get, Post, Patch, Delete, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { WorkflowsService } from './workflows.service';

@ApiTags('Workflows')
@Controller('workflows')
export class WorkflowsController {
  constructor(private readonly workflowsService: WorkflowsService) {}

  @Get('templates')
  @ApiOperation({ summary: 'List workflow templates' })
  findAllTemplates() {
    return this.workflowsService.findAllTemplates();
  }

  @Get('templates/:id')
  @ApiOperation({ summary: 'Get workflow template by ID' })
  findTemplate(@Param('id') id: string) {
    return this.workflowsService.findTemplateById(id);
  }

  @Post('templates')
  @ApiOperation({ summary: 'Create workflow template' })
  createTemplate(@Body() body: any) {
    return this.workflowsService.createTemplate(body);
  }

  @Patch('templates/:id')
  @ApiOperation({ summary: 'Update workflow template' })
  updateTemplate(@Param('id') id: string, @Body() body: any) {
    return this.workflowsService.updateTemplate(id, body);
  }

  @Delete('templates/:id')
  @ApiOperation({ summary: 'Delete workflow template' })
  deleteTemplate(@Param('id') id: string) {
    return this.workflowsService.deleteTemplate(id);
  }

  @Post('templates/:id/stages')
  @ApiOperation({ summary: 'Add stage to template' })
  createStage(@Param('id') id: string, @Body() body: any) {
    return this.workflowsService.createStage(id, body);
  }

  @Patch('stages/:id')
  @ApiOperation({ summary: 'Update workflow stage' })
  updateStage(@Param('id') id: string, @Body() body: any) {
    return this.workflowsService.updateStage(id, body);
  }

  @Delete('stages/:id')
  @ApiOperation({ summary: 'Delete workflow stage' })
  deleteStage(@Param('id') id: string) {
    return this.workflowsService.deleteStage(id);
  }

  @Post('designs/:designId/link')
  @ApiOperation({ summary: 'Link design to workflow template' })
  linkDesign(@Param('designId') designId: string, @Body() body: { template_id: string }) {
    return this.workflowsService.linkDesign(designId, body.template_id);
  }

  @Delete('designs/:designId/:templateId')
  @ApiOperation({ summary: 'Unlink design from workflow template' })
  unlinkDesign(
    @Param('designId') designId: string,
    @Param('templateId') templateId: string,
  ) {
    return this.workflowsService.unlinkDesign(designId, templateId);
  }

  @Post('seed-default')
  @ApiOperation({ summary: 'Ensure default 9-stage workflow exists' })
  seedDefault() {
    return this.workflowsService.ensureDefaultTemplate();
  }
}
