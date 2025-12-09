import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { existsSync } from 'fs';
import { AppModule } from './app.module';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { CorrelationIdInterceptor } from './common/interceptors/correlation-id.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Serve static files from frontend directory
  // __dirname in production: backend/dist/src
  // __dirname in development: backend/src (when using ts-node)
  // We need to go up to backend root, then into frontend
  const frontendPath = join(process.cwd(), 'frontend');
  
  if (existsSync(frontendPath)) {
    app.useStaticAssets(frontendPath, {
      index: false,
      prefix: '/',
    });
    console.log(`✓ Frontend static files will be served from: ${frontendPath}`);
  } else {
    console.warn(`⚠ Frontend directory not found at: ${frontendPath}`);
    console.warn(`  Frontend will not be served. Build the frontend and place it in backend/frontend directory.`);
  }

  // Enable CORS - allow all origins when serving frontend
  app.enableCors({
    origin: true, // Allow all origins when serving frontend
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global filters
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global interceptors
  app.useGlobalInterceptors(
    new CorrelationIdInterceptor(),
    new LoggingInterceptor(),
  );

  // API prefix - exclude frontend routes
  app.setGlobalPrefix('api', {
    exclude: ['/'],
  });

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Easy Dispatch API')
    .setDescription('Shipping Quote Management API Gateway')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Catch-all handler for frontend routes (must be after all API routes)
  // This serves index.html for client-side routing
  if (existsSync(frontendPath)) {
    app.use((req, res, next) => {
      // Skip API routes and static assets
      if (req.path.startsWith('/api') || req.path.startsWith('/assets')) {
        return next();
      }
      // Serve index.html for all other routes (client-side routing)
      const indexPath = join(frontendPath, 'index.html');
      if (existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(404).json({ 
          message: 'Frontend index.html not found. Please build the frontend.' 
        });
      }
    });
  }

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Frontend served from: ${frontendPath}`);
  console.log(`API available at: http://localhost:${port}/api`);
  console.log(`Swagger docs at: http://localhost:${port}/api/docs`);
}

bootstrap();
