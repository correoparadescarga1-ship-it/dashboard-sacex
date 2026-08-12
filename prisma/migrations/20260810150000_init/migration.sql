CREATE TYPE "UserStatus" AS ENUM ('PENDING','ACTIVE','REJECTED','SUSPENDED');
CREATE TYPE "AuditAction" AS ENUM ('LOGIN','LOGOUT','REGISTER','APPROVE_USER','REJECT_USER','SUSPEND_USER','CREATE','UPDATE','DELETE','STATUS_REQUEST','STATUS_APPROVE','STATUS_REJECT','ROLE_ASSIGN');
CREATE TYPE "StatusRequestStatus" AS ENUM ('PENDING','APPROVED','REJECTED');

CREATE TABLE "User" (
 "id" TEXT NOT NULL, "email" TEXT NOT NULL, "passwordHash" TEXT NOT NULL, "fullName" TEXT NOT NULL,
 "phone" TEXT, "status" "UserStatus" NOT NULL DEFAULT 'PENDING', "active" BOOLEAN NOT NULL DEFAULT true,
 "lastLoginAt" TIMESTAMP(3), "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

CREATE TABLE "Role" ("id" TEXT NOT NULL,"name" TEXT NOT NULL,"description" TEXT,"active" BOOLEAN NOT NULL DEFAULT true,CONSTRAINT "Role_pkey" PRIMARY KEY ("id"));
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");
CREATE TABLE "UserRole" ("userId" TEXT NOT NULL,"roleId" TEXT NOT NULL,CONSTRAINT "UserRole_pkey" PRIMARY KEY ("userId","roleId"));
CREATE TABLE "Permission" ("id" TEXT NOT NULL,"code" TEXT NOT NULL,"name" TEXT NOT NULL,"description" TEXT,CONSTRAINT "Permission_pkey" PRIMARY KEY ("id"));
CREATE UNIQUE INDEX "Permission_code_key" ON "Permission"("code");
CREATE TABLE "RolePermission" ("roleId" TEXT NOT NULL,"permissionId" TEXT NOT NULL,CONSTRAINT "RolePermission_pkey" PRIMARY KEY ("roleId","permissionId"));
CREATE TABLE "Page" ("id" TEXT NOT NULL,"name" TEXT NOT NULL,"route" TEXT NOT NULL,"icon" TEXT,"menuGroup" TEXT NOT NULL DEFAULT 'Principal',"menuOrder" INTEGER NOT NULL DEFAULT 0,"active" BOOLEAN NOT NULL DEFAULT true,CONSTRAINT "Page_pkey" PRIMARY KEY ("id"));
CREATE UNIQUE INDEX "Page_route_key" ON "Page"("route");
CREATE TABLE "RolePage" ("roleId" TEXT NOT NULL,"pageId" TEXT NOT NULL,CONSTRAINT "RolePage_pkey" PRIMARY KEY ("roleId","pageId"));
CREATE TABLE "Client" ("id" TEXT NOT NULL,"code" TEXT NOT NULL,"name" TEXT NOT NULL,"document" TEXT,"email" TEXT,"phone" TEXT,"city" TEXT,"status" TEXT NOT NULL DEFAULT 'ACTIVO',"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,"updatedAt" TIMESTAMP(3) NOT NULL,CONSTRAINT "Client_pkey" PRIMARY KEY ("id"));
CREATE UNIQUE INDEX "Client_code_key" ON "Client"("code");
CREATE TABLE "Request" ("id" TEXT NOT NULL,"code" TEXT NOT NULL,"title" TEXT NOT NULL,"description" TEXT,"status" TEXT NOT NULL DEFAULT 'PENDIENTE',"priority" TEXT NOT NULL DEFAULT 'MEDIA',"clientId" TEXT,"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,"updatedAt" TIMESTAMP(3) NOT NULL,CONSTRAINT "Request_pkey" PRIMARY KEY ("id"));
CREATE UNIQUE INDEX "Request_code_key" ON "Request"("code");
CREATE TABLE "StatusChangeRequest" ("id" TEXT NOT NULL,"requestId" TEXT NOT NULL,"requestedById" TEXT NOT NULL,"approvedById" TEXT,"fromStatus" TEXT NOT NULL,"toStatus" TEXT NOT NULL,"reason" TEXT NOT NULL,"status" "StatusRequestStatus" NOT NULL DEFAULT 'PENDING',"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,"resolvedAt" TIMESTAMP(3),CONSTRAINT "StatusChangeRequest_pkey" PRIMARY KEY ("id"));
CREATE INDEX "StatusChangeRequest_status_idx" ON "StatusChangeRequest"("status");
CREATE TABLE "AuditLog" ("id" TEXT NOT NULL,"actorUserId" TEXT,"action" "AuditAction" NOT NULL,"entity" TEXT NOT NULL,"entityId" TEXT,"oldValue" JSONB,"newValue" JSONB,"ipAddress" TEXT,"userAgent" TEXT,"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id"));
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");
CREATE INDEX "AuditLog_actorUserId_idx" ON "AuditLog"("actorUserId");
CREATE INDEX "AuditLog_entity_entityId_idx" ON "AuditLog"("entity","entityId");
CREATE TABLE "RefreshSession" ("id" TEXT NOT NULL,"userId" TEXT NOT NULL,"tokenHash" TEXT NOT NULL,"expiresAt" TIMESTAMP(3) NOT NULL,"revokedAt" TIMESTAMP(3),"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,CONSTRAINT "RefreshSession_pkey" PRIMARY KEY ("id"));
CREATE UNIQUE INDEX "RefreshSession_tokenHash_key" ON "RefreshSession"("tokenHash");
CREATE INDEX "RefreshSession_userId_idx" ON "RefreshSession"("userId");

ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RolePage" ADD CONSTRAINT "RolePage_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RolePage" ADD CONSTRAINT "RolePage_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "Page"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Request" ADD CONSTRAINT "Request_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "StatusChangeRequest" ADD CONSTRAINT "StatusChangeRequest_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "Request"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StatusChangeRequest" ADD CONSTRAINT "StatusChangeRequest_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE CASCADE;
ALTER TABLE "StatusChangeRequest" ADD CONSTRAINT "StatusChangeRequest_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE CASCADE;
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "RefreshSession" ADD CONSTRAINT "RefreshSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
