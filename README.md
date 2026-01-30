# RemindMe

App para crear recordatorios que se activan cuando llegas a una ubicación específica. Usa tu ubicación GPS para notificarte cuando estés cerca de un lugar importante.

## Demo en Vivo

Prueba la app sin instalación:
- [Azure](https://remindme-dubxaedzd8aff3cf.canadacentral-01.azurewebsites.net/home)
- [Google Cloud](https://remindme-705782152648.us-central1.run.app/home)

## ¿Cómo funciona?

1. Te registras con tu email
2. Creas un recordatorio (ej: "Comprar leche en el supermercado")
3. Seleccionas la ubicación en el mapa
4. Defines un radio (ejemplo: 100 metros)
5. La app detecta cuándo llegas a esa zona usando GPS
6. Recibes una notificación cuando estés cerca

## Instalación

### Requisitos Previos

- **Node.js** versión 18 o superior
- **npm** (incluido con Node.js)
- Cuenta en **Supabase** (gratis en supabase.com)
- **API Key de Google Maps** (gratis en developers.google.com/maps)

### Pasos de Instalación

1. **Clona el repositorio**
`ash
git clone https://github.com/marco-zambrano/REMINDME-.git
cd REMINDME-
`

2. **Instala las dependencias**
`ash
npm install
`

3. **Configura las variables de entorno**

Edita el archivo src/environments/environment.ts:
`	ypescript
export const environment = {
  production: false,
  supabaseUrl: 'tu-url-supabase',
  supabaseKey: 'tu-key-supabase',
  googleMapsApiKey: 'tu-api-key-google-maps'
};
`

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

## 📡 Documentación de la API

El proyecto incluye documentación completa de todas las APIs utilizadas:

- **Supabase REST API** - Endpoints de recordatorios y categorías
- **Supabase Auth API** - Autenticación y gestión de usuarios
- **Google Maps API** - Geocodificación y búsqueda de lugares

🔧 **Colección Postman:** Se ha creado una colección completa en Postman con:
- ✅ 18 endpoints pre-configurados
- ✅ Variables de entorno automáticas
- ✅ Scripts de auto-guardado de tokens
- ✅ Ejemplos y descripciones detalladas

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
`

Abre tu navegador en http://localhost:4200

## Cómo Usar

### Crear una Cuenta

1. Ve a la página de registro
2. Ingresa tu email y contraseña
3. Confirma tu email
4. Ya puedes iniciar sesión

### Crear un Recordatorio

1. Haz clic en "Nuevo Recordatorio"
2. Completa los campos:
   - **Título**: Qué necesitas recordar (ej: "Comprar leche")
   - **Descripción**: Detalles adicionales (opcional)
   - **Categoría**: Selecciona o crea una categoría (Trabajo, Personal, Compras, etc)
   - **Ubicación**: Haz clic en el mapa y marca el lugar
   - **Radio de Notificación**: Define a qué distancia te notificará (en metros)
3. Guarda el recordatorio

### Gestionar Recordatorios

- **Ver todos**: Se muestran en la página principal
- **Editar**: Haz clic en un recordatorio para modificarlo
- **Eliminar**: Elimina recordatorios que ya no necesites
- **Marcar como completado**: Indica cuándo ya lo hiciste

### Configuración

- **Cambiar idioma**: Inglés o Español
- **Modo oscuro**: Activa desde las opciones
- **Notificaciones**: Habilita o deshabilita alertas

## Comandos Disponibles

`ash
npm start              # Inicia el servidor de desarrollo en http://localhost:4200
npm run build:prod     # Crea una versión optimizada para producción
npm test               # Ejecuta las pruebas unitarias
npm run watch          # Modo observación para cambios automáticos
`

## Características

-  Recordatorios basados en ubicación GPS
-  Autenticación segura con Supabase
-  Integración con Google Maps
-  Notificaciones en tiempo real
-  Categorías para organizar recordatorios
-  Multiidioma (Español e Inglés)
-  Modo oscuro
-  Funciona en dispositivos móviles
-  PWA (se puede instalar como app)

## Stack Tecnológico

- **Frontend**: Angular 20, TypeScript
- **Estilos**: Tailwind CSS 4
- **Backend**: Supabase (PostgreSQL)
- **Autenticación**: Supabase Auth
- **Mapas**: Google Maps API
- **Testing**: Jasmine y Karma
- **i18n**: ngx-translate

## Contribuir

¿Encontraste un bug o tienes una sugerencia?

1. [Abre un issue](https://github.com/marco-zambrano/REMINDME-/issues) describiendo el problema
2. O haz un fork y crea un Pull Request

Ver [CONTRIBUTING.md](CONTRIBUTING.md) para más detalles.

## Repositorio

[marco-zambrano/REMINDME-](https://github.com/marco-zambrano/REMINDME-)

---

¿Te gusta RemindMe?  Apóyalo dando una estrella en GitHub
