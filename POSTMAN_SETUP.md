# 🚀 Configuración de Postman - RemindMe API

## 📦 Importar la Colección

### Opción 1: Importar desde Postman (Recomendado)

1. Abre Postman
2. Busca en la barra de búsqueda: **"RemindMe API - Recordatorios con Geolocalización"**
3. Si la encuentras en tu cuenta, úsala directamente
4. Si no, pide el archivo JSON al equipo

### Opción 2: Importar desde Archivo JSON

Si tienes el archivo `RemindMe_API.postman_collection.json`:

1. Abre Postman
2. Clic en **"Import"** (esquina superior izquierda)
3. Arrastra el archivo JSON o selecciónalo
4. Clic en **"Import"**

### Opción 3: Documentación Pública

Visita la documentación pública (si está disponible):
```
https://documenter.getpostman.com/view/YOUR_ID/remindme-api
```

---

## ⚙️ Configurar Variables de Entorno

### 1. Crear Environment

1. En Postman, ve a **"Environments"** (icono de ojo, esquina superior derecha)
2. Clic en **"+"** para crear nuevo environment
3. Nombra: `RemindMe - Development`

### 2. Agregar Variables

Agrega estas variables con TUS valores reales:

| Variable | Valor | Descripción |
|----------|-------|-------------|
| `SUPABASE_URL` | `https://YOUR_PROJECT.supabase.co` | URL de tu proyecto Supabase |
| `SUPABASE_KEY` | `tu_clave_aqui` | Supabase anon key |
| `GOOGLE_MAPS_API_KEY` | `tu_api_key_aqui` | Google Maps API Key |
| `ACCESS_TOKEN` | *dejar vacío* | Se llena automáticamente tras login |
| `USER_ID` | *dejar vacío* | Se llena automáticamente tras login |

**Ejemplo de configuración:**

```
Variable Name          | Initial Value                              | Current Value
----------------------|-------------------------------------------|------------------
SUPABASE_URL          | https://abc123.supabase.co                | https://abc123.supabase.co
SUPABASE_KEY          | eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...  | eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
GOOGLE_MAPS_API_KEY   | AIzaSyD...                                | AIzaSyD...
ACCESS_TOKEN          |                                           |
USER_ID               |                                           |
```

### 3. Activar el Environment

1. En el dropdown de environments (esquina superior derecha)
2. Selecciona **"RemindMe - Development"**

---

## 🎯 Flujo de Uso

### Paso 1: Autenticarse

1. Navega a la carpeta **🔐 Authentication**
2. Ejecuta **"Login User"** o **"Register User"**
3. ✨ **Automático**: El script guardará tu `ACCESS_TOKEN` y `USER_ID`
4. Verifica en Console (View → Show Postman Console)

**Script que se ejecuta automáticamente:**
```javascript
// En el test del Login User
if (pm.response.code === 200) {
    var jsonData = pm.response.json();
    pm.collectionVariables.set('ACCESS_TOKEN', jsonData.access_token);
    pm.collectionVariables.set('USER_ID', jsonData.user.id);
}
```

### Paso 2: Crear Categoría

1. Ve a **🏷️ Categories** → **"Create Category"**
2. Modifica el body si quieres:
```json
{
  "name": "Mi Categoría",
  "color": "bg-blue-500",
  "created_by": "{{USER_ID}}"
}
```
3. **Send**
4. Copia el `id` de la categoría creada

### Paso 3: Crear Recordatorio

1. Ve a **📝 Reminders** → **"Create Reminder"**
2. Actualiza el body con el `category_id`:
```json
{
  "user_id": "{{USER_ID}}",
  "title": "Comprar leche",
  "description": "Leche descremada 1L",
  "category_id": "PEGA_EL_UUID_AQUI",
  "latitude": 40.7128,
  "longitude": -74.0060,
  "location_name": "Supermercado",
  "location_address": "123 Main St",
  "radius_meters": 500,
  "notification_enabled": true,
  "is_completed": false
}
```
3. **Send**

