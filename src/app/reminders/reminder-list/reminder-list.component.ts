import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ReminderService } from '../../services/reminder.service';
import { NotificationService } from '../../services/notification.service';
import { GeolocationService } from '../../services/geolocation.service';
import { SupabaseService } from '../../services/supabase.service';
import { PwaService } from '../../services/pwa.service';
import { Reminder, ReminderCategory, ReminderStats } from '../../models';
import { User } from '@supabase/supabase-js';

@Component({
  selector: 'app-reminder-list',
  imports: [CommonModule, RouterLink],
  templateUrl: './reminder-list.component.html',
  styleUrls: ['./reminder-list.component.css'],
})
export class ReminderListComponent implements OnInit {
  private readonly reminderService = inject(ReminderService);
  private readonly notificationService = inject(NotificationService);
  private readonly geolocationService = inject(GeolocationService);
  private readonly supabaseService = inject(SupabaseService);
  private readonly pwaService = inject(PwaService);
  private readonly router = inject(Router);

  // Señales para estado reactivo
  reminders = signal<Reminder[]>([]);
  activeReminders = signal<Reminder[]>([]);
  completedReminders = signal<Reminder[]>([]);
  currentUser = signal<User | null>(null);
  stats = signal<ReminderStats>({
    total: 0,
    active: 0,
    completed: 0,
    byCategory: {
      [ReminderCategory.PERSONAL]: 0,
      [ReminderCategory.TRABAJO]: 0,
      [ReminderCategory.COMPRAS]: 0,
      [ReminderCategory.SALUD]: 0,
    },
  });

  selectedFilter = signal<'all' | 'active' | 'completed'>('active');
  selectedCategory = signal<ReminderCategory | 'all'>('all');
  isMonitoring = signal(false);
  currentLocation = signal<{ latitude: number; longitude: number } | null>(null);

  // Enum para usar en el template
  ReminderCategory = ReminderCategory;

  ngOnInit() {
    this.initializeComponent();

    // Obtener usuario actual
    this.currentUser.set(this.supabaseService.getCurrentUser());

    // Suscribirse a cambios de usuario
    this.supabaseService.user$.subscribe((user) => {
      this.currentUser.set(user);
    });

    // Suscribirse a cambios en los recordatorios
    this.reminderService.reminders$.subscribe((reminders) => {
      console.log('🔄 Recordatorios actualizados:', reminders.length);
      this.reminders.set(reminders);
      this.filterReminders();
      this.loadStats(); // Actualizar estadísticas automáticamente
    });
  }

  private async initializeComponent() {
    await this.loadReminders();
    await this.loadStats();
    this.checkMonitoringStatus();
    this.getCurrentLocation();
  }

  async loadReminders() {
    const all = await this.reminderService.getReminders();
    const active = await this.reminderService.getActiveReminders();
    const completed = await this.reminderService.getCompletedReminders();

    this.reminders.set(all);
    this.activeReminders.set(active);
    this.completedReminders.set(completed);
  }

  async loadStats() {
    const stats = await this.reminderService.getStats();
    this.stats.set(stats);
  }

  filterReminders() {
    const filter = this.selectedFilter();
    const category = this.selectedCategory();

    let filtered = this.reminders();

    // Filtrar por categoría primero
    if (category !== 'all') {
      filtered = filtered.filter((r: Reminder) => r.category === category);
    }

    // Separar en activos y completados
    const active = filtered.filter((r: Reminder) => !r.completed);
    const completed = filtered.filter((r: Reminder) => r.completed);

    // Actualizar las listas
    this.activeReminders.set(active);
    this.completedReminders.set(completed);

    console.log('📊 Filtros aplicados - Activos:', active.length, 'Completados:', completed.length);
  }

  setFilter(filter: 'all' | 'active' | 'completed') {
    this.selectedFilter.set(filter);
    this.filterReminders();
  }

  setCategory(category: ReminderCategory | 'all') {
    this.selectedCategory.set(category);
    this.filterReminders();
  }

  async toggleComplete(reminder: Reminder) {
    if (reminder.id) {
      if (reminder.completed) {
        await this.reminderService.uncompleteReminder(reminder.id);
      } else {
        await this.reminderService.completeReminder(reminder.id);
      }
      await this.loadReminders();
      await this.loadStats();
    }
  }

  async deleteReminder(reminder: Reminder) {
    if (reminder.id && confirm(`¿Estás seguro de eliminar "${reminder.title}"?`)) {
      await this.reminderService.deleteReminder(reminder.id);
      await this.loadReminders();
      await this.loadStats();
    }
  }

  toggleMonitoring() {
    if (this.isMonitoring()) {
      this.notificationService.stopLocationMonitoring();
      this.isMonitoring.set(false);
    } else {
      this.notificationService.startLocationMonitoring();
      this.isMonitoring.set(true);
    }
  }

  checkMonitoringStatus() {
    this.isMonitoring.set(this.notificationService.isMonitoringActive());
  }

  getCurrentLocation() {
    this.geolocationService.getCurrentPosition().subscribe({
      next: (location) => {
        this.currentLocation.set(location);
        console.log('📍 Ubicación obtenida:', location.latitude.toFixed(4), location.longitude.toFixed(4));
      },
      error: (error) => {
        // No mostrar error si es solo timeout - la ubicación se obtendrá eventualmente
        console.warn('⚠️ No se pudo obtener ubicación inmediatamente, reintentando...');
        // Reintentar después de 5 segundos
        setTimeout(() => {
          this.geolocationService.getCurrentPosition().subscribe({
            next: (location) => {
              this.currentLocation.set(location);
              console.log('📍 Ubicación obtenida (reintento):', location.latitude.toFixed(4), location.longitude.toFixed(4));
            },
            error: () => {
              console.warn('⚠️ Ubicación no disponible. Las distancias no se mostrarán.');
            }
          });
        }, 5000);
      },
    });
  }

  getDistanceToReminder(reminder: Reminder): string {
    const current = this.currentLocation();
    if (!current) return 'Calculando...';

    const distance = this.geolocationService.calculateDistance(current, reminder.location);

    return this.geolocationService.formatDistance(distance);
  }

  getCategoryIcon(category: ReminderCategory): string {
    const icons = {
      [ReminderCategory.PERSONAL]: '👤',
      [ReminderCategory.TRABAJO]: '💼',
      [ReminderCategory.COMPRAS]: '🛒',
      [ReminderCategory.SALUD]: '🏥',
    };
    return icons[category] || '📌';
  }

  getCategoryColor(category: ReminderCategory): string {
    const colors = {
      [ReminderCategory.PERSONAL]: 'bg-blue-500',
      [ReminderCategory.TRABAJO]: 'bg-purple-500',
      [ReminderCategory.COMPRAS]: 'bg-green-500',
      [ReminderCategory.SALUD]: 'bg-red-500',
    };
    return colors[category] || 'bg-gray-500';
  }

  async refresh() {
    await this.reminderService.refresh();
    await this.loadStats();
    this.getCurrentLocation();
  }

  async logout() {
    if (confirm('¿Estás seguro de cerrar sesión?')) {
      await this.supabaseService.signOut();
      this.router.navigate(['/home']);
    }
  }

  canInstallPwa(): boolean {
    return this.pwaService.canInstall() && !this.pwaService.isInstalled();
  }

  async installPwa() {
    const installed = await this.pwaService.installPwa();
    if (installed) {
      console.log('✅ PWA instalada correctamente');
    }
  }
}
