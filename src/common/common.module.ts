import { Global, Module } from "@nestjs/common";
import { AuthGuard } from "./guards/auth.guard.js";
import { PermissionGuard } from "./guards/permission.guard.js";
import { AuditService } from "./services/audit.service.js";

@Global()
@Module({
  providers: [AuthGuard, PermissionGuard, AuditService],
  exports: [AuthGuard, PermissionGuard, AuditService]
})
export class CommonModule {}
