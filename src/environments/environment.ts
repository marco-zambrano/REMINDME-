export const environment = {
  production: true,
  supabaseUrl: (window as any).ENV?.SUPABASE_URL || 'https://ebrtyrkyacahgkraxbwa.supabase.co',
  supabaseKey: (window as any).ENV?.SUPABASE_KEY || '',
};