### Paso 4: Obtener Recordatorios

1. **"Get All Reminders"** → Lista todos tus recordatorios
2. **"Get Reminder by ID"** → Reemplaza `REMINDER_ID` con un ID real

---

## 🗺️ Usar Google Maps APIs

### Geocoding - Dirección a Coordenadas

**Ejemplo:**
```
GET https://maps.googleapis.com/maps/api/geocode/json
  ?address=1600+Amphitheatre+Parkway,+Mountain+View,+CA
  &key={{GOOGLE_MAPS_API_KEY}}
```

**Copiar coordenadas del response:**
```json
{
  "results": [
    {
      "geometry": {
        "location": {
          "lat": 37.4224764,   // ← Copiar esto
          "lng": -122.0842499  // ← Y esto
        }
      }
    }
  ]
}
```

Úsalas en "Create Reminder"!

---

## 🔧 Tips y Trucos

### Tip 1: Variables Dinámicas

Reemplaza valores manualmente:
- `{{REMINDER_ID}}` → Pega un ID real del GET All Reminders
- `{{CATEGORY_ID}}` → Pega un ID real del GET All Categories

### Tip 2: Ver Variables Actuales

1. Clic en el **ojo** 👁️ (esquina superior derecha)
2. Ve tus variables y valores actuales
3. Edita si es necesario

### Tip 3: Console de Postman

Ver logs de scripts:
1. **View** → **Show Postman Console** (Cmd/Ctrl + Alt + C)
2. Ve logs de los test scripts
3. Debug problemas

### Tip 4: Guardar Ejemplos

Después de una petición exitosa:
1. Clic en **"Save Response"**
2. **"Save as Example"**
3. Documenta diferentes casos

---

## ⚠️ Troubleshooting

### Error 401: Unauthorized

**Causa:** Token expirado o inválido

**Solución:**
1. Ejecuta "Login User" nuevamente
2. El token se actualizará automáticamente
3. Reintenta la petición

---

### Error: Variable "SUPABASE_URL" not found

**Causa:** Environment no activado o variable mal configurada

**Solución:**
1. Verifica que el environment esté seleccionado (dropdown superior derecho)
2. Revisa que las variables estén bien escritas (case-sensitive)

---

### Google Maps: REQUEST_DENIED

**Causa:** API Key inválida o sin permisos

**Solución:**
1. Verifica tu API Key en Google Cloud Console
2. Habilita las APIs necesarias:
   - Geocoding API
   - Places API
3. Actualiza la variable `GOOGLE_MAPS_API_KEY`

---

### No se guardan ACCESS_TOKEN ni USER_ID

**Causa:** El test script no se ejecutó

**Solución:**
1. Verifica la respuesta del login (debe ser 200 OK)
2. Abre Postman Console para ver errores
3. Verifica que el script esté en la pestaña "Tests" del request

---

## 📚 Recursos Adicionales

- [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) - Documentación completa de endpoints
- [ENVIRONMENT_VARIABLES.md](./ENVIRONMENT_VARIABLES.md) - Guía de configuración
- [README.md](./README.md) - Documentación general del proyecto

---

## 🤝 Compartir con el Equipo

### Para compartir esta colección:

1. **Exportar la colección:**
   ```
   Click derecho en "RemindMe API" → Export → Collection v2.1
   ```

2. **Compartir el archivo JSON:**
   - Súbelo al repositorio (sin variables sensibles)
   - Envíalo por email/Slack
   - Comparte vía workspace de Postman

3. **Configuración del equipo:**
   - Cada persona configura sus propias variables de entorno
   - NO compartas valores de `SUPABASE_KEY` o `GOOGLE_MAPS_API_KEY` en git

---

**Última actualización:** Enero 30, 2026  
**Versión:** 1.0.0
