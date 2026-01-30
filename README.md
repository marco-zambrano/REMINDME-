# RemindMe

App para crear recordatorios que se activan cuando llegas a una ubicación específica.

## Demo en Vivo

- [Azure](https://remindme-dubxaedzd8aff3cf.canadacentral-01.azurewebsites.net/home)
- [Google Cloud](https://remindme-705782152648.us-central1.run.app/home)

## ¿Cómo funciona?

1. Te registras con tu email
2. Creas un recordatorio con título y ubicación
3. Seleccionas en el mapa dónde quieres ser recordado
4. La app usa GPS para detectar cuándo llegas
5. Recibes una notificación cuando estés cerca

## Instalar localmente

### Requisitos
- Node.js 18+
- npm

### Pasos

1. Clona el proyecto
`bash
git clone https://github.com/marco-zambrano/REMINDME-.git
cd REMINDME-
`

2. Instala dependencias
`bash
npm install
`

3. Configura el archivo src/environments/environment.ts con tus credenciales de Supabase y Google Maps

4. Inicia la app
`bash
npm start
`

Abre http://localhost:4200

## Comandos

`bash
npm start          # Inicia el servidor de desarrollo
npm run build:prod # Build para producción
npm test           # Ejecuta las pruebas
`

## Repositorio

[marco-zambrano/REMINDME-](https://github.com/marco-zambrano/REMINDME-)
