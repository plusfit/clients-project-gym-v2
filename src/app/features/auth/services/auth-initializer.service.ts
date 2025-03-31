import { Injectable } from '@angular/core';
import { AuthFacadeService } from './auth-facade.service';
import { Observable, of } from 'rxjs';
import { take, filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthInitializerService {
  constructor(private authFacade: AuthFacadeService) {}

  /**
   * Inicializa la autenticación al arrancar la aplicación
   */
  init(): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      // Verificamos si hay un token guardado
      const token = localStorage.getItem('token');

      if (token) {
        // Si hay token, intentamos obtener el usuario
        this.authFacade.getCurrentUser();

        // Esperamos a que se complete la autenticación
        this.authFacade.isAuthenticated$
          .pipe(
            filter((isAuth) => isAuth === true),
            take(1),
          )
          .subscribe({
            next: () => resolve(true),
            error: () => {
              // Si hay error, eliminamos el token
              localStorage.removeItem('token');
              resolve(false);
            },
          });
      } else {
        // Si no hay token, intentamos login automático si estamos en desarrollo
        if (this.isDevelopmentEnvironment()) {
          const mockEmail = 'steelparadisegym@gmail.com';
          const mockPassword = 'PlusFit1!';

          this.authFacade.login(mockEmail, mockPassword);

          // Esperamos a que se complete el login
          this.authFacade.isAuthenticated$
            .pipe(
              filter((isAuth) => isAuth === true),
              take(1),
            )
            .subscribe({
              next: () => resolve(true),
              error: () => resolve(false),
            });

          // Timeout para evitar que la promesa nunca se resuelva
          setTimeout(() => resolve(false), 5000);
        } else {
          // No hay token y no estamos en desarrollo
          resolve(false);
        }
      }
    });
  }

  /**
   * Determina si estamos en entorno de desarrollo
   * Implementación simple para evitar dependencias externas
   */
  private isDevelopmentEnvironment(): boolean {
    return (
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1'
    );
  }
}
