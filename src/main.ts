import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());

  const config = new DocumentBuilder()
    .setTitle('Y Media Labs')
    .setDescription('GreytHr')
    .setVersion('1.0')
    .addTag('Users')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('users', app, document);
  app.use(cookieParser());
  await app.listen(3000);
}
bootstrap();
