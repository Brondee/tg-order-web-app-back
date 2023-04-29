import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import corsOptions from 'config/corsOptions';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.enableCors(corsOptions);
  await app.listen(3333);
}
bootstrap();
