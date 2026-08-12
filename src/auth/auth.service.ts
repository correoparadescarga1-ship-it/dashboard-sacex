import { ConflictException, Injectable, UnauthorizedException, ForbiddenException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../prisma/prisma.service.js";
import { AuditService } from "../common/services/audit.service.js";
import argon2 from "argon2";
import { SignJWT, jwtVerify } from "jose";
import { createHash, randomBytes } from "node:crypto";

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private config: ConfigService, private audit: AuditService) {}

  private secret(name: string) {
    const value = this.config.get<string>(name);
    if (!value || value.length < 32) throw new Error(`${name} debe tener al menos 32 caracteres`);
    return new TextEncoder().encode(value);
  }

  private async accessToken(user: any) {
    const roles = user.roles.map((r: any) => r.role.name);
    return new SignJWT({ email: user.email, status: user.status, roles })
      .setProtectedHeader({ alg: "HS256" }).setSubject(user.id)
      .setIssuedAt().setExpirationTime(this.config.get("JWT_ACCESS_EXPIRES", "15m"))
      .sign(this.secret("JWT_ACCESS_SECRET"));
  }

  private async refreshToken(userId: string) {
    const raw = randomBytes(48).toString("base64url");
    const tokenHash = createHash("sha256").update(raw).digest("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await this.prisma.refreshSession.create({ data: { userId, tokenHash, expiresAt } });
    const jwt = await new SignJWT({ type: "refresh", sid: tokenHash })
      .setProtectedHeader({ alg: "HS256" }).setSubject(userId).setIssuedAt()
      .setExpirationTime(this.config.get("JWT_REFRESH_EXPIRES", "7d"))
      .sign(this.secret("JWT_REFRESH_SECRET"));
    return jwt;
  }

  private async getUser(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      include: { roles: { include: { role: true } } }
    });
  }

  async login(emailRaw: string, password: string, ip?: string, ua?: string) {
    const email = emailRaw.trim().toLowerCase();
    const user = await this.getUser(email);
    if (!user || !(await argon2.verify(user.passwordHash, password)))
      throw new UnauthorizedException("Correo o contraseña incorrectos.");
    if (user.status === "PENDING") throw new ForbiddenException("Su cuenta está pendiente de aprobación administrativa.");
    if (user.status === "REJECTED") throw new ForbiddenException("Su registro fue rechazado.");
    if (user.status === "SUSPENDED" || !user.active) throw new ForbiddenException("Su cuenta está suspendida.");
    const access = await this.accessToken(user);
    const refresh = await this.refreshToken(user.id);
    await this.prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
    await this.audit.log({ actorUserId: user.id, action: "LOGIN", entity: "User", entityId: user.id, ipAddress: ip, userAgent: ua });
    return { access, refresh, user: this.publicUser(user) };
  }

  async register(dto: any) {
    const email = dto.email.trim().toLowerCase();
    if (await this.prisma.user.findUnique({ where: { email } }))
      throw new ConflictException("El correo ya está registrado.");
    const passwordHash = await argon2.hash(dto.password);
    const user = await this.prisma.user.create({
      data: { email, fullName: dto.fullName.trim(), phone: dto.phone, passwordHash, status: "PENDING" },
      select: { id: true, email: true, fullName: true, status: true, createdAt: true }
    });
    await this.audit.log({ actorUserId: user.id, action: "REGISTER", entity: "User", entityId: user.id });
    return { mensaje: "Registro recibido. Su cuenta queda pendiente de autorización.", usuario: user };
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId }, include: { roles: { include: { role: true } } }
    });
    if (!user || user.status !== "ACTIVE") throw new UnauthorizedException("Cuenta no disponible.");
    const pages = await this.prisma.rolePage.findMany({
      where: { role: { users: { some: { userId } } }, page: { active: true } },
      include: { page: true }, orderBy: { page: { menuOrder: "asc" } }
    });
    const permissions = await this.prisma.rolePermission.findMany({
      where: { role: { users: { some: { userId } } } }, include: { permission: true }
    });
    return { user: this.publicUser(user), pages: pages.map(x => x.page), permissions: [...new Set(permissions.map(x => x.permission.code))] };
  }

  async refresh(token: string) {
    try {
      const { payload } = await jwtVerify(token, this.secret("JWT_REFRESH_SECRET"));
      const sid = String(payload.sid ?? "");
      const session = await this.prisma.refreshSession.findUnique({ where: { tokenHash: sid }, include: { user: { include: { roles: { include: { role: true } } } } } });
      if (!session || session.revokedAt || session.expiresAt < new Date()) throw new Error();
      await this.prisma.refreshSession.update({ where: { id: session.id }, data: { revokedAt: new Date() } });
      return { access: await this.accessToken(session.user), refresh: await this.refreshToken(session.userId) };
    } catch { throw new UnauthorizedException("Sesión de renovación no válida."); }
  }

  async logout(refresh?: string) {
    if (refresh) {
      try {
        const { payload } = await jwtVerify(refresh, this.secret("JWT_REFRESH_SECRET"));
        const sid = String(payload.sid ?? "");
        await this.prisma.refreshSession.updateMany({ where: { tokenHash: sid }, data: { revokedAt: new Date() } });
      } catch {}
    }
  }

  publicUser(user: any) {
    return {
      id: user.id, email: user.email, fullName: user.fullName, phone: user.phone,
      status: user.status, active: user.active, lastLoginAt: user.lastLoginAt,
      roles: user.roles?.map((x: any) => x.role.name) ?? []
    };
  }
}
