import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Daily Ecosystem Details API OpenAPI Documentation')
    .setDescription('Daily Ecosystem Details API description')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('apidocs', app, document);

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
