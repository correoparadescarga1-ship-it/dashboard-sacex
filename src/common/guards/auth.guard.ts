import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { jwtVerify } from "jose";
import type { Request } from "express";

export interface AuthUser {
  id: string;
  email: string;
  status: string;
  roles: string[];
}

@Injectable()
export class AuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request & { user?: AuthUser }>();
    const token = req.cookies?.access_token;
    if (!token) throw new UnauthorizedException("Sesión no válida.");

    try {
      const secret = new TextEncoder().encode(process.env.JWT_ACCESS_SECRET);
      const { payload } = await jwtVerify(token, secret);
      if (!payload.sub) throw new Error();
      req.user = {
        id: String(payload.sub),
        email: String(payload.email ?? ""),
        status: String(payload.status ?? ""),
        roles: Array.isArray(payload.roles) ? payload.roles.map(String) : []
      };
      if (req.user.status !== "ACTIVE") throw new UnauthorizedException("La cuenta no está activa.");
      return true;
    } catch {
      throw new UnauthorizedException("Sesión no válida o expirada.");
    }
  }
}
