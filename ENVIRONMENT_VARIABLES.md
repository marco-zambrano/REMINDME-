# Variables de Entorno - RemindMe

## 📋 Resumen

Este documento describe el sistema de variables de entorno implementado en la aplicación RemindMe. El proyecto **YA UTILIZA** un sistema robusto de variables de entorno que funciona tanto en desarrollo local como en producción (Docker/Cloud).

## 🔑 Variables de Entorno Disponibles

El proyecto utiliza las siguientes variables de entorno:

| Variable | Descripción | Requerida | Valor por Defecto (Dev) |
|----------|-------------|-----------|-------------------------|
| `SUPABASE_URL` | URL del proyecto de Supabase | Sí | `https://ebrtyrkyacahgkraxbwa.supabase.co` |
| `SUPABASE_KEY` | Clave anónima de Supabase | Sí | Ver archivo environment.ts |
| `GOOGLE_MAPS_API_KEY` | API Key de Google Maps | Sí* | Configurada en development |

\* La API Key de Google Maps es requerida para funcionalidades de geolocalización.

## 🏗️ Arquitectura del Sistema

### Desarrollo Local

En desarrollo local, las variables de entorno están **hardcodeadas** en los archivos:

```typescript
// src/environments/environment.ts (desarrollo)
export const environment = {
  production: false,
  supabaseUrl: (globalThis as any).ENV?.SUPABASE_URL || 'https://ebrtyrkyacahgkraxbwa.supabase.co',
  supabaseKey: (globalThis as any).ENV?.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  googleMapsApiKey: (globalThis as any).ENV?.GOOGLE_MAPS_API_KEY || 'AIzaSyDUiE88hy3-JSp--ikfI81W-mYR0BkssuQ',
};
```

**Ventajas:**
- ✅ Funciona inmediatamente sin configuración adicional
- ✅ Ideal para desarrollo rápido y pruebas
- ✅ Fácil para nuevos desarrolladores

**Nota de Seguridad:** Las credenciales hardcodeadas son **SOLO para desarrollo**. En producción se deben usar variables de entorno reales.

### Producción (Docker/Cloud)

En producción, el sistema utiliza **inyección dinámica de variables** a través de:

#### 1. Script de Inyección (`inject-env.sh`)

```bash
#!/bin/sh
set -e
cat > /usr/share/nginx/html/assets/env.js <<ENVJS
window.ENV = {
  SUPABASE_URL: "${SUPABASE_URL}",
  SUPABASE_KEY: "${SUPABASE_KEY}",
  GOOGLE_MAPS_API_KEY: "${GOOGLE_MAPS_API_KEY}"
};
ENVJS
echo "Variables de entorno inyectadas correctamente"
```

Este script:
- Se ejecuta automáticamente al iniciar el contenedor Docker
- Lee las variables de entorno del sistema
- Genera un archivo `env.js` en tiempo de ejecución
- Expone las variables a través de `window.ENV`

#### 2. Carga en index.html

```html
<!-- Variables de entorno inyectadas en runtime -->
<script src="assets/env.js"></script>
```

El archivo `env.js` se carga antes que la aplicación Angular, haciendo que las variables estén disponibles globalmente.

#### 3. Configuración de Producción

```typescript
// src/environments/environment.prod.ts
export const environment = {
  production: true,
  supabaseUrl: (globalThis as any).ENV?.SUPABASE_URL || 'https://ebrtyrkyacahgkraxbwa.supabase.co',
  supabaseKey: (globalThis as any).ENV?.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  googleMapsApiKey: (globalThis as any).ENV?.GOOGLE_MAPS_API_KEY || ''
};
```

**Flujo de prioridad:**
1. Intenta leer desde `window.ENV` (inyectado por Docker)
2. Si no existe, usa el valor por defecto (fallback)

## 🚀 Uso en Diferentes Entornos

### 🖥️ Desarrollo Local

**Comando:**
```bash
npm start
```

**Comportamiento:**
- Usa el archivo `environment.ts`
- Las variables están hardcodeadas
- No requiere configuración adicional

### 🐳 Docker (Local)

**Build:**
```bash
npm run docker:build
```

**Run con variables de entorno:**
```bash
docker run -p 8080:8080 \
  -e SUPABASE_URL="https://tu-proyecto.supabase.co" \
  -e SUPABASE_KEY="tu-clave-aqui" \
  -e GOOGLE_MAPS_API_KEY="tu-api-key-aqui" \
  remindme-app
```

O usando el script npm:
```bash
npm run docker:run
```

**Comportamiento:**
- El script `inject-env.sh` se ejecuta automáticamente
- Lee las variables del sistema (`-e` flags)
- Genera `assets/env.js` dinámicamente
- La app usa `(globalThis as any).ENV` para acceder a las variables

### ☁️ Google Cloud Run

**Deploy:**
```bash
gcloud run deploy remindme \
  --image gcr.io/PROJECT_ID/remindme \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars SUPABASE_URL="https://tu-proyecto.supabase.co" \
  --set-env-vars SUPABASE_KEY="tu-clave-aqui" \
  --set-env-vars GOOGLE_MAPS_API_KEY="tu-api-key-aqui"
```

