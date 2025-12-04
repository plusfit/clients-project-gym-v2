import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '@feature/auth/services/auth.service';
import { map, catchError, of } from 'rxjs';
import { ToastService } from '@shared/services/toast.service';

export const invitationCodeGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const toastService = inject(ToastService);
  
  const code = route.queryParams['code'];

  if (!code) {
    toastService.showError('Se requiere un código de invitación para registrarse.');
    router.navigate(['/login']);
    return false;
  }

  return authService.validateInvitationCode(code).pipe(
    map(response => {
      if (response.data.valid) {
        return true;
      } else {
        toastService.showError('El código de invitación no es válido o ya ha sido utilizado.');
        router.navigate(['/login']);
        return false;
      }
    }),
    catchError(() => {
      toastService.showError('Error al validar el código de invitación.');
      router.navigate(['/login']);
      return of(false);
    })
  );
};
