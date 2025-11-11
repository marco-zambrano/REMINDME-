import { Injectable } from '@angular/core';
import { Observable, Observer } from 'rxjs';
import { Location } from '../models';

@Injectable({
  providedIn: 'root',
})
export class GeolocationService {
  private readonly EARTH_RADIUS_METERS = 6371000; // Radio de la Tierra en metros

  constructor() {}

  /**
   * Calcula la distancia entre dos ubicaciones usando la fórmula de Haversine
   * @param location1 Primera ubicación
   * @param location2 Segunda ubicación
   * @returns Distancia en metros
   */
  calculateDistance(location1: Location, location2: Location): number {
    const lat1Rad = this.toRadians(location1.latitude);
    const lat2Rad = this.toRadians(location2.latitude);
    const deltaLat = this.toRadians(location2.latitude - location1.latitude);
    const deltaLon = this.toRadians(location2.longitude - location1.longitude);

    // Fórmula de Haversine
    const a =
      Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
      Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = this.EARTH_RADIUS_METERS * c;

    return Math.round(distance); // Redondear a metros enteros
  }

  /**
   * Verifica si una ubicación está dentro del radio especificado
   * @param center Ubicación central
   * @param target Ubicación objetivo
   * @param radius Radio en metros
   * @returns true si la ubicación objetivo está dentro del radio
   */
  isWithinRadius(center: Location, target: Location, radius: number): boolean {
    const distance = this.calculateDistance(center, target);
    return distance <= radius;
  }

  /**
   * Obtiene la posición actual del usuario
   * @returns Observable con la ubicación actual
   */
  getCurrentPosition(): Observable<Location> {
    return new Observable<Location>((observer: Observer<Location>) => {
      if (!navigator.geolocation) {
        observer.error('Geolocation is not supported by this browser.');
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location: Location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          observer.next(location);
          observer.complete();
        },
        (error) => {
          observer.error(this.handleGeolocationError(error));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    });
  }

  /**
   * Observa la posición del usuario continuamente
   * @returns Observable que emite actualizaciones de ubicación
   */
  watchPosition(): Observable<Location> {
    return new Observable<Location>((observer: Observer<Location>) => {
      if (!navigator.geolocation) {
        observer.error('Geolocation is not supported by this browser.');
        return;
      }

      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const location: Location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          observer.next(location);
        },
        (error) => {
          observer.error(this.handleGeolocationError(error));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );

      // Cleanup cuando se desuscribe
      return () => {
        navigator.geolocation.clearWatch(watchId);
      };
    });
  }

  /**
   * Convierte grados a radianes
   * @param degrees Grados
   * @returns Radianes
   */
  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Maneja errores de geolocalización
   * @param error Error de geolocalización
   * @returns Mensaje de error legible
   */
  private handleGeolocationError(error: GeolocationPositionError): string {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        return 'User denied the request for Geolocation.';
      case error.POSITION_UNAVAILABLE:
        return 'Location information is unavailable.';
      case error.TIMEOUT:
        return 'The request to get user location timed out.';
      default:
        return 'An unknown error occurred.';
    }
  }

  /**
   * Obtiene la dirección a partir de coordenadas usando Geocoding Reverso
   * Esta es una funcionalidad opcional que se puede implementar con servicios externos
   * @param location Ubicación
   * @returns Dirección legible
   */
  async reverseGeocode(location: Location): Promise<string> {
    // Implementación futura con API de geocoding (Google Maps, OpenStreetMap, etc.)
    return `${location.latitude}, ${location.longitude}`;
  }

  /**
   * Formatea la distancia para mostrar al usuario
   * @param meters Distancia en metros
   * @returns Distancia formateada
   */
  formatDistance(meters: number): string {
    if (meters < 1000) {
      return `${Math.round(meters)}m`;
    } else {
      return `${(meters / 1000).toFixed(1)}km`;
    }
  }
}
