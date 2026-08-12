import { Controller, Get, Post, Body, UseGuards } from "@nestjs/common";
import { ClientsService } from "./clients.service.js";
import { AuthGuard } from "../common/guards/auth.guard.js";
import { PermissionGuard } from "../common/guards/permission.guard.js";
import { Permission } from "../common/decorators/auth.decorator.js";
@Controller("api/clientes")
@UseGuards(AuthGuard,PermissionGuard)
export class ClientsController {
 constructor(private service:ClientsService){}
 @Get() @Permission("CLIENTES_VER") list(){return this.service.list();}
 @Post() @Permission("CLIENTES_CREAR") create(@Body() body:any){return this.service.create(body);}
}
