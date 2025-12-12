import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { join } from 'path';
import { existsSync } from 'fs';

@Controller()
export class AppController {
  @Get()
  getRoot(@Res() res: Response) {
    const frontendPath = join(process.cwd(), 'frontend');
    const indexPath = join(frontendPath, 'index.html');
    
    if (existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).json({
        code: 'HTTP_EXCEPTION',
        message: 'Frontend not found. Please build the frontend.',
        timestamp: new Date().toISOString(),
        path: '/',
      });
    }
  }
}