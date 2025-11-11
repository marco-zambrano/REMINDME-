import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReminderService } from '../../services/reminder.service';
import { NotificationService } from '../../services/notification.service';
import { GeolocationService } from '../../services/geolocation.service';
import { Reminder, ReminderCategory, ReminderStats } from '../../models';

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

  // Señales para estado reactivo
  reminders = signal<Reminder[]>([]);
  activeReminders = signal<Reminder[]>([]);
  completedReminders = signal<Reminder[]>([]);
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

    // Suscribirse a cambios en los recordatorios
    this.reminderService.reminders$.subscribe((reminders) => {
      this.reminders.set(reminders);
      this.filterReminders();
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

    // Filtrar por estado
    if (filter === 'active') {
      filtered = filtered.filter((r: Reminder) => !r.completed);
    } else if (filter === 'completed') {
      filtered = filtered.filter((r: Reminder) => r.completed);
    }

    // Filtrar por categoría
    if (category !== 'all') {
      filtered = filtered.filter((r: Reminder) => r.category === category);
    }

    if (filter === 'active') {
      this.activeReminders.set(filtered);
    } else if (filter === 'completed') {
      this.completedReminders.set(filtered);
    }
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
      },
      error: (error) => {
        console.error('Error obteniendo ubicación:', error);
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
}
