import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { ConfigService } from "@nestjs/config";
import { winstonConfig } from "./common/customs/config/winston.config";
import * as winston from "winston";
import * as morgan from "morgan";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get<number>("SERVER_PORT") || 3000;
  const logger = winston.createLogger(winstonConfig);

  const config = new DocumentBuilder()
    .setTitle("북팡")
    .setDescription("project : 북팡 구매 서비스")
    .setVersion("1.0")
    .addServer("api/v1")
    .addBearerAuth({ type: "http", scheme: "bearer", bearerFormat: "JWT" })
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, document, {
    swaggerOptions: {
      persistAuthorization: true, // 새로고침 시에도 JWT 유지하기
      tagsSorter: "alpha", // API 그룹 정렬을 알파벳 순으로
      operationsSorter: "alpha", // API 그룹 내 정렬을 알파벳 순으로
    },
  });

  app.use(
    morgan("combined", {
      stream: {
        write: (message) => logger.info(message.trim()), // 로그를 winston을 통해 기록
      },
    }),
  );
  app.setGlobalPrefix("api/v1");
  app.enableCors({
    origin: "*", // 모든 도메인에서의 요청을 허용
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    allowedHeaders: ["Content-Type", "Authorization"], // 허용할 헤더
    credentials: true, // 쿠키와 같은 인증 정보를 허용할지 여부
  });
  try {
    await app.listen(port);
    console.log(`Server is running on: ${port}, Great to see you! 😊`);
  } catch (error) {
    console.error(error);
  }
}
bootstrap();
