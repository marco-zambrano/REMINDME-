# 🚀 Guía de Inicio Rápido - RemindMe

## ⚡ Inicio Rápido (5 minutos)

### Paso 1: Clonar el Repositorio

```bash
git clone https://github.com/marco-zambrano/REMINDME-.git
cd REMINDME-
```

### Paso 2: Instalar Dependencias

```bash
npm install
```

### Paso 3: Iniciar Aplicación

```bash
npm start
```

### Paso 4: Abrir en Navegador

Navega a: http://localhost:4200

¡Listo! La aplicación está funcionando.

---

## 📦 Scripts Disponibles

### Desarrollo

```bash
# Iniciar servidor de desarrollo
npm start
# o
npm run ng serve

# Servidor con puerto específico
npm start -- --port 4300

# Abrir automáticamente en navegador
npm start -- --open
```

### Testing

```bash
# Ejecutar tests una vez
npm test

# Tests en modo watch (recomendado para desarrollo)
npm test -- --watch

# Tests con cobertura
npm run test:coverage

# Ver reporte de cobertura
# Abre: coverage/index.html en tu navegador
```

### Build

```bash
# Build de desarrollo
npm run build

# Build de producción
npm run build -- --configuration production

# Build con análisis de bundle
npm run build -- --configuration production --stats-json
```

### Linting

```bash
# Ejecutar linter
npm run lint

# Linter con auto-fix
npm run lint -- --fix
```

### Otros

```bash
# Ver ayuda de Angular CLI
npm run ng help

# Generar nuevo componente
npm run ng generate component nombre-componente

# Generar nuevo servicio
npm run ng generate service nombre-servicio
```

---

## 🔧 Configuración del Entorno

### Requisitos Previos

- **Node.js**: 18.x o superior
- **npm**: 9.x o superior
- **Git**: Última versión

### Verificar Versiones

```bash
node --version  # Debería ser v18.x.x o superior
npm --version   # Debería ser 9.x.x o superior
git --version   # Cualquier versión reciente
```

### Instalar Angular CLI Globalmente (Opcional)

```bash
npm install -g @angular/cli@20.3.9
```

---

## 🗄️ Configuración de Base de Datos

### Supabase (Backend)

La aplicación ya está configurada con Supabase. Las credenciales están en:

```
src/app/services/supabase.service.ts
```

**Para usar tu propia instancia de Supabase:**

