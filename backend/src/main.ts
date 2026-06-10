import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { ensureDatabaseExists } from './db-init';

async function bootstrap() {
  // Load environment variables
  dotenv.config();

  // Verify and auto-create target database if needed
  await ensureDatabaseExists();

  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend API calls
  app.enableCors({
    origin: '*',
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`NestJS Backend is running on: http://localhost:${port}`);
}
bootstrap();
