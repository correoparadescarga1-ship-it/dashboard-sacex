import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";
@Injectable()
export class AuditQueryService {
 constructor(private prisma:PrismaService){}
 list(){return this.prisma.auditLog.findMany({take:300,orderBy:{createdAt:"desc"},include:{actor:true}});}
}
