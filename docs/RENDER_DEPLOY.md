# Despliegue en Render

## 1. GitHub

1. Crea un repositorio vacío en tu cuenta de GitHub.
2. Sube todo el contenido de este proyecto.
3. No subas `.env` ni secretos.

## 2. Render

1. En Render selecciona **New > Blueprint**.
2. Conecta el repositorio de GitHub.
3. Render detectará `render.yaml`.
4. Define `DATABASE_URL` con la URL de PostgreSQL que hayas elegido.
5. Define `CORS_ORIGIN` con la URL HTTPS pública de la aplicación.
6. `JWT_SECRET` puede generarse automáticamente mediante `generateValue: true`.

## 3. PostgreSQL

Para pruebas puedes usar PostgreSQL administrado externamente (por ejemplo Supabase/Neon) y pegar solamente la cadena de conexión en Render.

Evita almacenar credenciales reales dentro de GitHub.

## 4. Health check

El servicio espera:

`GET /api/health`

Debe responder HTTP 200 cuando la aplicación esté lista.

## 5. WebSockets

Socket.IO funciona bajo la misma URL HTTPS del servicio. No necesitas publicar otro puerto.

## 6. Producción

Antes de usar datos reales:
- cambia todos los usuarios/contraseñas de demostración;
- usa un `JWT_SECRET` fuerte;
- limita `CORS_ORIGIN` a los dominios reales;
- configura backups de PostgreSQL;
- revisa logs y auditoría;
- activa HTTPS;
- no publiques secretos en Git.
