import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import morgan from 'morgan';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get<number>('SERVER_PORT') || 3000;

  const config = new DocumentBuilder()
    .setTitle('북팡')
    .setDescription('project : 북팡 구매 서비스')
    .setVersion('1.0')
    .addServer('api/v1')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' })
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
      defaultModelsExpandDepth: -1,
    },
  });

  app.use(
    morgan('combined', {
      stream: {
        write: (message) => console.log(message.trim()),
      },
    }),
  );
  app.setGlobalPrefix('api/v1');
  app.enableCors();
    
  try {
    await app.listen(port);
    console.log(`Server is running on: ${port}, Great to see you! 😊`);
  } catch (error) {
    console.error(error);
  }
}
bootstrap();