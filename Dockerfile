# Etapa 1: Construcción de la aplicación Angular
FROM node:20-alpine AS builder

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de configuración de dependencias
COPY package*.json ./

# Instalar todas las dependencias (incluyendo devDependencies para el build)
RUN npm ci && npm cache clean --force

# Copiar el resto de la aplicación
COPY . .

# Construir la aplicación para producción
RUN npm run build -- --configuration=production

# Etapa 2: Servidor Nginx para servir la aplicación
FROM nginx:alpine

# Copiar configuración personalizada de nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Copiar los archivos construidos desde la etapa de build
COPY --from=builder /app/dist/remindme/browser /usr/share/nginx/html

# Exponer el puerto 8080 (requerido por Cloud Run)
EXPOSE 8080

# Crear directorio assets
RUN mkdir -p /usr/share/nginx/html/assets

# Crear script de inicio para inyectar variables de entorno
COPY <<'EOF' /docker-entrypoint.d/40-inject-env.sh
#!/bin/sh
set -e
cat > /usr/share/nginx/html/assets/env.js <<ENVJS
window.ENV = {
  SUPABASE_URL: "${SUPABASE_URL}",
  SUPABASE_KEY: "${SUPABASE_KEY}"
};
ENVJS
echo "Variables de entorno inyectadas correctamente"
EOF

RUN chmod +x /docker-entrypoint.d/40-inject-env.sh

# Iniciar nginx
CMD ["nginx", "-g", "daemon off;"]