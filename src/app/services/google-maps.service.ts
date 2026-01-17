import { Injectable } from '@angular/core';

declare const google: any;

export interface GoogleMapsLocation {
  latitude: number;
  longitude: number;
  address?: string;
  name?: string;
}

@Injectable({
  providedIn: 'root',
})
export class GoogleMapsService {
  private isLoaded = false;
  private loadingPromise: Promise<void> | null = null;

  constructor() {}

  /**
   * Carga el script de Google Maps API
   */
  loadGoogleMaps(apiKey: string): Promise<void> {
    if (this.isLoaded) {
      return Promise.resolve();
    }

    if (this.loadingPromise) {
      return this.loadingPromise;
    }

    this.loadingPromise = new Promise((resolve, reject) => {
      // Verificar si ya existe el script
      if (typeof google !== 'undefined' && google.maps) {
        this.isLoaded = true;
        resolve();
        return;
      }

      // Función para manejar errores de Google Maps
      (window as any).gm_authFailure = () => {
        reject(new Error('Error de autenticación de Google Maps. Verifica tu API Key.'));
      };

      // Crear el script
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&language=es`;
      script.async = true;
      script.defer = true;

      script.onload = () => {
        // Verificar si hubo error de autenticación
        if ((window as any).gm_authFailure_called) {
          return; // Ya se rechazó la promesa
        }
        this.isLoaded = true;
        resolve();
      };

      script.onerror = (error) => {
        console.error('Error al cargar el script de Google Maps:', error);
        reject(new Error('Error al cargar Google Maps API. Verifica tu conexión a internet.'));
      };

      document.head.appendChild(script);
    });

    return this.loadingPromise;
  }

  /**
   * Verifica si Google Maps está cargado
   */
  isGoogleMapsLoaded(): boolean {
    return this.isLoaded && typeof google !== 'undefined' && google.maps;
  }

  /**
   * Obtiene la dirección a partir de coordenadas (Geocoding inverso)
   */
  async getAddressFromCoordinates(
    lat: number,
    lng: number,
  ): Promise<{ address: string; name: string }> {
    if (!this.isGoogleMapsLoaded()) {
      throw new Error('Google Maps no está cargado');
    }

    const geocoder = new google.maps.Geocoder();
    const latlng = { lat, lng };

    return new Promise((resolve, reject) => {
      geocoder.geocode({ location: latlng }, (results: any[], status: string) => {
        if (status === 'OK' && results && results.length > 0) {
          const result = results[0];
          const address = result.formatted_address || '';

          // Intentar obtener un nombre más específico (ej: nombre del negocio)
          let name = '';
          if (result.address_components && result.address_components.length > 0) {
            // Buscar el primer componente que no sea el número de calle
            const firstComponent = result.address_components.find(
              (comp: any) => !comp.types.includes('street_number'),
            );
            name = firstComponent
              ? firstComponent.long_name
              : result.address_components[0].long_name;
          }

          resolve({ address, name: name || 'Ubicación seleccionada' });
        } else {
          reject(new Error('No se pudo obtener la dirección'));
        }
      });
    });
  }

  /**
   * Obtiene coordenadas a partir de una dirección (Geocoding)
   */
  async getCoordinatesFromAddress(address: string): Promise<{ lat: number; lng: number }> {
    if (!this.isGoogleMapsLoaded()) {
      throw new Error('Google Maps no está cargado');
    }

    const geocoder = new google.maps.Geocoder();

    return new Promise((resolve, reject) => {
      geocoder.geocode({ address }, (results: any[], status: string) => {
        if (status === 'OK' && results && results.length > 0) {
          const location = results[0].geometry.location;
          resolve({
            lat: location.lat(),
            lng: location.lng(),
          });
        } else {
          reject(new Error('No se pudo encontrar la ubicación'));
        }
      });
    });
  }
}
