import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { PERMISSION_KEY } from "../decorators/auth.decorator.js";
import { PrismaService } from "../../prisma/prisma.service.js";
import type { AuthUser } from "./auth.guard.js";

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private reflector: Reflector, private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext) {
    const permission = this.reflector.getAllAndOverride<string>(PERMISSION_KEY, [
      context.getHandler(), context.getClass()
    ]);
    if (!permission) return true;
    const req = context.switchToHttp().getRequest<{ user: AuthUser }>();
    const found = await this.prisma.rolePermission.findFirst({
      where: { role: { users: { some: { userId: req.user.id } } }, permission: { code: permission } }
    });
    if (!found) throw new ForbiddenException("No tiene permiso para realizar esta operación.");
    return true;
  }
}
