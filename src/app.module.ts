import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ThrottlerModule } from "@nestjs/throttler";
import { PrismaModule } from "./prisma/prisma.module.js";
import { AuthModule } from "./auth/auth.module.js";
import { UsersModule } from "./users/users.module.js";
import { RolesModule } from "./roles/roles.module.js";
import { PagesModule } from "./pages/pages.module.js";
import { DashboardModule } from "./dashboard/dashboard.module.js";
import { ClientsModule } from "./clients/clients.module.js";
import { RequestsModule } from "./requests/requests.module.js";
import { AuditModule } from "./audit/audit.module.js";
import { RealtimeModule } from "./realtime/realtime.module.js";
import { CommonModule } from "./common/common.module.js";
import { AppController } from "./app.controller.js";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 120 }]),
    PrismaModule, CommonModule, AuthModule, UsersModule, RolesModule,
    PagesModule, DashboardModule, ClientsModule, RequestsModule,
    AuditModule, RealtimeModule
  ],
  controllers: [AppController]
})
export class AppModule {}
