import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';
import express, { Express } from 'express';
import cookieParser = require('cookie-parser');
import { AppModule } from '../src/app.module';
import { IncomingMessage, ServerResponse } from 'http';

let cachedServer: Express;

async function bootstrap(): Promise<Express> {
  if (cachedServer) return cachedServer;

  const expressApp = express();
  const app = await NestFactory.create(AppModule, new ExpressAdapter(expressApp), {
    logger: ['error', 'warn'],
  });

  const config = app.get(ConfigService);

  app.use(cookieParser());
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const corsOrigin = config.get<string>('CORS_ORIGIN', 'http://localhost:3000');
  app.enableCors({
    origin: corsOrigin.includes(',') ? corsOrigin.split(',').map(o => o.trim()) : corsOrigin,
    credentials: true,
  });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Kita BE API')
    .setDescription('API quản lý website Gamma Home')
    .setVersion('1.0')
    .addCookieAuth('access_token')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  app.use('/scalar', apiReference({ spec: { content: document } }));

  await app.init();
  cachedServer = expressApp;
  return cachedServer;
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const server = await bootstrap();
  server(req, res);
}
