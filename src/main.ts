import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';
import cookieParser = require('cookie-parser');
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  app.use(cookieParser());
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const corsOrigin = config.get<string>('CORS_ORIGIN', 'http://localhost:3000');
  app.enableCors({
    origin: corsOrigin.includes(',') ? corsOrigin.split(',').map(o => o.trim()) : corsOrigin,
    credentials: true,
  });

  // OpenAPI spec
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Kita BE API')
    .setDescription('API quản lý website Gamma Home')
    .setVersion('1.0')
    .addCookieAuth('access_token')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);

  // Scalar UI tại /scalar
  app.use('/scalar', apiReference({ spec: { content: document } }));

  const port = config.get<number>('PORT', 4000);
  await app.listen(port);
  console.log(`Server running on http://localhost:${port}/api`);
  console.log(`Scalar docs:   http://localhost:${port}/scalar`);
}
bootstrap();
