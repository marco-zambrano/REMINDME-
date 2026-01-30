# 📡 RemindMe API - Documentación Completa

## 📋 Índice

1. [Introducción](#introducción)
2. [Configuración](#configuración)
3. [Autenticación](#autenticación)
4. [Endpoints de Recordatorios](#endpoints-de-recordatorios)
5. [Endpoints de Categorías](#endpoints-de-categorías)
6. [Integración con Google Maps](#integración-con-google-maps)
7. [Modelos de Datos](#modelos-de-datos)
8. [Códigos de Error](#códigos-de-error)
9. [Ejemplos de Uso](#ejemplos-de-uso)
10. [Colección de Postman](#colección-de-postman)

---

## 🎯 Introducción

RemindMe utiliza **Supabase** como backend (PostgreSQL + Auth + REST API) y **Google Maps API** para servicios de geolocalización. Esta documentación describe todos los endpoints disponibles y cómo utilizarlos.

### URLs Base

- **Supabase REST API**: `https://YOUR_PROJECT_ID.supabase.co/rest/v1`
- **Supabase Auth**: `https://YOUR_PROJECT_ID.supabase.co/auth/v1`
- **Google Maps**: `https://maps.googleapis.com/maps/api`

---

## ⚙️ Configuración

### Variables de Entorno Requeridas

```bash
# Supabase
SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
SUPABASE_KEY=your_supabase_anon_key_here

# Google Maps
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

### Headers Comunes

Todas las peticiones a Supabase requieren:

```http
apikey: {{SUPABASE_KEY}}
Content-Type: application/json
```

Para operaciones autenticadas, además:

```http
Authorization: Bearer {{ACCESS_TOKEN}}
```

---

## 🔐 Autenticación

### 1. Registro de Usuario

Crea una nueva cuenta de usuario.

**Endpoint:**
```http
POST {{SUPABASE_URL}}/auth/v1/signup
```

**Request Body:**
```json
{
  "email": "usuario@ejemplo.com",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 3600,
  "refresh_token": "v1.MRjFEwRRx4...",
  "user": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "aud": "authenticated",
    "email": "usuario@ejemplo.com",
    "created_at": "2026-01-30T10:00:00.000Z"
  }
}
```

**Errores Comunes:**
- `400`: Email ya registrado
- `422`: Email inválido o contraseña muy corta (mínimo 6 caracteres)

---

### 2. Inicio de Sesión

Autentica un usuario existente.

**Endpoint:**
```http
POST {{SUPABASE_URL}}/auth/v1/token?grant_type=password
```

**Request Body:**
```json
{
  "email": "usuario@ejemplo.com",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 3600,
  "refresh_token": "v1.MRjFEwRRx4...",
  "user": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "email": "usuario@ejemplo.com"
  }
}
```

**💡 Tip:** Guarda el `access_token` y `user.id` para usarlos en todas las demás peticiones.

---

### 3. Obtener Usuario Actual

Obtiene información del usuario autenticado.

**Endpoint:**
```http
GET {{SUPABASE_URL}}/auth/v1/user
```

**Headers:**
```http
apikey: {{SUPABASE_KEY}}
Authorization: Bearer {{ACCESS_TOKEN}}
```

**Response (200 OK):**
```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "aud": "authenticated",
  "email": "usuario@ejemplo.com",
  "email_confirmed_at": "2026-01-30T10:00:00.000Z",
  "created_at": "2026-01-30T10:00:00.000Z",
  "updated_at": "2026-01-30T10:00:00.000Z"
}
```

---

### 4. Cerrar Sesión

Invalida el token actual.

**Endpoint:**
```http
POST {{SUPABASE_URL}}/auth/v1/logout
```

**Headers:**
```http
apikey: {{SUPABASE_KEY}}
Authorization: Bearer {{ACCESS_TOKEN}}
```

**Response (204 No Content)**

---

## 📝 Endpoints de Recordatorios

### 1. Obtener Todos los Recordatorios

Lista todos los recordatorios del usuario autenticado.

**Endpoint:**
```http
GET {{SUPABASE_URL}}/rest/v1/reminders?user_id=eq.{{USER_ID}}&order=created_at.desc
```

**Headers:**
```http
apikey: {{SUPABASE_KEY}}
Authorization: Bearer {{ACCESS_TOKEN}}
Prefer: return=representation
```

**Query Parameters (opcionales):**
- `category_id=eq.UUID` - Filtrar por categoría
- `is_completed=eq.false` - Solo pendientes
- `is_completed=eq.true` - Solo completados
- `order=created_at.desc` - Ordenar (desc/asc)

**Response (200 OK):**
```json
[
  {
    "id": "f7e8d9c0-1234-5678-90ab-cdef12345678",
    "user_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "title": "Comprar leche",
    "description": "Leche descremada 1L",
    "category_id": "c5d6e7f8-90ab-cdef-1234-567890abcdef",
    "latitude": 40.7128,
    "longitude": -74.0060,
    "location_name": "Supermercado Central",
    "location_address": "123 Main Street, New York, NY",
    "radius_meters": 500,
    "is_completed": false,
    "notification_enabled": true,
    "created_at": "2026-01-30T10:00:00.000Z",
    "updated_at": "2026-01-30T10:00:00.000Z"
  }
]
```

---

### 2. Obtener Recordatorio por ID

Obtiene un recordatorio específico.

**Endpoint:**
```http
GET {{SUPABASE_URL}}/rest/v1/reminders?id=eq.{{REMINDER_ID}}&select=*
```

**Headers:**
```http
apikey: {{SUPABASE_KEY}}
Authorization: Bearer {{ACCESS_TOKEN}}
```

**Response (200 OK):**
```json
[
  {
    "id": "f7e8d9c0-1234-5678-90ab-cdef12345678",
    "user_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "title": "Comprar leche",
    ...
  }
]
```

**Nota:** La respuesta es un array con un solo elemento.

---

### 3. Crear Recordatorio

Crea un nuevo recordatorio con ubicación.

**Endpoint:**
```http
POST {{SUPABASE_URL}}/rest/v1/reminders
```

**Headers:**
```http
apikey: {{SUPABASE_KEY}}
Authorization: Bearer {{ACCESS_TOKEN}}
Content-Type: application/json
Prefer: return=representation
```

**Request Body:**
```json
{
  "user_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "title": "Comprar leche",
  "description": "Comprar leche descremada 1L",
  "category_id": "c5d6e7f8-90ab-cdef-1234-567890abcdef",
  "latitude": 40.7128,
  "longitude": -74.0060,
  "location_name": "Supermercado Central",
  "location_address": "123 Main Street, New York, NY",
  "radius_meters": 500,
  "notification_enabled": true,
  "is_completed": false
}
```

**Campos Requeridos:**
- `user_id` ✅
- `title` ✅
- `category_id` ✅
- `latitude` ✅
- `longitude` ✅
- `location_name` ✅

**Campos Opcionales:**
- `description` (default: "")
- `location_address` (default: "")
- `radius_meters` (default: 500)
- `notification_enabled` (default: true)
- `is_completed` (default: false)

**Response (201 Created):**
```json
[
  {
    "id": "f7e8d9c0-1234-5678-90ab-cdef12345678",
    "user_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "title": "Comprar leche",
    "created_at": "2026-01-30T10:00:00.000Z",
    "updated_at": "2026-01-30T10:00:00.000Z",
    ...
  }
]
```

---

### 4. Actualizar Recordatorio

Modifica un recordatorio existente.

**Endpoint:**
```http
PATCH {{SUPABASE_URL}}/rest/v1/reminders?id=eq.{{REMINDER_ID}}
```

**Headers:**
```http
apikey: {{SUPABASE_KEY}}
Authorization: Bearer {{ACCESS_TOKEN}}
Content-Type: application/json
Prefer: return=representation
```

**Request Body (todos los campos son opcionales):**
```json
{
  "title": "Comprar leche y pan",
  "description": "Leche descremada 1L y pan integral",
  "is_completed": false,
  "radius_meters": 800
}
```

**Response (200 OK):**
```json
[
  {
    "id": "f7e8d9c0-1234-5678-90ab-cdef12345678",
    "title": "Comprar leche y pan",
    "updated_at": "2026-01-30T11:00:00.000Z",
    ...
  }
]
```

---

### 5. Marcar como Completado

Atajo para cambiar el estado a completado.

**Endpoint:**
```http
PATCH {{SUPABASE_URL}}/rest/v1/reminders?id=eq.{{REMINDER_ID}}
```

**Request Body:**
```json
{
  "is_completed": true
}
```

**Response (200 OK):**
```json
[
  {
    "id": "f7e8d9c0-1234-5678-90ab-cdef12345678",
    "is_completed": true,
    "updated_at": "2026-01-30T12:00:00.000Z",
    ...
  }
]
```

---

### 6. Eliminar Recordatorio

Elimina un recordatorio permanentemente.

**Endpoint:**
```http
DELETE {{SUPABASE_URL}}/rest/v1/reminders?id=eq.{{REMINDER_ID}}
```

**Headers:**
```http
apikey: {{SUPABASE_KEY}}
Authorization: Bearer {{ACCESS_TOKEN}}
```

**Response (204 No Content)**

---

## 🏷️ Endpoints de Categorías

### 1. Obtener Todas las Categorías

Lista las categorías creadas por el usuario.

**Endpoint:**
```http
GET {{SUPABASE_URL}}/rest/v1/categories?created_by=eq.{{USER_ID}}&order=name.asc
```

**Headers:**
```http
apikey: {{SUPABASE_KEY}}
Authorization: Bearer {{ACCESS_TOKEN}}
```

**Response (200 OK):**
```json
[
  {
    "id": "c5d6e7f8-90ab-cdef-1234-567890abcdef",
    "name": "Trabajo",
    "color": "bg-blue-500",
    "created_by": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "created_at": "2026-01-30T10:00:00.000Z"
  },
  {
    "id": "d6e7f8g9-01bc-def1-2345-67890abcdef1",
    "name": "Compras",
    "color": "bg-green-500",
    "created_by": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "created_at": "2026-01-30T10:05:00.000Z"
  }
]
```

**Colores Disponibles:**
- `bg-blue-500` - Azul
- `bg-green-500` - Verde
- `bg-red-500` - Rojo
- `bg-yellow-500` - Amarillo
- `bg-purple-500` - Púrpura
- `bg-pink-500` - Rosa
- `bg-gray-500` - Gris

---

### 2. Crear Categoría

Crea una nueva categoría personalizada.

**Endpoint:**
```http
POST {{SUPABASE_URL}}/rest/v1/categories
```

**Headers:**
```http
apikey: {{SUPABASE_KEY}}
Authorization: Bearer {{ACCESS_TOKEN}}
Content-Type: application/json
Prefer: return=representation
```

**Request Body:**
```json
{
  "name": "Compras",
  "color": "bg-green-500",
  "created_by": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
}
```

**Campos Requeridos:**
- `name` ✅ (único por usuario)
- `created_by` ✅

**Campos Opcionales:**
- `color` (default: "bg-gray-500")

**Response (201 Created):**
```json
[
  {
    "id": "d6e7f8g9-01bc-def1-2345-67890abcdef1",
    "name": "Compras",
    "color": "bg-green-500",
    "created_by": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "created_at": "2026-01-30T10:05:00.000Z"
  }
]
```

---

### 3. Actualizar Categoría

Modifica una categoría existente.

**Endpoint:**
```http
PATCH {{SUPABASE_URL}}/rest/v1/categories?id=eq.{{CATEGORY_ID}}
```

**Headers:**
```http
apikey: {{SUPABASE_KEY}}
Authorization: Bearer {{ACCESS_TOKEN}}
Content-Type: application/json
Prefer: return=representation
```

**Request Body:**
```json
{
  "name": "Compras del Mes",
  "color": "bg-purple-500"
}
```

**Response (200 OK):**
```json
[
  {
    "id": "d6e7f8g9-01bc-def1-2345-67890abcdef1",
    "name": "Compras del Mes",
    "color": "bg-purple-500",
    "created_by": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "created_at": "2026-01-30T10:05:00.000Z"
  }
]
```

---

### 4. Eliminar Categoría

Elimina una categoría.

**Endpoint:**
```http
DELETE {{SUPABASE_URL}}/rest/v1/categories?id=eq.{{CATEGORY_ID}}
```

**Headers:**
```http
apikey: {{SUPABASE_KEY}}
Authorization: Bearer {{ACCESS_TOKEN}}
```

**Response (204 No Content)**

**⚠️ Advertencia:** Los recordatorios asociados NO se eliminan automáticamente. Reasigna o elimina recordatorios antes de borrar una categoría.

---

## 🗺️ Integración con Google Maps

### 1. Geocoding - Dirección a Coordenadas

Convierte una dirección en coordenadas (lat/lng).

**Endpoint:**
```http
GET https://maps.googleapis.com/maps/api/geocode/json?address=1600+Amphitheatre+Parkway,+Mountain+View,+CA&key={{GOOGLE_MAPS_API_KEY}}
```

**Query Parameters:**
- `address` - Dirección a geocodificar (URL encoded)
- `key` - API Key de Google Maps

**Response (200 OK):**
```json
{
  "results": [
    {
      "geometry": {
        "location": {
          "lat": 37.4224764,
          "lng": -122.0842499
        },
        "location_type": "ROOFTOP"
      },
      "formatted_address": "1600 Amphitheatre Parkway, Mountain View, CA 94043, USA",
      "place_id": "ChIJ2eUgeAK6j4ARbn5u_wAGqWA"
    }
  ],
  "status": "OK"
}
```

---

### 2. Reverse Geocoding - Coordenadas a Dirección

Convierte coordenadas en dirección legible.

**Endpoint:**
```http
GET https://maps.googleapis.com/maps/api/geocode/json?latlng=40.7128,-74.0060&key={{GOOGLE_MAPS_API_KEY}}
```

**Query Parameters:**
- `latlng` - Coordenadas: latitud,longitud
- `key` - API Key de Google Maps

**Response (200 OK):**
```json
{
  "results": [
    {
      "formatted_address": "New York, NY, USA",
      "geometry": {
        "location": {
          "lat": 40.7127753,
          "lng": -74.0059728
        }
      },
      "place_id": "ChIJOwg_06VPwokRYv534QaPC8g"
    }
  ],
  "status": "OK"
}
```

---

### 3. Places Autocomplete

Obtiene sugerencias mientras el usuario escribe.

**Endpoint:**
```http
GET https://maps.googleapis.com/maps/api/place/autocomplete/json?input=supermercado&key={{GOOGLE_MAPS_API_KEY}}&language=es
```

**Query Parameters:**
- `input` - Texto parcial
- `key` - API Key
- `language` - Código de idioma (es, en, etc.)
- `location` (opcional) - lat,lng para priorizar resultados cercanos
- `radius` (opcional) - Radio en metros

**Response (200 OK):**
```json
{
  "predictions": [
    {
      "description": "Supermercado Central",
      "place_id": "ChIJ...",
      "structured_formatting": {
        "main_text": "Supermercado Central",
        "secondary_text": "123 Main St, New York"
      }
    }
  ],
  "status": "OK"
}
```

---

### 4. Place Details

Obtiene detalles completos de un lugar por su place_id.

**Endpoint:**
```http
GET https://maps.googleapis.com/maps/api/place/details/json?place_id=PLACE_ID&key={{GOOGLE_MAPS_API_KEY}}&fields=name,formatted_address,geometry
```

**Query Parameters:**
- `place_id` - ID del lugar (desde Autocomplete)
- `key` - API Key
- `fields` - Campos específicos (optimiza costos)

**Campos disponibles:**
- `name`, `formatted_address`, `geometry`
- `opening_hours`, `rating`, `photos`
- `phone_number`, `website`

**Response (200 OK):**
```json
{
  "result": {
    "name": "Supermercado Central",
    "formatted_address": "123 Main St, New York, NY 10001, USA",
    "geometry": {
      "location": {
        "lat": 40.7128,
        "lng": -74.0060
      }
    }
  },
  "status": "OK"
}
```

---

## 📊 Modelos de Datos

### Reminder (Recordatorio)

```typescript
interface Reminder {
  id: string;                    // UUID generado por Supabase
  user_id: string;               // UUID del usuario propietario
  title: string;                 // Título del recordatorio
  description?: string;          // Descripción opcional
  category_id: string;           // UUID de la categoría
  latitude: number;              // Coordenada de latitud
  longitude: number;             // Coordenada de longitud
  location_name: string;         // Nombre del lugar
  location_address?: string;     // Dirección completa
  radius_meters: number;         // Radio de proximidad (default: 500)
  is_completed: boolean;         // Estado de completado (default: false)
  notification_enabled: boolean; // Notificaciones activas (default: true)
  created_at: string;            // Timestamp ISO 8601
  updated_at: string;            // Timestamp ISO 8601
}
```

### Category (Categoría)

```typescript
interface Category {
  id: string;         // UUID generado por Supabase
  name: string;       // Nombre de la categoría (único por usuario)
  color: string;      // Clase CSS de Tailwind (ej: "bg-blue-500")
  created_by: string; // UUID del usuario propietario
  created_at: string; // Timestamp ISO 8601
}
```

### User (Usuario)

```typescript
interface User {
  id: string;                   // UUID del usuario
  email: string;                // Email único
  created_at: string;           // Timestamp ISO 8601
  updated_at: string;           // Timestamp ISO 8601
  email_confirmed_at?: string;  // Timestamp de confirmación
}
```

### AuthResponse (Respuesta de Autenticación)

```typescript
interface AuthResponse {
  access_token: string;   // JWT Token
  token_type: "bearer";   // Tipo de token
  expires_in: number;     // Segundos hasta expiración (3600)
  refresh_token: string;  // Token para renovar sesión
  user: User;             // Datos del usuario
}
```

---

## ⚠️ Códigos de Error

### HTTP Status Codes

| Código | Significado | Descripción |
|--------|-------------|-------------|
| 200 | OK | Petición exitosa |
| 201 | Created | Recurso creado exitosamente |
| 204 | No Content | Operación exitosa sin contenido de respuesta |
| 400 | Bad Request | Datos inválidos en la petición |
| 401 | Unauthorized | Token inválido o expirado |
| 403 | Forbidden | Sin permisos para realizar la operación |
| 404 | Not Found | Recurso no encontrado |
| 409 | Conflict | Conflicto (ej: email ya registrado) |
| 422 | Unprocessable Entity | Validación fallida |
| 500 | Internal Server Error | Error del servidor |

### Errores Comunes de Supabase

```json
{
  "code": "23505",
  "message": "duplicate key value violates unique constraint",
  "details": "Key (email)=(usuario@ejemplo.com) already exists."
}
```

### Errores de Google Maps

| Status | Descripción |
|--------|-------------|
| OK | Petición exitosa |
| ZERO_RESULTS | No se encontraron resultados |
| OVER_QUERY_LIMIT | Límite de consultas excedido |
| REQUEST_DENIED | API Key inválida o sin permisos |
| INVALID_REQUEST | Parámetros inválidos |

---

## 💻 Ejemplos de Uso

### Ejemplo 1: Flujo Completo de Autenticación y Creación

```bash
# 1. Registro
curl -X POST "https://YOUR_PROJECT_ID.supabase.co/auth/v1/signup" \
  -H "apikey: YOUR_SUPABASE_KEY" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@ejemplo.com","password":"password123"}'

# Respuesta incluye access_token y user.id

# 2. Crear una categoría
curl -X POST "https://YOUR_PROJECT_ID.supabase.co/rest/v1/categories" \
  -H "apikey: YOUR_KEY" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '{"name":"Compras","color":"bg-green-500","created_by":"USER_ID"}'

# 3. Crear recordatorio
curl -X POST "https://YOUR_PROJECT_ID.supabase.co/rest/v1/reminders" \
  -H "apikey: YOUR_SUPABASE_KEY" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '{
    "user_id":"USER_ID",
    "title":"Comprar leche",
    "category_id":"CATEGORY_ID",
    "latitude":40.7128,
    "longitude":-74.0060,
    "location_name":"Supermercado",
    "radius_meters":500
  }'
```

### Ejemplo 2: Búsqueda de Lugar con Google Maps

```javascript
// 1. Autocompletar lugar
const autocomplete = await fetch(
  `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=supermercado&language=es&key=YOUR_KEY`
);
const { predictions } = await autocomplete.json();
const placeId = predictions[0].place_id;

// 2. Obtener detalles del lugar
const details = await fetch(
  `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_address,geometry&key=YOUR_KEY`
);
const { result } = await details.json();

// 3. Usar en el recordatorio
const reminder = {
  title: "Comprar en " + result.name,
  latitude: result.geometry.location.lat,
  longitude: result.geometry.location.lng,
  location_name: result.name,
  location_address: result.formatted_address
};
```

---

## 📦 Colección de Postman

### 🎉 Colección Creada

He creado una colección completa en Postman con todos los endpoints documentados:

**Nombre:** `RemindMe API - Recordatorios con Geolocalización`

**Contenido:**
- ✅ 4 endpoints de autenticación
- ✅ 6 endpoints de recordatorios
- ✅ 4 endpoints de categorías
- ✅ 4 endpoints de Google Maps
- ✅ Variables pre-configuradas
- ✅ Scripts automáticos para guardar tokens

### Variables Incluidas

La colección incluye estas variables:

```
SUPABASE_URL = https://YOUR_PROJECT_ID.supabase.co
SUPABASE_KEY = your_supabase_anon_key_here
GOOGLE_MAPS_API_KEY = your_google_maps_api_key_here
ACCESS_TOKEN = (se llena automáticamente después del login)
USER_ID = (se llena automáticamente después del login)
```

### Cómo Usar la Colección

1. **Abre Postman** y busca la colección "RemindMe API"
2. **Ejecuta "Login User"** - El script guardará automáticamente tu token
3. **Prueba cualquier endpoint** - La autenticación se aplica automáticamente
4. **Variables dinámicas** - Reemplaza `{{REMINDER_ID}}` y `{{CATEGORY_ID}}` con valores reales

### Endpoints Destacados

**🔐 Authentication**
- Register User
- Login User (con auto-save de token)
- Get Current User
- Logout

**📝 Reminders**
- Get All Reminders (con filtros)
- Get Reminder by ID
- Create Reminder
- Update Reminder
- Mark as Completed
- Delete Reminder

**🏷️ Categories**
- Get All Categories
- Create Category
- Update Category
- Delete Category

**🗺️ Google Maps**
- Geocoding (Address → Coords)
- Reverse Geocoding (Coords → Address)
- Places Autocomplete
- Place Details

---

## 📚 Referencias

- [Supabase REST API Docs](https://supabase.com/docs/guides/api)
- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Google Maps Geocoding API](https://developers.google.com/maps/documentation/geocoding)
- [Google Maps Places API](https://developers.google.com/maps/documentation/places/web-service)

---

## 🤝 Soporte

Para más información sobre variables de entorno y configuración, consulta:
- [ENVIRONMENT_VARIABLES.md](./ENVIRONMENT_VARIABLES.md)
- [README.md](./README.md)

---

**Última actualización:** Enero 30, 2026  
**Versión:** 1.0.0  
**Estado:** ✅ Documentación completa y colección Postman creada
