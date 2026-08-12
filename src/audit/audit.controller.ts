import { Controller, Get, UseGuards } from "@nestjs/common";
import { AuditQueryService } from "./audit.service.js";
import { AuthGuard } from "../common/guards/auth.guard.js";
import { PermissionGuard } from "../common/guards/permission.guard.js";
import { Permission } from "../common/decorators/auth.decorator.js";
@Controller("api/auditoria")
@UseGuards(AuthGuard,PermissionGuard)
export class AuditController {
 constructor(private service:AuditQueryService){}
 @Get() @Permission("AUDITORIA_VER") list(){return this.service.list();}
}
