import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";
import { AuditService } from "../common/services/audit.service.js";
@Injectable()
export class RequestsService {
 constructor(private prisma:PrismaService,private audit:AuditService){}
 list(){return this.prisma.request.findMany({include:{client:true},orderBy:{createdAt:"desc"}});}
 create(body:any,userId:string){return this.prisma.request.create({data:{code:body.code,title:body.title,description:body.description,priority:body.priority||"MEDIA",clientId:body.clientId,status:"PENDIENTE"}});}
 async requestStatusChange(requestId:string,toStatus:string,reason:string,userId:string){
  const req=await this.prisma.request.findUnique({where:{id:requestId}});
  if(!req) throw new NotFoundException("Solicitud no encontrada.");
  if(!toStatus||!reason) throw new BadRequestException("Debe indicar estado y motivo.");
  const item=await this.prisma.statusChangeRequest.create({data:{requestId,requestedById:userId,fromStatus:req.status,toStatus,reason}});
  await this.audit.log({actorUserId:userId,action:"STATUS_REQUEST",entity:"Request",entityId:requestId,oldValue:{status:req.status},newValue:{requestedStatus:toStatus,reason}});
  return item;
 }
 pendingChanges(){return this.prisma.statusChangeRequest.findMany({where:{status:"PENDING"},include:{request:true,requestedBy:true},orderBy:{createdAt:"asc"}});}
 async approveChange(id:string,userId:string){
  return this.prisma.$transaction(async tx=>{
   const change=await tx.statusChangeRequest.findUnique({where:{id},include:{request:true}});
   if(!change||change.status!=="PENDING") throw new BadRequestException("La autorización ya fue resuelta.");
   const request=await tx.request.update({where:{id:change.requestId},data:{status:change.toStatus}});
   await tx.statusChangeRequest.update({where:{id},data:{status:"APPROVED",approvedById:userId,resolvedAt:new Date()}});
   await this.audit.log({actorUserId:userId,action:"STATUS_APPROVE",entity:"Request",entityId:request.id,oldValue:{status:change.fromStatus},newValue:{status:request.status}});
   return request;
  });
 }
 async rejectChange(id:string,userId:string){
  const change=await this.prisma.statusChangeRequest.findUnique({where:{id}});
  if(!change||change.status!=="PENDING") throw new BadRequestException("La autorización ya fue resuelta.");
  await this.prisma.statusChangeRequest.update({where:{id},data:{status:"REJECTED",approvedById:userId,resolvedAt:new Date()}});
  await this.audit.log({actorUserId:userId,action:"STATUS_REJECT",entity:"Request",entityId:change.requestId,newValue:{status:"REJECTED"}});
  return {ok:true};
 }
}
