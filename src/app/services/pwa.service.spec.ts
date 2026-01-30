import { ApplicationRef } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { PwaService } from './pwa.service';
import { Subject } from 'rxjs';

describe('PwaService', () => {
  let service: PwaService;
  let mockSwUpdate: jasmine.SpyObj<SwUpdate>;
  let mockAppRef: jasmine.SpyObj<ApplicationRef>;

  beforeEach(() => {
    const versionUpdatesSubject = new Subject();
    const unrecoverableSubject = new Subject();
    const isStableSubject = new Subject<boolean>();

    mockSwUpdate = jasmine.createSpyObj('SwUpdate', ['checkForUpdate', 'activateUpdate'], {
      isEnabled: true,
      versionUpdates: versionUpdatesSubject.asObservable(),
      unrecoverable: unrecoverableSubject.asObservable(),
    });

    mockAppRef = jasmine.createSpyObj('ApplicationRef', ['tick'], {
      isStable: isStableSubject.asObservable(),
    });

    // Emitir true después de crear el servicio
    setTimeout(() => isStableSubject.next(true), 0);

    service = new PwaService(mockSwUpdate as any, mockAppRef as any);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('canInstall', () => {
    it('should return false by default', () => {
      expect(service.canInstall()).toBe(false);
    });

    it('should return true when prompt event is available', () => {
      const mockEvent = {
        prompt: jasmine.createSpy(),
        userChoice: Promise.resolve({ outcome: 'accepted' }),
      };
      (service as any).promptEvent = mockEvent;

      expect(service.canInstall()).toBe(true);
    });
  });

  describe('isInstalled', () => {
    it('should check if app is running as PWA', () => {
      const result = service.isInstalled();
      expect(typeof result).toBe('boolean');
    });
  });

  describe('installPwa', () => {
    it('should return false if no prompt event is available', async () => {
      (service as any).promptEvent = undefined;
      const result = await service.installPwa();
      expect(result).toBe(false);
    });

    it('should prompt user and return true on acceptance', async () => {
      const mockEvent = {
        prompt: jasmine.createSpy('prompt'),
        userChoice: Promise.resolve({ outcome: 'accepted' }),
      };
      (service as any).promptEvent = mockEvent;
      const result = await service.installPwa();
      expect(mockEvent.prompt).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should prompt user and return false on dismissal', async () => {
      const mockEvent = {
        prompt: jasmine.createSpy('prompt'),
        userChoice: Promise.resolve({ outcome: 'dismissed' }),
      };
      (service as any).promptEvent = mockEvent;
      const result = await service.installPwa();
      expect(mockEvent.prompt).toHaveBeenCalled();
      expect(result).toBe(false);
    });
  });
});
