import { Injectable, ApplicationRef } from '@angular/core';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter, first, interval } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PwaService {
  private promptEvent: any;

  constructor(
    private swUpdate: SwUpdate,
    private appRef: ApplicationRef
  ) {
    this.initServiceWorker();
    this.checkForUpdates();
    this.handleInstallPrompt();
  }

  private initServiceWorker(): void {
    if (!this.swUpdate.isEnabled) {
      // Solo mostrar en desarrollo
      if (!this.isProduction()) {
        console.log('ℹ️ Service Worker estará disponible en producción (build)');
      }
      return;
    }

    console.log('✅ Service Worker habilitado');

    // Escuchar actualizaciones disponibles
    this.swUpdate.versionUpdates
      .pipe(
        filter((evt): evt is VersionReadyEvent => evt.type === 'VERSION_READY')
      )
      .subscribe(event => {
        console.log('🆕 Nueva versión disponible:', event.latestVersion);
        this.promptUserToUpdate();
      });

    // Escuchar errores no recuperables
    this.swUpdate.unrecoverable.subscribe(event => {
      console.error('❌ Error no recuperable en Service Worker:', event.reason);
      this.notifyUserOfError();
    });
  }

  private isProduction(): boolean {
    return window.location.protocol === 'https:' || window.location.hostname === 'localhost';
  }

  private checkForUpdates(): void {
    if (!this.swUpdate.isEnabled) {
      return;
    }

    // Verificar actualizaciones cada 6 horas
    const appIsStable$ = this.appRef.isStable.pipe(
      first(isStable => isStable === true)
    );

    const everySixHours$ = interval(6 * 60 * 60 * 1000);

    appIsStable$.subscribe(() => {
      everySixHours$.subscribe(() => {
        this.swUpdate.checkForUpdate().then(() => {
          console.log('Verificación de actualizaciones completada');
        });
      });
    });
  }

  private promptUserToUpdate(): void {
    const shouldUpdate = confirm(
      '¡Hay una nueva versión de RemindMe disponible! ¿Deseas actualizar ahora?'
    );

    if (shouldUpdate) {
      this.swUpdate.activateUpdate().then(() => {
        window.location.reload();
      });
    }
  }

  private notifyUserOfError(): void {
    alert(
      'Ocurrió un error con la aplicación. La página se recargará para intentar solucionarlo.'
    );
    window.location.reload();
  }

  private handleInstallPrompt(): void {
    window.addEventListener('beforeinstallprompt', (e: any) => {
      console.log('💡 Evento de instalación detectado');
      e.preventDefault();
      this.promptEvent = e;
      this.showInstallBanner();
    });

    window.addEventListener('appinstalled', () => {
      console.log('✅ PWA instalada exitosamente');
      this.promptEvent = null;
    });
  }

  private showInstallBanner(): void {
    // Aquí podrías mostrar un banner personalizado
    console.log('📱 La app puede ser instalada');
  }

  public async installPwa(): Promise<boolean> {
    if (!this.promptEvent) {
      console.log('No hay prompt de instalación disponible');
      return false;
    }

    this.promptEvent.prompt();
    const { outcome } = await this.promptEvent.userChoice;
    
    console.log(`Usuario ${outcome === 'accepted' ? 'aceptó' : 'rechazó'} la instalación`);
    
    if (outcome === 'accepted') {
      this.promptEvent = null;
      return true;
    }
    
    return false;
  }

  public canInstall(): boolean {
    return !!this.promptEvent;
  }

  public isInstalled(): boolean {
    // Verificar si la app está corriendo como PWA instalada
    return window.matchMedia('(display-mode: standalone)').matches ||
           (window.navigator as any).standalone === true;
  }
}
