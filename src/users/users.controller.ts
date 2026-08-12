import { Controller, Get, Param, Patch, Body, Req, UseGuards } from "@nestjs/common";
import { UsersService } from "./users.service.js";
import { AuthGuard } from "../common/guards/auth.guard.js";
import { PermissionGuard } from "../common/guards/permission.guard.js";
import { Permission } from "../common/decorators/auth.decorator.js";

@Controller("api/usuarios")
@UseGuards(AuthGuard, PermissionGuard)
export class UsersController {
  constructor(private service: UsersService) {}

  @Get() @Permission("USUARIOS_VER")
  list() { return this.service.list(); }

  @Patch(":id/aprobar") @Permission("USUARIOS_APROBAR")
  approve(@Param("id") id: string, @Req() req: any) { return this.service.approve(id, req.user.id); }

  @Patch(":id/rechazar") @Permission("USUARIOS_RECHAZAR")
  reject(@Param("id") id: string, @Req() req: any) { return this.service.reject(id, req.user.id); }

  @Patch(":id/suspender") @Permission("USUARIOS_SUSPENDER")
  suspend(@Param("id") id: string, @Req() req: any) { return this.service.suspend(id, req.user.id); }

  @Patch(":id/activar") @Permission("USUARIOS_APROBAR")
  activate(@Param("id") id: string, @Req() req: any) { return this.service.activate(id, req.user.id); }
}
