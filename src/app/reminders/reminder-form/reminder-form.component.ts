import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { ReminderService } from '../../services/reminder.service';
import { GeolocationService } from '../../services/geolocation.service';
import { SupabaseService } from '../../services/supabase.service';
import { Location, Category } from '../../models';
import { CategoryService } from '../../services/category.service';
import { IconNamePipe } from '../../shared/icon-name.pipe';
import { LocationPickerComponent } from '../../shared/location-picker/location-picker.component';
import { GoogleMapsLocation } from '../../services/google-maps.service';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-reminder-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, IconNamePipe, LocationPickerComponent, TranslatePipe],
  templateUrl: './reminder-form.component.html',
  styleUrls: ['./reminder-form.component.css'],
})
export class ReminderFormComponent implements OnInit {
  private readonly reminderService = inject(ReminderService);
  private readonly geolocationService = inject(GeolocationService);
  private readonly supabaseService = inject(SupabaseService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly categoryService = inject(CategoryService);

  // Estado del formulario
  isEditMode = signal(false);
  reminderId = signal<string | null>(null);
  isSaving = signal(false);
  message = signal<{ type: 'success' | 'error'; text: string } | null>(null);

  // Datos del formulario
  title = signal('');
  description = signal('');

  // 🔑 CAMBIO: categoryId ahora guarda el UUID (o slug temporal en el formulario)
  // Usamos 'slug' en el <select> del template, por eso mantenemos el tipo string.
  categorySlug = signal<string>('');
  radius = signal(500);

  // Campos de activación temporal
  activationType = signal<'location' | 'time' | 'both'>('location');
  scheduledTime = signal<string>('');

  // Ubicación
  location = signal<Location | null>(null);
  locationName = signal('');
  locationAddress = signal('');
  isLoadingLocation = signal(false);
  showMapPicker = signal(false);

  // Categorías dinámicas
  categories = signal<Category[]>([]);

  // Opciones de radio predefinidas
  radiusOptions = [
    { value: 100, label: '100m' },
    { value: 250, label: '250m' },
    { value: 500, label: '500m' },
    { value: 1000, label: '1km' },
    { value: 2000, label: '2km' },
  ];

  ngOnInit() {
    // Cargar categorías dinámicas y suscribirse a cambios
    this.categoryService.refresh();
    this.categoryService.categories$.subscribe((cats) => {
      this.categories.set(cats);

      // Si estamos en modo creación y no hay categoría seleccionada, usar la primera
      if (!this.isEditMode() && !this.categorySlug() && cats.length > 0) {
        this.categorySlug.set(cats[0].slug);
      }

      // Si estamos en modo edición, intentamos mapear el UUID a un slug
      if (
        this.isEditMode() &&
        this.categorySlug() &&
        !cats.some((c) => c.slug === this.categorySlug())
      ) {
        this.mapCategoryUuidToSlug(this.categorySlug());
      }
    });

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

  /**
   * 🔑 CORRECCIÓN CLAVE para el modo Edición:
   * Mapea el UUID cargado del recordatorio de vuelta al slug para que el <select> funcione.
   */
  private mapCategoryUuidToSlug(uuid: string): void {
    const category = this.categories().find((c) => c.id === uuid);
    if (category) {
      this.categorySlug.set(category.slug);
    } else {
      // Si no encontramos la categoría (ej. fue eliminada), seleccionamos la primera.
      this.categorySlug.set(this.categories()[0]?.slug || '');
    }
  }

  async loadReminder(id: string) {
    try {
      const reminder = await this.reminderService.getReminderById(id);
      if (reminder) {
        this.title.set(reminder.title);
        this.description.set(reminder.description);

        // El servicio carga el UUID en .category. Aquí lo guardamos temporalmente
        // y luego usamos mapCategoryUuidToSlug cuando las categorías estén listas
        this.categorySlug.set(reminder.category);
        this.radius.set(reminder.radius);

        // Cargar tipo de activación y fecha programada
        this.activationType.set(reminder.activationType || 'location');
        if (reminder.scheduledTime) {
          // Convertir Date a formato datetime-local (YYYY-MM-DDTHH:mm)
          const date = new Date(reminder.scheduledTime);
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          const hours = String(date.getHours()).padStart(2, '0');
          const minutes = String(date.getMinutes()).padStart(2, '0');
          this.scheduledTime.set(`${year}-${month}-${day}T${hours}:${minutes}`);
        }

        // Asignación de campos de ubicación desde el objeto location
        this.location.set(reminder.location);
        this.locationName.set(reminder.location?.name || '');
        this.locationAddress.set(reminder.location?.address || '');
      } else {
        console.error('Recordatorio no encontrado:', id);
        this.message.set({ type: 'error', text: 'Recordatorio no encontrado.' });
        this.router.navigate(['/reminders']);
      }
    } catch (error) {
      console.error('Error cargando recordatorio:', error);
      this.message.set({ type: 'error', text: 'Error al cargar el recordatorio.' });
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
          console.warn('⚠️ No se pudo obtener la ubicación automáticamente:', error);
          // No mostrar mensaje de error intrusivo en carga automática
          // El usuario puede usar los botones para obtener ubicación manualmente
          this.isLoadingLocation.set(false);
        },
      });
    } catch (error) {
      console.warn('⚠️ Error al solicitar ubicación:', error);
      this.isLoadingLocation.set(false);
    }
  }

  useCurrentLocation() {
    this.isLoadingLocation.set(true);
    this.geolocationService.getCurrentPosition().subscribe({
      next: (loc) => {
        this.location.set(loc);
        this.locationName.set('Mi ubicación actual');
        this.locationAddress.set(`${loc.latitude.toFixed(4)}, ${loc.longitude.toFixed(4)}`);
        this.isLoadingLocation.set(false);
      },
      error: (error) => {
        console.error('Error obteniendo ubicación:', error);
        this.message.set({
          type: 'error',
          text: 'No se pudo obtener tu ubicación. Verifica los permisos del navegador o usa otra opción.',
        });
        this.isLoadingLocation.set(false);
      },
    });
  }

  async save() {
    // 1. Validaciones
    if (!this.title().trim() || !this.description().trim()) {
      this.message.set({ type: 'error', text: 'Por favor, completa título y descripción.' });
      return;
    }

    // Validar según el tipo de activación
    if (this.activationType() === 'time' || this.activationType() === 'both') {
      if (!this.scheduledTime()) {
        this.message.set({ type: 'error', text: 'Por favor, selecciona una fecha y hora de activación.' });
        return;
      }
      // Validar que la fecha sea futura
      const selectedDate = new Date(this.scheduledTime());
      if (selectedDate <= new Date()) {
        this.message.set({ type: 'error', text: 'La fecha de activación debe ser futura.' });
        return;
      }
    }

    const currentLoc = this.location();
    if ((this.activationType() === 'location' || this.activationType() === 'both') && !currentLoc) {
      this.message.set({ type: 'error', text: 'Por favor, selecciona una ubicación.' });
      return;
    }

    const user = this.supabaseService.getCurrentUser();
    if (!user) {
      this.message.set({ type: 'error', text: 'Debes iniciar sesión para crear recordatorios.' });
      this.router.navigate(['/auth/login']);
      return;
    }

    // 2. 🔑 OBTENER EL UUID DE LA CATEGORÍA (¡LA CORRECCIÓN CLAVE!)
    const selectedCategory = this.categoryService.getCategoryBySlug(this.categorySlug());

    if (!selectedCategory?.id) {
      this.message.set({
        type: 'error',
        text: 'La categoría seleccionada no es válida o no tiene ID.',
      });
      console.error('Error: Categoría no encontrada o sin ID para el slug:', this.categorySlug());
      return;
    }

    this.isSaving.set(true);
    this.message.set(null);

    try {
      // 3. Construir los datos del recordatorio con el UUID
      const reminderData: any = {
        userId: user.id,
        title: this.title(),
        description: this.description(),
        // 🔑 ENVIAMOS EL UUID (selectedCategory.id) A LA PROPIEDAD 'category'
        category: selectedCategory.id,
        radius: this.radius(), // Radio en metros
        completed: false,
        notified: false,
        // Campos de activación temporal
        activationType: this.activationType(),
        scheduledTime: this.scheduledTime() ? new Date(this.scheduledTime()) : null,
        isTimeActivated: false,
      };

      // Solo añadir ubicación si el tipo de activación lo requiere
      if (this.activationType() === 'location' || this.activationType() === 'both') {
        if (currentLoc) {
          reminderData.location = {
            latitude: currentLoc.latitude,
            longitude: currentLoc.longitude,
            name: this.locationName(),
            address: this.locationAddress(),
          };
        }
      } else {
        // Para activación solo por tiempo, usar ubicación predeterminada
        reminderData.location = {
          latitude: 0,
          longitude: 0,
          name: 'Sin ubicación',
          address: 'Activación por tiempo',
        };
      }

      if (this.isEditMode() && this.reminderId()) {
        const id = this.reminderId()!;
        await this.reminderService.updateReminder(id, reminderData);
        this.message.set({ type: 'success', text: 'Recordatorio actualizado correctamente.' });
      } else {
        await this.reminderService.createReminder(reminderData);
        this.message.set({ type: 'success', text: 'Recordatorio creado correctamente.' });
      }

      // 4. Navegar después de un breve momento para que el mensaje se vea
      setTimeout(() => this.router.navigate(['/reminders']), 1500);
    } catch (error) {
      console.error('Error guardando recordatorio:', error);
      this.message.set({ type: 'error', text: 'Error al guardar el recordatorio.' });
    } finally {
      this.isSaving.set(false);
    }
  }

  cancel() {
    // Reemplazamos confirm() con navegación directa (mejor para el entorno de ejecución)
    this.router.navigate(['/reminders']);
  }

  setManualLocation() {
    // Reemplazamos prompt() y alert() con manejo de errores en consola
    const latStr = globalThis.prompt('Ingresa la latitud:');
    const lngStr = globalThis.prompt('Ingresa la longitud:');

    if (latStr && lngStr) {
      const lat = Number.parseFloat(latStr);
      const lng = Number.parseFloat(lngStr);

      if (
        !Number.isNaN(lat) &&
        !Number.isNaN(lng) &&
        lat >= -90 &&
        lat <= 90 &&
        lng >= -180 &&
        lng <= 180
      ) {
        this.location.set({ latitude: lat, longitude: lng });
        this.locationAddress.set(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
        this.locationName.set(
          globalThis.prompt('Nombre del lugar (opcional):') || 'Ubicación personalizada',
        );
      } else {
        console.error('Coordenadas inválidas ingresadas manualmente.');
        this.message.set({ type: 'error', text: 'Coordenadas inválidas. Verifica los valores.' });
      }
    }
  }

  openMapPicker() {
    this.showMapPicker.set(true);
  }

  closeMapPicker() {
    this.showMapPicker.set(false);
  }

  onLocationSelected(location: GoogleMapsLocation) {
    this.location.set({
      latitude: location.latitude,
      longitude: location.longitude,
    });
    this.locationName.set(location.name || 'Ubicación seleccionada');
    this.locationAddress.set(
      location.address || `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`,
    );
    this.showMapPicker.set(false);
  }

  updateCategory(categorySlug: string) {
    this.categorySlug.set(categorySlug);
  }

  updateRadius(radius: number) {
    this.radius.set(radius);
  }

  updateActivationType(type: 'location' | 'time' | 'both') {
    this.activationType.set(type);
    // Limpiar scheduledTime si cambiamos a 'location'
    if (type === 'location') {
      this.scheduledTime.set('');
    }
  }

  getMinDateTime(): string {
    // Retorna la fecha/hora actual en formato datetime-local
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  formatScheduledTime(): string {
    if (!this.scheduledTime()) return '';
    const date = new Date(this.scheduledTime());
    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
