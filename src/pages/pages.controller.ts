import { Controller, Get, Post, Body, UseGuards } from "@nestjs/common";
import { PagesService } from "./pages.service.js";
import { AuthGuard } from "../common/guards/auth.guard.js";
import { PermissionGuard } from "../common/guards/permission.guard.js";
import { Permission } from "../common/decorators/auth.decorator.js";

@Controller("api/paginas")
@UseGuards(AuthGuard, PermissionGuard)
export class PagesController {
 constructor(private service:PagesService){}
 @Get() @Permission("PAGINAS_VER") list(){return this.service.list();}
 @Post() @Permission("PAGINAS_ADMINISTRAR") create(@Body() body:any){return this.service.create(body);}
}
