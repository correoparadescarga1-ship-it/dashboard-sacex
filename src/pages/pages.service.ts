import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";
@Injectable()
export class PagesService {
 constructor(private prisma:PrismaService){}
 list(){return this.prisma.page.findMany({include:{roles:{include:{role:true}}},orderBy:{menuOrder:"asc"}});}
 create(body:any){return this.prisma.page.create({data:{name:body.name,route:body.route,icon:body.icon,menuGroup:body.menuGroup||"Principal",menuOrder:Number(body.menuOrder||0)}});}
}
