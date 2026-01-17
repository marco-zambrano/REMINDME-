# 📸 Tutorial Visual: Configuración de Google Maps API

## 🎯 Objetivo

Configurar Google Maps API para seleccionar ubicaciones en un mapa interactivo en lugar de ingresar coordenadas manualmente.

---

## 📋 Paso 1: Crear Proyecto en Google Cloud

### 1.1 Acceder a Google Cloud Console

```
🌐 Abre: https://console.cloud.google.com/
```

### 1.2 Crear Nuevo Proyecto

```
1. Haz clic en el selector de proyectos (parte superior izquierda)
2. Clic en "NUEVO PROYECTO"
3. Nombre del proyecto: "RemindMe" (o el que prefieras)
4. Clic en "CREAR"
5. Espera unos segundos a que se cree
```

---

## 🔧 Paso 2: Habilitar APIs

### 2.1 Ir a la Biblioteca de APIs

```
🌐 Ve a: https://console.cloud.google.com/apis/library
```

### 2.2 Habilitar Maps JavaScript API

```
1. Busca: "Maps JavaScript API"
2. Haz clic en el resultado
3. Clic en "HABILITAR"
4. Espera a que se active
```

### 2.3 Habilitar Places API

```
1. Vuelve a la biblioteca
2. Busca: "Places API"
3. Haz clic en el resultado
4. Clic en "HABILITAR"
```

### 2.4 Habilitar Geocoding API

```
1. Vuelve a la biblioteca
2. Busca: "Geocoding API"
3. Haz clic en el resultado
4. Clic en "HABILITAR"
```

**✅ Checkpoint**: Deberías tener 3 APIs habilitadas

---

## 🔑 Paso 3: Crear API Key

### 3.1 Ir a Credenciales

```
🌐 Ve a: https://console.cloud.google.com/apis/credentials
```

### 3.2 Crear Clave de API

```
1. Clic en "+ CREAR CREDENCIALES" (parte superior)
2. Selecciona "Clave de API"
3. ¡Se creará tu API Key!
4. COPIA la clave que aparece (algo como: AIzaSyXXXXXXXXXXXXXX...)
```

**⚠️ IMPORTANTE**: ¡Guarda esta clave en un lugar seguro!

### 3.3 Restringir la API Key (SEGURIDAD)

```
1. Después de copiar la clave, haz clic en "RESTRINGIR CLAVE"
2. En "Nombre de la clave de API": Dale un nombre descriptivo (ej: "RemindMe-Web")

3. En "Restricciones de aplicación":
   ✓ Selecciona "Referentes HTTP (sitios web)"

4. En "Referentes de sitio web":
   ✓ Clic en "+ AGREGAR UN ELEMENTO"
   ✓ Agrega: http://localhost:4200/*
   ✓ Clic en "+ AGREGAR UN ELEMENTO" otra vez
   ✓ Agrega: https://tu-dominio.com/* (reemplaza con tu dominio de producción)

5. En "Restricciones de API":
   ✓ Selecciona "Restringir clave"
   ✓ Marca estas 3 APIs:
      • Maps JavaScript API
      • Places API
      • Geocoding API

6. Clic en "GUARDAR"
```

---

## 💻 Paso 4: Configurar en tu Proyecto

### 4.1 Abrir Archivo de Entorno

```bash
# En tu editor de código, abre:
src/environments/environment.ts
```

### 4.2 Agregar tu API Key

```typescript
export const environment = {
  production: false,
  supabaseUrl: '...',
  supabaseKey: '...',
  googleMapsApiKey: 'AIzaSyXXXXXXXXXXXXXX',
};
```

**Ejemplo completo:**

```typescript
export const environment = {
  production: false,
  supabaseUrl: 'https://ebrtyrkyacahgkraxbwa.supabase.co',
  supabaseKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  googleMapsApiKey: 'AIzaSyBnVqJKl4bQ3X9TvWmR8pYqLzN5eH0jK_M',
};
```

### 4.3 Guardar el Archivo

```
Ctrl + S (Windows/Linux)
Cmd + S (Mac)
```

---

## 🚀 Paso 5: Iniciar la Aplicación

### 5.1 Abrir Terminal

