import {
  Component,
  OnInit,
  OnDestroy,
  Output,
  EventEmitter,
  Input,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { GoogleMapsService, GoogleMapsLocation } from '../../services/google-maps.service';
import { environment } from '../../../environments/environment';

declare const google: any;

@Component({
  selector: 'app-location-picker',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './location-picker.component.html',
  styleUrls: ['./location-picker.component.css'],
})
export class LocationPickerComponent implements OnInit, OnDestroy {
  private readonly googleMapsService = inject(GoogleMapsService);

  @Input() initialLatitude?: number;
  @Input() initialLongitude?: number;
  @Output() locationSelected = new EventEmitter<GoogleMapsLocation>();
  @Output() locationCancel = new EventEmitter<void>();

  map: any;
  marker: any;
  searchBox: any;
  isLoading = signal(true);
  errorMessage = signal('');
  searchQuery = signal('');

  ngOnInit() {
    (async () => {
      try {
        // Cargar Google Maps API
        await this.googleMapsService.loadGoogleMaps(environment.googleMapsApiKey);
        this.initMap();
      } catch (error: any) {
        console.error('Error al cargar Google Maps:', error);
        const errorMsg =
          error?.message || 'Error al cargar el mapa. Verifica tu conexión a internet.';
        this.errorMessage.set(errorMsg);
        this.isLoading.set(false);
      }
    })();
  }

  ngOnDestroy() {
    // Limpiar referencias
    if (this.searchBox) {
      google.maps.event.clearInstanceListeners(this.searchBox);
    }
    if (this.map) {
      google.maps.event.clearInstanceListeners(this.map);
    }
  }

  private initMap() {
    const mapElement = document.getElementById('google-map');
    if (!mapElement) {
      this.errorMessage.set('No se pudo encontrar el elemento del mapa');
      this.isLoading.set(false);
      return;
    }

    // Coordenadas iniciales (usar las proporcionadas o Madrid por defecto)
    const initialLat = this.initialLatitude ?? 40.4168;
    const initialLng = this.initialLongitude ?? -3.7038;

    // Crear el mapa
    this.map = new google.maps.Map(mapElement, {
      center: { lat: initialLat, lng: initialLng },
      zoom: 15,
      mapTypeControl: true,
      streetViewControl: true,
      fullscreenControl: true,
      zoomControl: true,
      gestureHandling: 'greedy',
    });

    // Crear el marcador
    this.marker = new google.maps.Marker({
      position: { lat: initialLat, lng: initialLng },
      map: this.map,
      draggable: true,
      animation: google.maps.Animation.DROP,
      title: 'Arrastra para seleccionar ubicación',
    });

    // Evento cuando se arrastra el marcador
    this.marker.addListener('dragend', () => {
      const position = this.marker.getPosition();
      this.map.panTo(position);
      this.updateLocationFromMarker();
    });

    // Evento de clic en el mapa
    this.map.addListener('click', (event: any) => {
      this.placeMarker(event.latLng);
    });

    // Configurar búsqueda de lugares
    this.setupSearchBox();

    this.isLoading.set(false);
  }

  private setupSearchBox() {
    const input = document.getElementById('map-search-input') as HTMLInputElement;
    if (!input) return;

    // Crear el SearchBox
    this.searchBox = new google.maps.places.SearchBox(input);

    // Bias the SearchBox results towards current map's viewport
    this.map.addListener('bounds_changed', () => {
      this.searchBox.setBounds(this.map.getBounds());
    });

    // Listen for the event fired when the user selects a prediction
    this.searchBox.addListener('places_changed', () => {
      const places = this.searchBox.getPlaces();

      if (places.length === 0) {
        return;
      }

      // Para cada lugar, obtener el ícono, nombre y ubicación
      const bounds = new google.maps.LatLngBounds();
      places.forEach((place: any) => {
        if (!place.geometry?.location) {
          console.log('El lugar no tiene geometría');
          return;
        }

        // Mover el marcador al lugar seleccionado
        this.placeMarker(place.geometry.location);

        if (place.geometry.viewport) {
          // Solo geocodificaciones tienen viewport
          bounds.union(place.geometry.viewport);
        } else {
          bounds.extend(place.geometry.location);
        }
      });

      this.map.fitBounds(bounds);
    });
  }

  private placeMarker(location: any) {
    this.marker.setPosition(location);
    this.map.panTo(location);
    this.updateLocationFromMarker();
  }

  private async updateLocationFromMarker() {
    const position = this.marker.getPosition();
    const lat = position.lat();
    const lng = position.lng();

    try {
      const { address, name } = await this.googleMapsService.getAddressFromCoordinates(lat, lng);
      // No emitimos automáticamente, esperamos a que el usuario confirme
      console.log('Ubicación actualizada:', { lat, lng, address, name });
    } catch (error) {
      console.error('Error al obtener dirección:', error);
    }
  }

  async confirmLocation() {
    const position = this.marker.getPosition();
    const lat = position.lat();
    const lng = position.lng();

    try {
      const { address, name } = await this.googleMapsService.getAddressFromCoordinates(lat, lng);

      const location: GoogleMapsLocation = {
        latitude: lat,
        longitude: lng,
        address,
        name,
      };

      this.locationSelected.emit(location);
    } catch (error) {
      console.error('Error al confirmar ubicación:', error);
      // Emitir sin dirección si falla el geocoding
      this.locationSelected.emit({
        latitude: lat,
        longitude: lng,
        address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
        name: 'Ubicación seleccionada',
      });
    }
  }

  onCancel() {
    this.locationCancel.emit();
  }

  centerOnCurrentLocation() {
    if (navigator.geolocation) {
      this.isLoading.set(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };

          this.map.setCenter(pos);
          this.map.setZoom(15);
          this.marker.setPosition(pos);
          this.updateLocationFromMarker();
          this.isLoading.set(false);
        },
        (error) => {
          console.error('Error al obtener ubicación actual:', error);
          this.errorMessage.set('No se pudo obtener tu ubicación actual');
          this.isLoading.set(false);
        },
      );
    } else {
      this.errorMessage.set('Tu navegador no soporta geolocalización');
    }
  }
}
