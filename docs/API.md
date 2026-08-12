# API principal

## Público
- POST `/api/auth/login`
- POST `/api/auth/registro`
- POST `/api/auth/refresh`
- POST `/api/auth/logout`

## Autenticado
- GET `/api/auth/me`
- GET `/api/dashboard/resumen`
- GET `/api/usuarios`
- PATCH `/api/usuarios/:id/aprobar`
- PATCH `/api/usuarios/:id/rechazar`
- PATCH `/api/usuarios/:id/suspender`
- GET `/api/roles`
- GET `/api/roles/permisos`
- POST `/api/roles`
- GET `/api/paginas`
- POST `/api/paginas`
- GET `/api/clientes`
- POST `/api/clientes`
- GET `/api/solicitudes`
- POST `/api/solicitudes`
- POST `/api/solicitudes/:id/cambio-estado`
- GET `/api/solicitudes/autorizaciones`
- POST `/api/solicitudes/autorizaciones/:id/aprobar`
- POST `/api/solicitudes/autorizaciones/:id/rechazar`
- GET `/api/auditoria`

Las operaciones mutables requieren la cookie CSRF y el header `X-CSRF-Token`.
