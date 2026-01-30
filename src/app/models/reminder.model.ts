export enum ReminderCategory {
  PERSONAL = 'personal',
  TRABAJO = 'trabajo',
  COMPRAS = 'compras',
  SALUD = 'salud',
}

export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
  name?: string;
}

export interface Reminder {
  id?: string;
  userId: string;
  title: string;
  description: string;
  category: string;
  location: Location;
  radius: number; //radio en metros
  completed: boolean;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  notified?: boolean;
  // Campos para activación temporal
  scheduledTime?: Date; // Fecha/hora para activar automáticamente
  isTimeActivated?: boolean; // Si ya fue activado por tiempo
  activationType?: 'location' | 'time' | 'both'; // Tipo de activación
}

export interface ReminderFilter {
  category?: string;
  completed?: boolean;
  userId?: string;
}

export interface ReminderStats {
  total: number;
  active: number;
  completed: number;
  byCategory: Record<string, number>;
}
