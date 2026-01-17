export const environment = {
  production: true,
  supabaseUrl: (globalThis as any).ENV?.SUPABASE_URL || 'https://ebrtyrkyacahgkraxbwa.supabase.co',
  supabaseKey:
    (globalThis as any).ENV?.SUPABASE_KEY ||
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVicnR5cmt5YWNhaGdrcmF4YndhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3OTc4NjcsImV4cCI6MjA3ODM3Mzg2N30.mTVofKOZZ8AmGmFJzlnSkLg8zdvOpyTm9iVA3g43Tss',
  // Reemplaza 'TU_API_KEY_AQUI' con tu clave de API de Google Maps
  // Obtén una en: https://console.cloud.google.com/google/maps-apis
  googleMapsApiKey:
    (globalThis as any).ENV?.GOOGLE_MAPS_API_KEY || 'AIzaSyDUiE88hy3-JSp--ikfI81W-mYR0BkssuQ',
};
