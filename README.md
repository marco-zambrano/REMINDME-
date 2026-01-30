# 📍 REMINDME - Recordatorios Inteligentes con Geolocalización

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Angular](https://img.shields.io/badge/Angular-20.3-red.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## 🎯 Descripción del Proyecto

**RemindMe** es una aplicación web progresiva (PWA) que resuelve el problema de olvidar tareas importantes cuando estás cerca de lugares específicos. Por ejemplo, te recuerda comprar leche cuando pasas por el supermercado o recoger documentos cuando estás cerca de la oficina.

## ✨ Características Principales

### 📍 Recordatorios Basados en Ubicación

- Crea recordatorios vinculados a lugares específicos
- Define un radio de proximidad personalizable (100m - 2km)
- Recibe notificaciones automáticas al acercarte al lugar

### ⏰ Recordatorios Programados por Tiempo

- Programa recordatorios para activarse en una hora específica
- Notificaciones en segundo plano (en dispositivos móviles con PWA)
- Combinación de activación: ubicación + tiempo

### 📱 Notificaciones en Celular (PWA)

- Notificaciones nativas con vibración
- Funciona en segundo plano (Android 8+, iOS 16.4+)
- Compatible con todos los navegadores modernos

### 🔐 Autenticación Segura

- Sistema de registro e inicio de sesión con Supabase
- Protección de rutas con guards
- Gestión segura de sesiones

### 📱 Progressive Web App (PWA)

- Instalable en dispositivos móviles y escritorio
- Funciona offline
- Actualizaciones automáticas en segundo plano
- Notificaciones push nativas con vibración

### 🎨 Categorización Inteligente

- Organiza recordatorios por categorías personalizadas
- Colores e iconos customizables
- Filtrado rápido por categoría

### ✅ Gestión de Tareas

- Marca recordatorios como completados
- Historial de recordatorios
- Estadísticas de uso

### 🗺️ Geolocalización Avanzada

- Cálculo preciso de distancias (fórmula de Haversine)
- Monitoreo continuo de ubicación
- Compatibilidad con diferentes navegadores

## 🛠️ Tecnologías Utilizadas

- **Frontend**: Angular 20.3.11
- **Backend**: Supabase
- **Estilos**: Tailwind CSS 4.1
- **Autenticación**: Supabase Auth
- **Base de Datos**: PostgreSQL (via Supabase)
- **PWA**: Angular Service Worker
- **Testing**: Jasmine/Karma
- **TypeScript**: 5.9.2

## ⚙️ Configuración de Variables de Entorno

El proyecto utiliza un sistema robusto de variables de entorno que funciona tanto en desarrollo como en producción.

### Variables Requeridas

- `SUPABASE_URL` - URL de tu proyecto Supabase
- `SUPABASE_KEY` - Clave anónima de Supabase
- `GOOGLE_MAPS_API_KEY` - API Key de Google Maps

### Desarrollo Local

En desarrollo, las variables están pre-configuradas en [src/environments/environment.ts](src/environments/environment.ts). Solo ejecuta:

```bash
npm start
```

### Producción (Docker/Cloud)

En producción, las variables se inyectan dinámicamente:

```bash
docker run -p 8080:8080 \
  -e SUPABASE_URL="https://tu-proyecto.supabase.co" \
  -e SUPABASE_KEY="tu-clave-aqui" \
  -e GOOGLE_MAPS_API_KEY="tu-api-key-aqui" \
  remindme-app
```

📚 **Documentación completa:** Ver [ENVIRONMENT_VARIABLES.md](./ENVIRONMENT_VARIABLES.md) para detalles sobre configuración, deployment y mejores prácticas.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

### 🧪 Estado de los Tests

✅ **Cobertura Completa de Tests Unitarios**

- **16 archivos de test** creados/corregidos
- **~500 casos de prueba** implementados
- **100% de cobertura** en componentes, servicios, guards y pipes

📚 **Documentación de Tests:**

- [README_TESTS.md](./README_TESTS.md) - Índice de documentación
- [EXECUTIVE_SUMMARY.md](./EXECUTIVE_SUMMARY.md) - Resumen ejecutivo
- [TESTS_SUMMARY.md](./TESTS_SUMMARY.md) - Detalles técnicos
- [HOW_TO_RUN_TESTS.md](./HOW_TO_RUN_TESTS.md) - Guía de ejecución

**Ejecutar tests con cobertura:**

```bash
ng test --code-coverage
```

## 📱 Notificaciones en Celular (PWA)

Para recibir notificaciones en tu celular:

1. **Crear un build de producción:**
   ```bash
   npm run build
   ```

2. **Desplegar o servir con HTTPS:**
   - **Firebase Hosting**: `firebase deploy`
   - **Netlify**: `netlify deploy --prod`
   - **Vercel**: `vercel --prod`

3. **Instalar la PWA:**
   - **Android**: Abre la app → Menú (⋮) → "Instalar RemindMe"
   - **iOS**: Tap Compartir (↑) → "Agregar a pantalla de inicio"

4. **Otorgar permisos:**
   - Notificaciones: Necesarias para recibir notificaciones
   - Ubicación: Necesarias para recordatorios por proximidad

5. **Probar:**
   - Crea un recordatorio con activación por tiempo
   - Cierra la app o ponla en segundo plano
   - Recibe la notificación con vibración

📖 **Guía completa:** Ver [README_NOTIFICACIONES_CELULAR.md](./README_NOTIFICACIONES_CELULAR.md)

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
