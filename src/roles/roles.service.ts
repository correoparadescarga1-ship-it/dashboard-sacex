import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";
@Injectable()
export class RolesService {
  constructor(private prisma:PrismaService){}
  list(){return this.prisma.role.findMany({include:{permissions:{include:{permission:true}},pages:{include:{page:true}},_count:{select:{users:true}}},orderBy:{name:"asc"}});}
  permissions(){return this.prisma.permission.findMany({orderBy:{name:"asc"}});}
  create(body:any){return this.prisma.role.create({data:{name:body.name,description:body.description}});}
  async setPermissions(roleId:string, permissionIds:string[]){await this.prisma.rolePermission.deleteMany({where:{roleId}}); return this.prisma.rolePermission.createMany({data:permissionIds.map(permissionId=>({roleId,permissionId})),skipDuplicates:true});}
  async setPages(roleId:string,pageIds:string[]){await this.prisma.rolePage.deleteMany({where:{roleId}}); return this.prisma.rolePage.createMany({data:pageIds.map(pageId=>({roleId,pageId})),skipDuplicates:true});}
}
