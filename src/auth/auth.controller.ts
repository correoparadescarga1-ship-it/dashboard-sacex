import { Body, Controller, Get, Post, Req, Res, UseGuards } from "@nestjs/common";
import type { Request, Response } from "express";
import { AuthService } from "./auth.service.js";
import { LoginDto, RegisterDto } from "./auth.dto.js";
import { AuthGuard } from "../common/guards/auth.guard.js";

@Controller("api/auth")
export class AuthController {
  constructor(private auth: AuthService) {}

  private cookieOptions() {
    return { httpOnly: true, secure: process.env.COOKIE_SECURE === "true", sameSite: "lax" as const, path: "/" };
  }

  @Post("login")
  async login(@Body() dto: LoginDto, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const result = await this.auth.login(dto.email, dto.password, req.ip, req.headers["user-agent"]);
    res.cookie("access_token", result.access, { ...this.cookieOptions(), maxAge: 15 * 60 * 1000 });
    res.cookie("refresh_token", result.refresh, { ...this.cookieOptions(), maxAge: 7 * 24 * 60 * 60 * 1000 });
    const csrf = req.cookies?.csrf_token ?? crypto.randomUUID();
    res.cookie("csrf_token", csrf, { httpOnly: false, secure: process.env.COOKIE_SECURE === "true", sameSite: "lax", path: "/" });
    return { user: result.user };
  }

  @Post("registro")
  async register(@Body() dto: RegisterDto) { return this.auth.register(dto); }

  @Post("refresh")
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const result = await this.auth.refresh(req.cookies?.refresh_token);
    res.cookie("access_token", result.access, { ...this.cookieOptions(), maxAge: 15 * 60 * 1000 });
    res.cookie("refresh_token", result.refresh, { ...this.cookieOptions(), maxAge: 7 * 24 * 60 * 60 * 1000 });
    return { ok: true };
  }

  @Post("logout")
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    await this.auth.logout(req.cookies?.refresh_token);
    res.clearCookie("access_token", this.cookieOptions());
    res.clearCookie("refresh_token", this.cookieOptions());
    return { ok: true };
  }

  @Get("me")
  @UseGuards(AuthGuard)
  async me(@Req() req: Request & { user: { id: string } }) { return this.auth.me(req.user.id); }
}
