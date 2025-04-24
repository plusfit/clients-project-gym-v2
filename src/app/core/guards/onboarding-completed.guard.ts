import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthState } from '@feature/auth/state/auth.state';
import { Store } from '@ngxs/store';
import { map, take } from 'rxjs/operators';

export const onboardingCompletedGuard = () => {
  const router = inject(Router);
  const store = inject(Store);

  return store.select(AuthState.getUser).pipe(
    take(1),
    map(user => {
      // Primero verificamos si hay un usuario
      if (!user) {
        router.navigate(['/login']);
        return false;
      }

      // Luego verificamos si ha completado el onboarding
      if (!user.onboardingCompleted) {
        router.navigate(['/onboarding']);
        return false;
      }

      return true;
    })
  );
};
