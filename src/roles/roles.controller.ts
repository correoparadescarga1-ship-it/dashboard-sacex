import { Controller, Get, Post, Body, UseGuards } from "@nestjs/common";
import { RolesService } from "./roles.service.js";
import { AuthGuard } from "../common/guards/auth.guard.js";
import { PermissionGuard } from "../common/guards/permission.guard.js";
import { Permission } from "../common/decorators/auth.decorator.js";

@Controller("api/roles")
@UseGuards(AuthGuard, PermissionGuard)
export class RolesController {
  constructor(private service: RolesService) {}
  @Get() @Permission("ROLES_VER") list(){ return this.service.list(); }
  @Get("permisos") @Permission("ROLES_VER") permissions(){ return this.service.permissions(); }
  @Post() @Permission("ROLES_ADMINISTRAR") create(@Body() body:any){ return this.service.create(body); }
  @Post(":id/permisos") @Permission("ROLES_ADMINISTRAR") setPermissions(@Body() body:any){ return this.service.setPermissions(body.roleId, body.permissionIds); }
  @Post(":id/paginas") @Permission("PAGINAS_ADMINISTRAR") setPages(@Body() body:any){ return this.service.setPages(body.roleId, body.pageIds); }
}
