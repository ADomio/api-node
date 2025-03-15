import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from "@nestjs/config";
import { ValidationPipe } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );

  // Configure Swagger
  const config = new DocumentBuilder()
    .setTitle('Traffic Distribution System API')
    .setDescription('API documentation for the Traffic Distribution System')
    .setVersion('1.0')
    .addTag('campaigns', 'Campaign management endpoints')
    .addTag('streams', 'Stream management endpoints')
    .addTag('filters', 'Filter management endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = configService.get<number>('PORT');
  await app.listen(port || 3000);
  console.log("Service started on port", port)
}
bootstrap();
