import { Controller, Get, Res, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { join } from 'path';
import { existsSync } from 'fs';

@Controller()
export class AppController {
  @Get()
  getRoot(@Res() res: Response) {
    // Try to serve frontend if it exists
    const frontendPath = join(process.cwd(), 'frontend');
    const indexPath = join(frontendPath, 'index.html');
    
    if (existsSync(indexPath)) {
      return res.sendFile(indexPath);
    }
    
    // If frontend doesn't exist, return API information
    return res.json({
      name: 'Easy Dispatch API',
      version: '1.0',
      status: 'running',
      endpoints: {
        api: '/api',
        docs: '/api/docs',
      },
      message: 'API is running. Frontend not deployed.',
    });
  }

  @Get('favicon.ico')
  getFavicon(@Res() res: Response) {
    // Return 204 No Content for favicon (standard for missing favicon)
    return res.status(HttpStatus.NO_CONTENT).send();
  }
}