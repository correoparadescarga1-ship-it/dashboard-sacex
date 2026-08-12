import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";
@Injectable()
export class DashboardService {
 constructor(private prisma:PrismaService){}
 async summary(){
  const [users, pendingUsers, clients, requests, pendingChanges, approvedRequests] = await Promise.all([
   this.prisma.user.count(), this.prisma.user.count({where:{status:"PENDING"}}),
   this.prisma.client.count(), this.prisma.request.count(),
   this.prisma.statusChangeRequest.count({where:{status:"PENDING"}}),
   this.prisma.request.count({where:{status:"APROBADO"}})
  ]);
  const recent = await this.prisma.auditLog.findMany({take:8,orderBy:{createdAt:"desc"},include:{actor:true}});
  return {users,pendingUsers,clients,requests,pendingChanges,approvedRequests,recent};
 }
}
