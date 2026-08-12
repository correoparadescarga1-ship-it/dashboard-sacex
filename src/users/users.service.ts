import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";
import { AuditService } from "../common/services/audit.service.js";

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService, private audit: AuditService) {}

  list() {
    return this.prisma.user.findMany({
      select: { id:true,email:true,fullName:true,phone:true,status:true,active:true,lastLoginAt:true,createdAt:true,roles:{include:{role:true}} },
      orderBy: { createdAt: "desc" }
    });
  }

  async setStatus(id: string, status: any, actor: string, action: any) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException("Usuario no encontrado.");
    const updated = await this.prisma.user.update({ where: { id }, data: { status, active: status === "ACTIVE" } });
    await this.audit.log({ actorUserId: actor, action, entity:"User", entityId:id, oldValue:{status:user.status}, newValue:{status:updated.status} });
    return updated;
  }
  approve(id:string,a:string){ return this.setStatus(id,"ACTIVE",a,"APPROVE_USER"); }
  reject(id:string,a:string){ return this.setStatus(id,"REJECTED",a,"REJECT_USER"); }
  suspend(id:string,a:string){ return this.setStatus(id,"SUSPENDED",a,"SUSPEND_USER"); }
  activate(id:string,a:string){ return this.setStatus(id,"ACTIVE",a,"APPROVE_USER"); }
}
