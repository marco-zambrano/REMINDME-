import { TestBed } from '@angular/core/testing';
import { GeolocationService } from './geolocation.service';
import { Location } from '../models';

describe('GeolocationService', () => {
  let service: GeolocationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GeolocationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('calculateDistance', () => {
    it('should calculate distance between two locations', () => {
      const location1: Location = { latitude: 40.7128, longitude: -74.006 }; // New York
      const location2: Location = { latitude: 34.0522, longitude: -118.2437 }; // Los Angeles

      const distance = service.calculateDistance(location1, location2);

      expect(distance).toBeGreaterThan(0);
      // Permitir una tolerancia mayor (20km)
      expect(Math.abs(distance - 3936000)).toBeLessThan(20000); // tolerancia de 20km
    });

    it('should return 0 for same location', () => {
      const location: Location = { latitude: 40.7128, longitude: -74.006 };

      const distance = service.calculateDistance(location, location);

      expect(distance).toBe(0);
    });

    it('should calculate small distances accurately', () => {
      const location1: Location = { latitude: 40.7128, longitude: -74.006 };
      const location2: Location = { latitude: 40.7138, longitude: -74.007 }; // ~150 metros

      const distance = service.calculateDistance(location1, location2);

      expect(distance).toBeGreaterThan(100);
      expect(distance).toBeLessThan(200);
    });
  });

  describe('isWithinRadius', () => {
    it('should return true when location is within radius', () => {
      const center: Location = { latitude: 40.7128, longitude: -74.006 };
      const target: Location = { latitude: 40.7138, longitude: -74.007 };

      const result = service.isWithinRadius(center, target, 200);

      expect(result).toBe(true);
    });

    it('should return false when location is outside radius', () => {
      const center: Location = { latitude: 40.7128, longitude: -74.006 };
      const target: Location = { latitude: 40.7138, longitude: -74.007 };

      const result = service.isWithinRadius(center, target, 50);

      expect(result).toBe(false);
    });

    it('should return true when location is exactly at radius boundary', () => {
      const center: Location = { latitude: 40.7128, longitude: -74.006 };
      const target: Location = { latitude: 40.7138, longitude: -74.007 };

      const distance = service.calculateDistance(center, target);
      const result = service.isWithinRadius(center, target, distance);

      expect(result).toBe(true);
    });
  });

  describe('formatDistance', () => {
    it('should format meters correctly', () => {
      expect(service.formatDistance(50)).toBe('50m');
      expect(service.formatDistance(999)).toBe('999m');
    });

    it('should format kilometers correctly', () => {
      expect(service.formatDistance(1000)).toBe('1.0km');
      expect(service.formatDistance(1500)).toBe('1.5km');
      expect(service.formatDistance(2345)).toBe('2.3km');
    });
  });

  describe('getCurrentPosition', () => {
    it('should return observable', () => {
      const observable = service.getCurrentPosition();
      expect(observable).toBeTruthy();
      expect(typeof observable.subscribe).toBe('function');
    });
  });

  describe('watchPosition', () => {
    it('should return observable', () => {
      const observable = service.watchPosition();
      expect(observable).toBeTruthy();
      expect(typeof observable.subscribe).toBe('function');
    });
  });

  describe('reverseGeocode', () => {
    it('should return formatted coordinates as string', async () => {
      const location: Location = { latitude: 40.7128, longitude: -74.006 };
      const result = await service.reverseGeocode(location);

      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
      expect(result).toContain('40.7128');
      // Acepta tanto '-74.006' como '-74.0060'
      expect(result).toMatch(/-74\.006(0)?/);
    });
  });
});
