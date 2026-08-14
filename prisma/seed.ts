import "dotenv/config";
import argon2 from "argon2";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.js";
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const perms = [
 ["USUARIOS_VER","Ver usuarios"],["USUARIOS_APROBAR","Aprobar usuarios"],["USUARIOS_RECHAZAR","Rechazar usuarios"],["USUARIOS_SUSPENDER","Suspender usuarios"],
 ["ROLES_VER","Ver roles"],["ROLES_ADMINISTRAR","Administrar roles"],["PAGINAS_VER","Ver páginas"],["PAGINAS_ADMINISTRAR","Administrar páginas"],
 ["AUDITORIA_VER","Ver auditoría"],["CLIENTES_VER","Ver clientes"],["CLIENTES_CREAR","Crear clientes"],["SOLICITUDES_VER","Ver solicitudes"],
 ["SOLICITUDES_CREAR","Crear solicitudes"],["CAMBIOS_SOLICITAR","Solicitar cambios de estado"],["CAMBIOS_VER","Ver autorizaciones"],["CAMBIOS_AUTORIZAR","Autorizar cambios de estado"]
] as const;

const pages = [
 ["Dashboard","/","icon-dashboard","Principal",1],["Usuarios","/usuarios","icon-man","Administración",10],["Roles y permisos","/roles","icon-lock","Administración",20],
 ["Páginas","/paginas","icon-layout","Administración",30],["Clientes","/clientes","icon-person","Gestión",40],["Solicitudes","/solicitudes","icon-task","Gestión",50],
 ["Autorizaciones","/autorizaciones","icon-ok","Administración",60],["Auditoría","/auditoria","icon-search","Administración",70]
] as const;

async function role(name:string,description:string){return prisma.role.upsert({where:{name},update:{},create:{name,description}});}
async function user(email:string,password:string,name:string,status:any,roleId:string){
 const passwordHash=await argon2.hash(password);
 const u=await prisma.user.upsert({where:{email},update:{passwordHash,status,active:status==="ACTIVE",fullName:name},create:{email,passwordHash,fullName:name,status,active:status==="ACTIVE"}});
 await prisma.userRole.upsert({where:{userId_roleId:{userId:u.id,roleId}},update:{},create:{userId:u.id,roleId}});
 return u;
}
async function main(){
 const admin=await role("ADMINISTRADOR","Control total del sistema");
 const usuario=await role("USUARIO","Usuario operativo");
 const cliente=await role("CLIENTE","Acceso limitado a clientes");

 for(const [code,name] of perms) await prisma.permission.upsert({where:{code},update:{name},create:{code,name}});
 for(const [name,route,icon,menuGroup,menuOrder] of pages) await prisma.page.upsert({where:{route},update:{name,icon,menuGroup,menuOrder},create:{name,route,icon,menuGroup,menuOrder}});

 const allPerms=await prisma.permission.findMany();
 const allPages=await prisma.page.findMany();
 for(const p of allPerms) await prisma.rolePermission.upsert({where:{roleId_permissionId:{roleId:admin.id,permissionId:p.id}},update:{},create:{roleId:admin.id,permissionId:p.id}});
 for(const p of allPages) await prisma.rolePage.upsert({where:{roleId_pageId:{roleId:admin.id,pageId:p.id}},update:{},create:{roleId:admin.id,pageId:p.id}});

 const userPermCodes=["USUARIOS_VER","CLIENTES_VER","CLIENTES_CREAR","SOLICITUDES_VER","SOLICITUDES_CREAR","CAMBIOS_SOLICITAR"];
 for(const code of userPermCodes){const p=allPerms.find(x=>x.code===code)!; await prisma.rolePermission.upsert({where:{roleId_permissionId:{roleId:usuario.id,permissionId:p.id}},update:{},create:{roleId:usuario.id,permissionId:p.id}});}
 for(const route of ["/","/clientes","/solicitudes"]){const p=allPages.find(x=>x.route===route)!; await prisma.rolePage.upsert({where:{roleId_pageId:{roleId:usuario.id,pageId:p.id}},update:{},create:{roleId:usuario.id,pageId:p.id}});}
 for(const code of ["CLIENTES_VER","SOLICITUDES_VER"]){const p=allPerms.find(x=>x.code===code)!; await prisma.rolePermission.upsert({where:{roleId_permissionId:{roleId:cliente.id,permissionId:p.id}},update:{},create:{roleId:cliente.id,permissionId:p.id}});}
 for(const route of ["/","/clientes","/solicitudes"]){const p=allPages.find(x=>x.route===route)!; await prisma.rolePage.upsert({where:{roleId_pageId:{roleId:cliente.id,pageId:p.id}},update:{},create:{roleId:cliente.id,pageId:p.id}});}

 await user(process.env.SEED_ADMIN_EMAIL||"admin@demo.local",process.env.SEED_ADMIN_PASSWORD||"Admin123!Cambiar","Administrador Demo","ACTIVE",admin.id);
 await user("usuario@demo.local",process.env.SEED_USER_PASSWORD||"Usuario123!Cambiar","María Usuario","ACTIVE",usuario.id);
 await user("cliente@demo.local",process.env.SEED_CLIENT_PASSWORD||"Cliente123!Cambiar","Carlos Cliente","ACTIVE",cliente.id);
 await user("pendiente@demo.local",process.env.SEED_PENDING_PASSWORD||"Pendiente123!Cambiar","Pedro Pendiente","PENDING",usuario.id);

 const c1=await prisma.client.upsert({where:{code:"CLI-001"},update:{},create:{code:"CLI-001",name:"Comercial del Caribe S.A.S.",document:"900123456",email:"contacto@comercialcaribe.demo",phone:"3005550101",city:"Barranquilla"}});
 const c2=await prisma.client.upsert({where:{code:"CLI-002"},update:{},create:{code:"CLI-002",name:"Servicios Atlántico Ltda.",document:"901987654",email:"info@serviciosatlantico.demo",phone:"3015550102",city:"Barranquilla"}});
 const r1=await prisma.request.upsert({where:{code:"SOL-0001"},update:{},create:{code:"SOL-0001",title:"Actualización de información comercial",description:"Solicitud demo para probar autorizaciones.",priority:"ALTA",clientId:c1.id,status:"PENDIENTE"}});
 await prisma.request.upsert({where:{code:"SOL-0002"},update:{},create:{code:"SOL-0002",title:"Revisión documental",description:"Solicitud demo aprobada.",priority:"MEDIA",clientId:c2.id,status:"EN_REVISION"}});
 await prisma.request.upsert({where:{code:"SOL-0003"},update:{},create:{code:"SOL-0003",title:"Servicio completado",description:"Solicitud demo finalizada.",priority:"BAJA",clientId:c1.id,status:"APROBADO"}});

 const pendingUser=await prisma.user.findUnique({where:{email:"pendiente@demo.local"}});
 const adminUser=await prisma.user.findUnique({where:{email:process.env.SEED_ADMIN_EMAIL||"admin@demo.local"}});
 if(pendingUser && adminUser && !(await prisma.auditLog.findFirst({where:{entity:"Demo",entityId:"seed"}}))){
  await prisma.auditLog.create({data:{actorUserId:adminUser.id,action:"CREATE",entity:"Demo",entityId:"seed",newValue:{mensaje:"Datos demo iniciales"}}});
 }
 console.log("Seed completado.");
}
main().finally(()=>prisma.$disconnect());
