import { Controller, Get, UseGuards } from "@nestjs/common";
import { DashboardService } from "./dashboard.service.js";
import { AuthGuard } from "../common/guards/auth.guard.js";
@Controller("api/dashboard")
@UseGuards(AuthGuard)
export class DashboardController {
 constructor(private service:DashboardService){}
 @Get("resumen") summary(){return this.service.summary();}
}
