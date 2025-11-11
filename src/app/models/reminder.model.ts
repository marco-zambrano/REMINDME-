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
  category: ReminderCategory;
  location: Location;
  radius: number; //radio en metros
  completed: boolean;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  notified?: boolean;
}

export interface ReminderFilter {
  category?: ReminderCategory;
  completed?: boolean;
  userId?: string;
}

export interface ReminderStats {
  total: number;
  active: number;
  completed: number;
  byCategory: Record<ReminderCategory, number>;
}
