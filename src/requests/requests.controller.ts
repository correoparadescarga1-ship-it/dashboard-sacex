import { Controller, Get, Post, Body, Param, Req, UseGuards } from "@nestjs/common";
import { RequestsService } from "./requests.service.js";
import { AuthGuard } from "../common/guards/auth.guard.js";
import { PermissionGuard } from "../common/guards/permission.guard.js";
import { Permission } from "../common/decorators/auth.decorator.js";
@Controller("api/solicitudes")
@UseGuards(AuthGuard,PermissionGuard)
export class RequestsController {
 constructor(private service:RequestsService){}
 @Get() @Permission("SOLICITUDES_VER") list(){return this.service.list();}
 @Post() @Permission("SOLICITUDES_CREAR") create(@Body() body:any,@Req() req:any){return this.service.create(body,req.user.id);}
 @Post(":id/cambio-estado") @Permission("CAMBIOS_SOLICITAR") change(@Param("id") id:string,@Body() body:any,@Req() req:any){return this.service.requestStatusChange(id,body.toStatus,body.reason,req.user.id);}
 @Get("/autorizaciones") @Permission("CAMBIOS_VER") pending(){return this.service.pendingChanges();}
 @Post("/autorizaciones/:id/aprobar") @Permission("CAMBIOS_AUTORIZAR") approve(@Param("id") id:string,@Req() req:any){return this.service.approveChange(id,req.user.id);}
 @Post("/autorizaciones/:id/rechazar") @Permission("CAMBIOS_AUTORIZAR") reject(@Param("id") id:string,@Req() req:any){return this.service.rejectChange(id,req.user.id);}
}
