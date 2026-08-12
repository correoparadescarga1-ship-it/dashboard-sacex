# DASHBOARD EASYUI MATERIAL — v1.0

Aplicación web empresarial en español, responsive y preparada para oficina/local y despliegue web.

## Stack
- Node.js 20+
- NestJS 11
- TypeScript
- Prisma ORM 7
- PostgreSQL
- jQuery EasyUI + tema Material
- Socket.IO/WebSockets
- JWT en cookies HttpOnly
- CSRF double-submit para operaciones mutables
- Argon2 para contraseñas
- Helmet, CORS, validación y rate limiting básico
- RBAC + permisos + páginas asignables
- Auditoría
- Flujo de aprobación de usuarios
- Solicitudes de cambio de estado con aprobación administrativa

## Funcionalidades incluidas
1. Login/logout/refresh.
2. Registro público que crea cuentas PENDIENTES.
3. El administrador aprueba/rechaza/suspende usuarios.
4. Roles ADMINISTRADOR, USUARIO y CLIENTE.
5. Roles personalizados.
6. Permisos granulares.
7. Páginas asignables por rol.
8. Menú generado desde páginas autorizadas.
9. Dashboard con indicadores y actividad.
10. Gestión de usuarios.
11. Gestión de roles, permisos y páginas.
12. Clientes de ejemplo.
13. Solicitudes de ejemplo.
14. Cambio de estado protegido: se crea una solicitud y el administrador la aprueba/rechaza.
15. Auditoría.
16. Notificaciones en tiempo real por WebSocket.
17. Actualización de grids después de eventos.
18. Datos demo para probar todos los flujos.
19. Docker Compose para PostgreSQL.
20. Docker Compose para toda la aplicación.

## Seguridad
- Las contraseñas nunca se guardan en texto plano.
- Tokens JWT de acceso y renovación en cookies HttpOnly.
- Cookie CSRF separada y verificación en métodos mutables.
- El frontend no es una frontera de seguridad: los guards del backend validan usuario, estado, rol y permiso.
- Cuentas nuevas quedan PENDIENTES.
- Los cambios de estado sensibles no se ejecutan directamente por usuarios no autorizados.
- Auditoría de acciones administrativas y cambios de estado.
- Validación estricta de DTO.
- Helmet.
- CORS configurable.
- Rate limiting básico.
- No se incluyen secretos reales en el repositorio.

## Arranque rápido con Docker
1. Copie `.env.example` a `.env`.
2. Cambie las claves/secretos.
3. Ejecute:
   docker compose up --build
4. Abra:
   http://localhost:3000

## Arranque sin Docker
1. Cree PostgreSQL y la base `dashboard_app`.
2. Configure `.env`.
3. npm install
4. npx prisma generate
5. npx prisma migrate dev --name init
6. npm run prisma:seed
7. npm run start:dev
8. http://localhost:3000

## Credenciales demo
Administrador:
- correo: admin@demo.local
- contraseña: Admin123!Cambiar

Usuario aprobado:
- correo: usuario@demo.local
- contraseña: Usuario123!Cambiar

Cliente aprobado:
- correo: cliente@demo.local
- contraseña: Cliente123!Cambiar

Usuario pendiente:
- correo: pendiente@demo.local
- contraseña: Pendiente123!Cambiar

IMPORTANTE: son credenciales de demostración. Cámbielas antes de usar el sistema en producción.

## Estructura
- src/auth: autenticación
- src/users: usuarios/aprobaciones
- src/roles: roles/permisos
- src/pages: páginas y menú
- src/clients: clientes
- src/requests: solicitudes y autorización de estados
- src/audit: auditoría
- src/dashboard: indicadores
- src/realtime: WebSocket
- public: interfaz EasyUI
- prisma: modelo y seed

## Migraciones
Las migraciones de Prisma son parte del proyecto. No edite la base de datos de producción manualmente si el cambio debe quedar versionado: cree una migración y despliegue la migración.

## Producción
Use HTTPS, un secreto fuerte y único para cada JWT, una contraseña fuerte de PostgreSQL, backups, firewall, reverse proxy y variables de entorno del servidor.


## Despliegue Render

Este proyecto incluye `render.yaml`, `Dockerfile`, `.dockerignore`, `.env.example` y `docs/RENDER_DEPLOY.md`. Para desplegar, conecta el repositorio GitHub con Render y configura `DATABASE_URL` y `CORS_ORIGIN` como variables secretas del servicio.
