import { WebSocketGateway, WebSocketServer, OnGatewayConnection } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { jwtVerify } from "jose";
@WebSocketGateway({cors:{origin:process.env.CORS_ORIGIN||"http://localhost:3000",credentials:true}})
export class RealtimeGateway implements OnGatewayConnection {
 @WebSocketServer() server!:Server;
 async handleConnection(socket:Socket){
  try{
   const cookie=socket.handshake.headers.cookie||"";
   const match=cookie.match(/(?:^|;\\s*)access_token=([^;]+)/);
   if(!match) return socket.disconnect();
   await jwtVerify(decodeURIComponent(match[1]),new TextEncoder().encode(process.env.JWT_ACCESS_SECRET));
  }catch{ socket.disconnect(); }
 }
 broadcast(event:string,data:any){this.server.emit(event,data);}
}
