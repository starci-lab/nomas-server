import { NestFactory } from '@nestjs/core';
import { AppModule } from './app';
  
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
}
bootstrap();
