# Etapa 1: Construcción de la aplicación Angular
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci && npm cache clean --force
COPY . .
RUN npm run build -- --configuration=production

# Etapa 2: Servidor Nginx
FROM nginx:alpine

COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=builder /app/dist/remindme/browser /usr/share/nginx/html

EXPOSE 8080

RUN mkdir -p /usr/share/nginx/html/assets /docker-entrypoint.d

# Copiar script de inyección de variables
COPY inject-env.sh /docker-entrypoint.d/40-inject-env.sh
RUN chmod +x /docker-entrypoint.d/40-inject-env.sh

CMD ["nginx", "-g", "daemon off;"]