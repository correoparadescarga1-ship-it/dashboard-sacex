import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";
@Injectable()
export class ClientsService {
 constructor(private prisma:PrismaService){}
 list(){return this.prisma.client.findMany({orderBy:{createdAt:"desc"}});}
 create(body:any){return this.prisma.client.create({data:{code:body.code,name:body.name,document:body.document,email:body.email,phone:body.phone,city:body.city,status:body.status||"ACTIVO"}});}
}
