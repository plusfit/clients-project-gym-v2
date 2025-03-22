import { Injectable } from '@angular/core';
import { AuthFacadeService } from './auth-facade.service';
import { firstValueFrom } from 'rxjs';
import { take, filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthInitializerService {
  constructor(private authFacade: AuthFacadeService) {}

  // Esta función realizará el login automático al inicio de la app
  initializeAuth(): Promise<boolean> {
    return new Promise((resolve) => {
      console.log('Iniciando autenticación automática...');

      // Verificar si ya hay un token guardado
      const token = localStorage.getItem('token');
      if (token) {
        console.log('Token encontrado, obteniendo usuario actual');
        this.authFacade.getCurrentUser();

        // Esperar a que se complete la autenticación
        this.authFacade.isAuthenticated$
          .pipe(
            filter((isAuth) => isAuth === true),
            take(1),
          )
          .subscribe((isAuthenticated) => {
            console.log(
              'Usuario cargado desde token existente:',
              isAuthenticated,
            );
            resolve(true);
          });
      } else {
        // Datos de login mockeados - asegúrate de que coincidan con los del mock service
        const mockEmail = 'steelparadisegym@gmail.com';
        const mockPassword = 'PlusFit1!';

        console.log('Intentando login con credenciales:', mockEmail);

        // Ejecutar login
        this.authFacade.login(mockEmail, mockPassword);

        // Esperar a que el login se complete y resolver la promesa
        // Usamos filter para esperar hasta que isAuthenticated sea true
        this.authFacade.isAuthenticated$
          .pipe(
            filter((isAuth) => isAuth === true),
            take(1),
          )
          .subscribe((isAuthenticated) => {
            console.log(
              'Auth initialized, user authenticated:',
              isAuthenticated,
            );
            resolve(true);
          });

        // Añadir un timeout para detectar si algo falla
        setTimeout(() => {
          this.authFacade.isAuthenticated$.pipe(take(1)).subscribe((isAuth) => {
            if (!isAuth) {
              console.error(
                'Autenticación falló después de 3 segundos. Verificar credenciales.',
              );
              // Resolvemos de todas formas para no bloquear la app
              resolve(false);
            }
          });
        }, 3000);
      }
    });
  }
}
