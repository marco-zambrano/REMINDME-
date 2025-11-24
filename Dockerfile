# Etapa 1: Construcción de la aplicación Angular
FROM node:20-alpine AS builder

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de configuración de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm ci --only=production && npm cache clean --force

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

# Crear directorio assets y script de inicio
RUN mkdir -p /usr/share/nginx/html/assets /docker-entrypoint.d

# Crear script de inicio para inyectar variables de entorno
RUN echo '#!/bin/sh' > /docker-entrypoint.d/40-inject-env.sh && \
    echo 'set -e' >> /docker-entrypoint.d/40-inject-env.sh && \
    echo 'cat > /usr/share/nginx/html/assets/env.js <<ENVJS' >> /docker-entrypoint.d/40-inject-env.sh && \
    echo 'window.ENV = {' >> /docker-entrypoint.d/40-inject-env.sh && \
    echo '  SUPABASE_URL: '"'"'${SUPABASE_URL}'"'"',' >> /docker-entrypoint.d/40-inject-env.sh && \
    echo '  SUPABASE_KEY: '"'"'${SUPABASE_KEY}'"'"'' >> /docker-entrypoint.d/40-inject-env.sh && \
    echo '};' >> /docker-entrypoint.d/40-inject-env.sh && \
    echo 'ENVJS' >> /docker-entrypoint.d/40-inject-env.sh && \
    echo 'echo "Variables de entorno inyectadas correctamente"' >> /docker-entrypoint.d/40-inject-env.sh && \
    chmod +x /docker-entrypoint.d/40-inject-env.sh

# Iniciar nginx
CMD ["nginx", "-g", "daemon off;"]
