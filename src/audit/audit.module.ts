import { Module } from "@nestjs/common";
import { AuditController } from "./audit.controller.js";
import { AuditQueryService } from "./audit.service.js";
@Module({controllers:[AuditController],providers:[AuditQueryService]})
export class AuditModule {}