```bash
# En VS Code, abre la terminal integrada:
# View → Terminal
# o presiona: Ctrl + `
```

### 5.2 Iniciar Servidor de Desarrollo

```bash
npm start
```

**Deberías ver algo como:**

```
✔ Browser application bundle generation complete.
⠙ Building...

Initial Chunk Files   | Names         |  Raw Size
main.js               | main          |   xxx KB
...

** Angular Live Development Server is listening on localhost:4200 **
✔ Compiled successfully.
```

### 5.3 Abrir en el Navegador

```
🌐 Abre: http://localhost:4200
```

---

## ✅ Paso 6: Probar la Funcionalidad

### 6.1 Ir a Nuevo Recordatorio

```
1. En la app, haz clic en "Nuevo Recordatorio"
   o navega a: http://localhost:4200/reminders/new
```

### 6.2 Ver las Opciones de Ubicación

Deberías ver **3 botones**:

```
┌─────────────────────────────────────────────────────┐
│  🔵 Usar ubicación actual                           │
│  🟢 Seleccionar en mapa        ← ¡EL NUEVO!         │
│  ⚫ Ingresar coordenadas                             │
└─────────────────────────────────────────────────────┘
```

### 6.3 Hacer Clic en "Seleccionar en mapa"

```
1. Haz clic en el botón verde "Seleccionar en mapa"
2. Se abrirá un modal con el mapa de Google Maps
```

### 6.4 Probar Funcionalidades

**✅ Búsqueda de lugares:**

```
1. En la barra superior del modal, escribe: "Torre Eiffel"
2. Selecciona un resultado
3. El mapa se centrará en ese lugar
```

**✅ Clic en el mapa:**

```
1. Haz clic en cualquier punto del mapa
2. El marcador se moverá a ese punto
```

**✅ Arrastrar marcador:**

```
1. Haz clic y mantén presionado el marcador (pin rojo)
2. Arrástralo a otro lugar
3. Suelta para colocarlo
```

**✅ Mi ubicación:**

```
1. Haz clic en el botón circular (esquina inferior derecha)
2. Permite acceso a la ubicación si te lo pide
3. El mapa se centrará en tu ubicación GPS
```

**✅ Confirmar ubicación:**

```
1. Una vez seleccionada la ubicación deseada
2. Haz clic en "Confirmar Ubicación" (botón azul abajo)
3. El modal se cerrará
4. La ubicación se guardará en el formulario
```

---

## 🎉 ¡Listo! Verificación Final

### ✅ Checklist de Verificación

- [ ] El mapa de Google se carga correctamente
- [ ] Puedo buscar lugares en la barra de búsqueda
- [ ] Puedo hacer clic en el mapa para mover el marcador
- [ ] Puedo arrastrar el marcador
- [ ] El botón "Mi ubicación" funciona
- [ ] Al confirmar, la ubicación se guarda con su dirección
- [ ] El formulario muestra la ubicación seleccionada

### ✅ Resultado Esperado

Después de confirmar una ubicación, deberías ver:

```
┌─────────────────────────────────────────────────────┐
│  ✅ Ubicación seleccionada                          │
│  📍 Torre Eiffel                                    │
│  📮 Champ de Mars, 5 Av. Anatole France,           │
│     75007 Paris, Francia                            │
│  🌍 Lat: 48.858370, Lng: 2.294481                  │
│                                        [Cambiar]    │
└─────────────────────────────────────────────────────┘
```

---

## 🐛 Solución de Problemas

### ❌ El mapa no se carga

**Problema:** Aparece un error en lugar del mapa

**Soluciones:**

1. **Verifica la API Key:**

   ```
   - Abre src/environments/environment.ts
   - Asegúrate de que googleMapsApiKey tenga tu clave
   - Copia la clave directamente desde Google Cloud Console
   ```

2. **Verifica que las APIs estén habilitadas:**

   ```
   - Ve a: https://console.cloud.google.com/apis/library
   - Verifica que estén habilitadas:
     • Maps JavaScript API
     • Places API
     • Geocoding API
   ```

3. **Verifica las restricciones:**
   ```
   - Ve a: https://console.cloud.google.com/apis/credentials
   - Haz clic en tu API Key
   - En "Referentes de sitio web", asegúrate de tener:
     http://localhost:4200/*
   ```

### ❌ Error: "This API project is not authorized"

**Problema:** Mensaje de error en el mapa

**Solución:**

```
1. Ve a Google Cloud Console
2. Asegúrate de que el proyecto correcto esté seleccionado
3. Ve a "APIs y servicios" → "Biblioteca"
4. Habilita Maps JavaScript API si no está activa
```

### ❌ El botón "Mi ubicación" no funciona

**Problema:** No centra el mapa en tu ubicación

**Soluciones:**

1. **Permite el acceso a la ubicación:**

   ```
   - Chrome: Clic en el candado junto a la URL
   - Configuración del sitio
   - Ubicación → Permitir
   ```

2. **Prueba en HTTPS:**
   ```
   - La geolocalización funciona mejor en HTTPS
   - En localhost debería funcionar sin problemas
   ```

### ❌ Error 429: "You have exceeded your rate limit"

**Problema:** Demasiadas solicitudes

**Solución:**

```
1. Ve a: https://console.cloud.google.com/google/maps-apis/quotas
2. Verifica tu uso actual
3. Configura alertas de presupuesto
4. Si es necesario, ajusta las cuotas
```

---

## 📊 Monitoreo de Uso

### Ver Estadísticas de Uso

```
🌐 Ve a: https://console.cloud.google.com/google/maps-apis/metrics
```

**Podrás ver:**

- Número de cargas de mapa por día
- Número de geocodificaciones
- Número de búsquedas de Places
- Costos estimados

### Configurar Alertas de Presupuesto

```
1. Ve a: https://console.cloud.google.com/billing
2. Clic en "Presupuestos y alertas"
3. Clic en "CREAR PRESUPUESTO"
4. Establece un límite (ej: $10 USD/mes)
5. Configura alertas al 50%, 90% y 100%
```

---

## 📚 Recursos Adicionales

### Documentación Oficial

- [Google Maps JavaScript API](https://developers.google.com/maps/documentation/javascript)
- [Places API](https://developers.google.com/maps/documentation/places/web-service)
- [Geocoding API](https://developers.google.com/maps/documentation/geocoding)

### Videos Tutoriales (YouTube)

Busca: "Google Maps API Tutorial 2024"

### Comunidad

- [Stack Overflow - google-maps-api-3](https://stackoverflow.com/questions/tagged/google-maps-api-3)
- [Google Maps Platform Support](https://developers.google.com/maps/support)

---

## 💡 Tips y Mejores Prácticas

### ✅ Desarrollo

```javascript
// Para desarrollo local, usa una clave sin restricciones temporalmente
// PERO recuerda restringirla antes de subir a producción
```

### ✅ Producción

```bash
# Usa variables de entorno en producción
export GOOGLE_MAPS_API_KEY=tu_clave_aqui

# Docker
docker run -e GOOGLE_MAPS_API_KEY=tu_clave ...

# Cloud Run
gcloud run deploy --set-env-vars GOOGLE_MAPS_API_KEY=tu_clave ...
```

### ✅ Seguridad

```
1. ✅ Restringe tu API Key por dominio
2. ✅ No subas la clave a GitHub
3. ✅ Usa variables de entorno en producción
4. ✅ Monitorea el uso regularmente
5. ✅ Configura alertas de presupuesto
```

---

## 🎓 Conceptos Aprendidos

Al completar este tutorial, habrás aprendido:

- ✅ Crear y configurar un proyecto en Google Cloud
- ✅ Habilitar y gestionar APIs de Google
- ✅ Crear y restringir API Keys
- ✅ Integrar Google Maps en una aplicación Angular
- ✅ Usar geocodificación y Places API
- ✅ Gestionar variables de entorno
- ✅ Implementar buenas prácticas de seguridad

---

**¡Felicidades! 🎉 Has integrado exitosamente Google Maps en tu aplicación RemindMe.**

Si tienes problemas, revisa la sección de solución de problemas o consulta la documentación completa en [GOOGLE_MAPS_SETUP.md](./GOOGLE_MAPS_SETUP.md)
