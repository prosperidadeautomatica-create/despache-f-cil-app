import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Request } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { LabelsService } from './labels.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentClient } from '../auth/decorators/current-client.decorator';

class GenerateLabelDto {
  quoteId: string;
}

@ApiTags('labels')
@Controller('labels')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class LabelsController {
  constructor(private readonly labelsService: LabelsService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Generate shipping label for a quote' })
  @ApiResponse({
    status: 200,
    description: 'Label generated successfully',
    schema: {
      type: 'object',
      properties: {
        labelId: { type: 'string' },
        labelUrl: { type: 'string' },
        pdfBase64: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid request or quote status' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Quote not found' })
  async generateLabel(
    @Body() body: GenerateLabelDto,
    @CurrentClient() client: any,
    @Req() req: Request,
  ) {
    const correlationId = (req as any).correlationId || 'unknown';
    return this.labelsService.generateLabel(
      client.clientId,
      body.quoteId,
      correlationId,
    );
  }
}

