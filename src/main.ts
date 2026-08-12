import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { ConfigService } from "@nestjs/config";
import { ValidationPipe } from "@nestjs/common";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { AppModule } from "./app.module.js";
import { join } from "node:path";
import { NestExpressApplication } from "@nestjs/platform-express";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = app.get(ConfigService);

  app.use(helmet({
    contentSecurityPolicy: false
  }));
  app.use(cookieParser());
  app.enableCors({
    origin: config.get<string>("CORS_ORIGIN", "http://localhost:3000"),
    credentials: true
  });
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true
  }));
  app.useStaticAssets(join(process.cwd(), "public"));

  await app.listen(config.get<number>("PORT", 3000), "0.0.0.0");
}
bootstrap();