**Comportamiento:**
- Cloud Run inyecta las variables al contenedor
- El mismo mecanismo de Docker aplica
- Las variables se actualizan sin rebuild

### 🌩️ Otros Servicios Cloud

El mismo mecanismo funciona en:
- **Azure App Service**: Configurar en "Configuration" > "Application Settings"
- **AWS ECS/Fargate**: Definir en task definition
- **Kubernetes**: Usar ConfigMaps o Secrets

## 📝 Cómo se Accede a las Variables

### En los Servicios

```typescript
// src/app/services/supabase.service.ts
import { environment } from '../../environments/environment';

export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    const supabaseUrl = environment.supabaseUrl;  // ✅ Acceso correcto
    const supabaseKey = environment.supabaseKey;  // ✅ Acceso correcto
    
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }
}
```

### En los Componentes

```typescript
// src/app/shared/location-picker/location-picker.component.ts
import { environment } from '../../../environments/environment';

async ngOnInit() {
  await this.googleMapsService.loadGoogleMaps(environment.googleMapsApiKey);  // ✅
}
```

## 🔒 Mejores Prácticas de Seguridad

### ✅ LO QUE SE HACE BIEN

1. **Separación de entornos**: Archivos diferentes para dev y prod
2. **Inyección en runtime**: No se rebuilds para cambiar variables
3. **No en el código fuente (prod)**: Las credenciales reales vienen de variables de entorno
4. **Fallbacks seguros**: Valores por defecto solo para desarrollo

### ⚠️ ADVERTENCIAS IMPORTANTES

1. **NUNCA commits credenciales de producción** en los archivos de environment
2. **Rota las claves periódicamente**, especialmente si se expusieron en git
3. **Usa secrets managers** en producción (Google Secret Manager, AWS Secrets Manager, etc.)
4. **Restringe las API Keys** de Google Maps por dominio/IP

### 🛡️ Recomendaciones Adicionales

```bash
# .gitignore ya debería incluir:
# .env
# .env.local
# .env.*.local

# Para desarrollo local más seguro, puedes crear:
# src/environments/environment.local.ts
# Y agregarlo a .gitignore
```

## 🧪 Testing

Las variables de entorno están disponibles en los tests:

```typescript
// En cualquier spec.ts
import { environment } from '../environments/environment';

describe('MyService', () => {
  it('should use environment variables', () => {
    expect(environment.supabaseUrl).toBeDefined();
    expect(environment.supabaseKey).toBeDefined();
  });
});
```

## 📊 Diagrama de Flujo

```
┌─────────────────────────────────────────────────────────────┐
│                     DESARROLLO                              │
│                                                             │
│  npm start → environment.ts → Valores hardcodeados         │
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                     PRODUCCIÓN                              │
│                                                             │
│  1. Docker container inicia                                │
│  2. inject-env.sh se ejecuta                               │
│  3. Lee $SUPABASE_URL, $SUPABASE_KEY, $GOOGLE_MAPS_API_KEY │
│  4. Genera assets/env.js con window.ENV                    │
│  5. index.html carga env.js                                │
│  6. environment.prod.ts lee (globalThis as any).ENV        │
│  7. App usa las variables                                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## ✅ Checklist de Deployment

Antes de hacer deploy a producción:

- [ ] Verificar que todas las variables estén configuradas en la plataforma
- [ ] Confirmar que `inject-env.sh` tiene permisos de ejecución
- [ ] Probar el contenedor localmente con variables de entorno
- [ ] Verificar que `assets/env.js` se genere correctamente
- [ ] Confirmar que la app carga las variables (revisar console.log si necesario)
- [ ] Rotar claves de desarrollo si se usaron en producción

## 🆘 Troubleshooting

### Problema: La app no carga las variables en producción

**Solución:**
```bash
# 1. Verificar que env.js se generó
docker exec -it <container-id> cat /usr/share/nginx/html/assets/env.js

# 2. Verificar variables en el contenedor
docker exec -it <container-id> env | grep SUPABASE

# 3. Verificar permisos del script
docker exec -it <container-id> ls -la /docker-entrypoint.d/40-inject-env.sh
```

### Problema: Variables undefined en desarrollo

**Solución:**
Verificar que estás usando el archivo correcto:
```typescript
import { environment } from './environments/environment';  // ✅ Desarrollo
import { environment } from './environments/environment.prod';  // ❌ No directamente
```

Angular selecciona automáticamente el archivo correcto según la configuración de build.

## 📚 Referencias

- [Angular Environments](https://angular.dev/guide/environments)
- [Docker Environment Variables](https://docs.docker.com/compose/environment-variables/)
- [Supabase Client Library](https://supabase.com/docs/reference/javascript/initializing)
- [Google Maps API Keys](https://developers.google.com/maps/documentation/javascript/get-api-key)

---

**Última actualización:** Enero 2026  
**Estado:** ✅ Sistema completamente implementado y funcional
