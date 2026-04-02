import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors(); // While we're here, enabling CORS so the frontend can talk to it!
  await app.listen(process.env.PORT ?? 4000);
}
bootstrap();
