import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { ReminderService } from '../../services/reminder.service';
import { GeolocationService } from '../../services/geolocation.service';
import { SupabaseService } from '../../services/supabase.service';
import { ReminderCategory, Location } from '../../models';

@Component({
  selector: 'app-reminder-form',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './reminder-form.component.html',
  styleUrls: ['./reminder-form.component.css'],
})
export class ReminderFormComponent implements OnInit {
  private readonly reminderService = inject(ReminderService);
  private readonly geolocationService = inject(GeolocationService);
  private readonly supabaseService = inject(SupabaseService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  // Estado del formulario
  isEditMode = signal(false);
  reminderId = signal<string | null>(null);
  isSaving = signal(false);

  // Datos del formulario
  title = signal('');
  description = signal('');
  category = signal<ReminderCategory>(ReminderCategory.PERSONAL);
  radius = signal(500);

  // Ubicación
  location = signal<Location | null>(null);
  locationName = signal('');
  locationAddress = signal('');
  isLoadingLocation = signal(false);

  // Opciones de categoría
  categories = [
    { value: ReminderCategory.PERSONAL, label: 'Personal', icon: '👤' },
    { value: ReminderCategory.TRABAJO, label: 'Trabajo', icon: '💼' },
    { value: ReminderCategory.COMPRAS, label: 'Compras', icon: '🛒' },
    { value: ReminderCategory.SALUD, label: 'Salud', icon: '🏥' },
  ];

  // Opciones de radio predefinidas
  radiusOptions = [
    { value: 100, label: '100m' },
    { value: 250, label: '250m' },
    { value: 500, label: '500m' },
    { value: 1000, label: '1km' },
    { value: 2000, label: '2km' },
  ];

  ngOnInit() {
    // Verificar si es modo edición
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.reminderId.set(id);
      this.loadReminder(id);
    } else {
      // Modo creación: obtener ubicación actual
      this.getCurrentLocation();
    }
  }

  async loadReminder(id: string) {
    try {
      const reminder = await this.reminderService.getReminderById(id);
      if (reminder) {
        this.title.set(reminder.title);
        this.description.set(reminder.description);
        this.category.set(reminder.category);
        this.radius.set(reminder.radius);
        this.location.set(reminder.location);
        this.locationName.set(reminder.location.name || '');
        this.locationAddress.set(reminder.location.address || '');
      } else {
        alert('Recordatorio no encontrado');
        this.router.navigate(['/reminders']);
      }
    } catch (error) {
      console.error('Error cargando recordatorio:', error);
      alert('Error al cargar el recordatorio');
      this.router.navigate(['/reminders']);
    }
  }

  async getCurrentLocation() {
    this.isLoadingLocation.set(true);
    try {
      this.geolocationService.getCurrentPosition().subscribe({
        next: (loc) => {
          this.location.set(loc);
          this.locationName.set('Mi ubicación actual');
          this.locationAddress.set(`${loc.latitude.toFixed(4)}, ${loc.longitude.toFixed(4)}`);
          this.isLoadingLocation.set(false);
        },
        error: (error) => {
          console.error('Error obteniendo ubicación:', error);
          alert(
            'No se pudo obtener la ubicación actual. Por favor, ingresa las coordenadas manualmente.'
          );
          this.isLoadingLocation.set(false);
        },
      });
    } catch (error) {
      console.error('Error:', error);
      this.isLoadingLocation.set(false);
    }
  }

  useCurrentLocation() {
    this.getCurrentLocation();
  }

  async save() {
    // Validaciones
    if (!this.title().trim()) {
      alert('Por favor, ingresa un título');
      return;
    }

    if (!this.description().trim()) {
      alert('Por favor, ingresa una descripción');
      return;
    }

    if (!this.location()) {
      alert('Por favor, selecciona una ubicación');
      return;
    }

    const user = this.supabaseService.getCurrentUser();
    if (!user) {
      alert('Debes iniciar sesión para crear recordatorios');
      this.router.navigate(['/auth/login']);
      return;
    }

    this.isSaving.set(true);

    try {
      const reminderData = {
        userId: user.id,
        title: this.title(),
        description: this.description(),
        category: this.category(),
        radius: this.radius(),
        location: {
          ...this.location()!,
          name: this.locationName(),
          address: this.locationAddress(),
        },
        completed: false,
        notified: false,
      };

      if (this.isEditMode() && this.reminderId()) {
        // Actualizar recordatorio existente
        const id = this.reminderId();
        if (id) {
          await this.reminderService.updateReminder(id, reminderData);
        }
        alert('Recordatorio actualizado correctamente');
      } else {
        // Crear nuevo recordatorio
        await this.reminderService.createReminder(reminderData);
        alert('Recordatorio creado correctamente');
      }

      this.router.navigate(['/reminders']);
    } catch (error) {
      console.error('Error guardando recordatorio:', error);
      alert('Error al guardar el recordatorio');
    } finally {
      this.isSaving.set(false);
    }
  }

  cancel() {
    if (confirm('¿Deseas cancelar? Los cambios no guardados se perderán.')) {
      this.router.navigate(['/reminders']);
    }
  }

  setManualLocation() {
    const latStr = prompt('Ingresa la latitud:');
    const lngStr = prompt('Ingresa la longitud:');

    if (latStr && lngStr) {
      const lat = Number.parseFloat(latStr);
      const lng = Number.parseFloat(lngStr);

      if (!Number.isNaN(lat) && !Number.isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        this.location.set({ latitude: lat, longitude: lng });
        this.locationAddress.set(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
        this.locationName.set(prompt('Nombre del lugar (opcional):') || 'Ubicación personalizada');
      } else {
        alert('Coordenadas inválidas. Por favor, verifica los valores.');
      }
    }
  }

  updateCategory(category: ReminderCategory) {
    this.category.set(category);
  }

  updateRadius(radius: number) {
    this.radius.set(radius);
  }
}
