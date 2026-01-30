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
          console.error('Error obteniendo ubicación:', error);
          this.message.set({
            type: 'error',
            text: 'No se pudo obtener la ubicación actual. Intenta manualmente.',
          });
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
    // 1. Validaciones
    if (!this.title().trim() || !this.description().trim()) {
      this.message.set({ type: 'error', text: 'Por favor, completa título y descripción.' });
      return;
    }

    const currentLoc = this.location();
    if (!currentLoc) {
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
      const reminderData = {
        userId: user.id,
        title: this.title(),
        description: this.description(),
        // 🔑 ENVIAMOS EL UUID (selectedCategory.id) A LA PROPIEDAD 'category'
        category: selectedCategory.id,
        radius: this.radius(), // Radio en metros
        location: {
          latitude: currentLoc.latitude,
          longitude: currentLoc.longitude,
          name: this.locationName(),
          address: this.locationAddress(),
        },
        completed: false,
        notified: false,
      };

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
}