1. Crear cuenta en [supabase.com](https://supabase.com)

2. Crear nuevo proyecto

3. Crear tabla `reminders`:

```sql
CREATE TABLE reminders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  location_name TEXT,
  location_address TEXT,
  radius INTEGER DEFAULT 500,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP,
  notified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para mejorar rendimiento
CREATE INDEX idx_reminders_user_id ON reminders(user_id);
CREATE INDEX idx_reminders_completed ON reminders(completed);
CREATE INDEX idx_reminders_category ON reminders(category);
```

4. Configurar Row Level Security (RLS):

```sql
-- Habilitar RLS
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios solo ven sus propios recordatorios
CREATE POLICY "Users can view own reminders"
  ON reminders FOR SELECT
  USING (auth.uid() = user_id);

-- Política: Los usuarios solo pueden insertar sus propios recordatorios
CREATE POLICY "Users can insert own reminders"
  ON reminders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Política: Los usuarios solo pueden actualizar sus propios recordatorios
CREATE POLICY "Users can update own reminders"
  ON reminders FOR UPDATE
  USING (auth.uid() = user_id);

-- Política: Los usuarios solo pueden eliminar sus propios recordatorios
CREATE POLICY "Users can delete own reminders"
  ON reminders FOR DELETE
  USING (auth.uid() = user_id);
```

5. Actualizar credenciales en `src/app/services/supabase.service.ts`:

```typescript
const supabaseUrl = 'TU_SUPABASE_URL';
const supabaseKey = 'TU_SUPABASE_ANON_KEY';
```

---

## 🌐 Variables de Entorno

### Crear archivo .env (Opcional)

```bash
# .env.development
NG_APP_SUPABASE_URL=https://tu-proyecto.supabase.co
NG_APP_SUPABASE_KEY=tu-anon-key

# .env.production
NG_APP_SUPABASE_URL=https://tu-proyecto.supabase.co
NG_APP_SUPABASE_KEY=tu-anon-key
```

**Nota**: Angular no usa `.env` nativamente. Usa `environment.ts`:

```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  supabase: {
    url: 'https://tu-proyecto.supabase.co',
    key: 'tu-anon-key',
  },
};
```

---

## 🧪 Ejecutar Tests

### Tests Unitarios

```bash
# Una ejecución
npm test -- --watch=false

# Modo watch (recomendado)
npm test

# Con cobertura
npm test -- --code-coverage

# Navegadores específicos
npm test -- --browsers=Chrome
npm test -- --browsers=Firefox
npm test -- --browsers=ChromeHeadless  # Para CI
```

### Ver Cobertura

Después de ejecutar tests con cobertura:

```bash
# Windows
start coverage/index.html

# Mac
open coverage/index.html

# Linux
xdg-open coverage/index.html
```

---

## 📦 Build y Deploy

### Build Local

```bash
# Desarrollo
npm run build

# Producción
npm run build -- --configuration production
```

Archivos generados en: `dist/remindme/browser/`

### Deploy a Vercel

#### Opción 1: CLI

```bash
# Instalar Vercel CLI
npm install -g vercel

# Deploy
vercel

# Deploy a producción
vercel --prod
```

#### Opción 2: GitHub Integration

1. Conecta tu repositorio a Vercel
2. Configura el proyecto:
   - **Framework Preset**: Angular
   - **Build Command**: `npm run build -- --configuration production`
   - **Output Directory**: `dist/remindme/browser`
3. Deploy automático en cada push

### Deploy a Netlify

```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy

# Deploy a producción
netlify deploy --prod
```

### Deploy a Firebase Hosting

```bash
# Instalar Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Inicializar
firebase init hosting

# Deploy
firebase deploy
```

---

## 🐛 Solución de Problemas

### Problema: `npm install` falla

**Solución:**

```bash
# Limpiar cache
npm cache clean --force

# Eliminar node_modules y reinstalar
rm -rf node_modules package-lock.json
npm install
```

### Problema: Puerto 4200 ya en uso

**Solución:**

```bash
# Usar otro puerto
npm start -- --port 4300

# O matar el proceso que usa el puerto (Windows)
netstat -ano | findstr :4200
taskkill /PID <PID> /F

# O matar el proceso (Mac/Linux)
lsof -i :4200
kill -9 <PID>
```

### Problema: Tests fallan

**Solución:**

```bash
# Verificar que todas las dependencias estén instaladas
npm install

# Ejecutar tests en modo debug
npm test -- --source-map

# Ver logs detallados
npm test -- --log-level=debug
```

### Problema: Build falla por memoria

**Solución:**

```bash
# Aumentar memoria para Node.js
export NODE_OPTIONS="--max_old_space_size=4096"
npm run build

# Windows
set NODE_OPTIONS=--max_old_space_size=4096
npm run build
```

### Problema: Permisos de geolocalización denegados

**Usuario debe:**

1. Abrir configuración del navegador
2. Buscar permisos de sitio
3. Permitir ubicación para localhost:4200

### Problema: Notificaciones no funcionan

**Verificar:**

1. Permisos de notificación otorgados
2. Navegador compatible (Chrome, Firefox, Edge)
3. No usar modo incógnito
4. HTTPS en producción (localhost está OK)

---

## 🔒 Permisos del Navegador

### Chrome/Edge

1. Clic en el candado/ícono de información en la barra de direcciones
2. "Configuración del sitio"
3. Permitir "Ubicación" y "Notificaciones"

### Firefox

1. Clic en el candado en la barra de direcciones
2. "Permisos"
3. Permitir "Ubicación" y "Notificaciones"

### Safari

1. Safari → Preferencias → Sitios web
2. Seleccionar "Ubicación" y "Notificaciones"
3. Permitir para localhost

---

## 📊 Verificar Instalación

### Checklist Post-Instalación

```bash
# 1. Verificar que la app arranca
npm start
# ✅ Debería ver: "Application bundle generation complete"

# 2. Verificar que los tests pasan
npm test -- --watch=false
# ✅ Debería ver: "X specs, 0 failures"

# 3. Verificar que el build funciona
npm run build
# ✅ Debería crear carpeta dist/

# 4. Verificar linting
npm run lint
# ✅ Debería pasar sin errores críticos
```

---

## 📚 Recursos Adicionales

### Documentación

- [Manual de Usuario](./docs/MANUAL_USUARIO.md)
- [Informe XP](./docs/INFORME_XP.md)
- [Tablero Kanban](./docs/KANBAN_BOARD.md)
- [README Principal](./README.md)

### Enlaces Útiles

- [Angular Documentation](https://angular.dev)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Geolocation API](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API)
- [Notifications API](https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API)

### Soporte

- **Issues**: https://github.com/marco-zambrano/REMINDME-/issues
- **Discusiones**: https://github.com/marco-zambrano/REMINDME-/discussions

---

## 🎓 Para Desarrolladores

### Generar Nuevos Componentes

```bash
# Componente
ng generate component components/mi-componente

# Servicio
ng generate service services/mi-servicio

# Interfaz
ng generate interface models/mi-interface

# Guard
ng generate guard guards/mi-guard
```

### Estructura de Commits

```bash
# Usar Conventional Commits
feat: agregar nueva funcionalidad
fix: corregir bug
docs: actualizar documentación
test: agregar tests
refactor: refactorizar código
style: cambios de formato
chore: tareas de mantenimiento
```

### Pre-commit Hooks (Opcional)

```bash
# Instalar husky
npm install --save-dev husky

# Configurar
npx husky-init

# Agregar hook pre-commit
echo "npm run lint && npm test -- --watch=false" > .husky/pre-commit
```

---

## ✅ Checklist de Producción

Antes de deployar a producción:

- [ ] Tests pasan: `npm test -- --watch=false`
- [ ] Linting pasa: `npm run lint`
- [ ] Build exitoso: `npm run build -- --configuration production`
- [ ] Variables de entorno configuradas
- [ ] Credenciales de Supabase actualizadas
- [ ] HTTPS habilitado
- [ ] Service Worker funcionando
- [ ] Manifest.json configurado
- [ ] Íconos PWA generados
- [ ] Documentación actualizada
- [ ] README.md completo
- [ ] CHANGELOG.md actualizado

---

## 🆘 ¿Necesitas Ayuda?

1. **Revisa la documentación**: docs/
2. **Busca en issues cerrados**: https://github.com/marco-zambrano/REMINDME-/issues?q=is%3Aissue+is%3Aclosed
3. **Abre un nuevo issue**: https://github.com/marco-zambrano/REMINDME-/issues/new
4. **Contacta al equipo**: Via GitHub

---

**¡Feliz desarrollo! 🚀**

RemindMe v1.0.0 - Noviembre 2025
