import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service.js";
import { AuditAction, Prisma } from "../../generated/prisma/client.js";

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}
  async log(input: {
    actorUserId?: string; action: AuditAction; entity: string; entityId?: string;
    oldValue?: unknown; newValue?: unknown; ipAddress?: string; userAgent?: string;
  }) {
    return this.prisma.auditLog.create({
      data: {
        actorUserId: input.actorUserId,
        action: input.action,
        entity: input.entity,
        entityId: input.entityId,
        oldValue: input.oldValue as Prisma.InputJsonValue | undefined,
        newValue: input.newValue as Prisma.InputJsonValue | undefined,
        ipAddress: input.ipAddress,
        userAgent: input.userAgent
      }
    });
  }
}
