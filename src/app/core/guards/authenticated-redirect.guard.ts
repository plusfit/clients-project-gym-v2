import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthState } from '@feature/auth/state/auth.state';
import { Store } from '@ngxs/store';
import { map, take } from 'rxjs/operators';

export const authenticatedRedirectGuard = () => {
  const router = inject(Router);
  const store = inject(Store);

  return store.select(AuthState.getUser).pipe(
    take(1),
    map(user => {
      if (user) {
        // User is authenticated, check onboarding status
        if (user.isOnboardingCompleted) {
          router.navigate(['/cliente/inicio']);
        } else {
          router.navigate(['/onboarding']);
        }
        return false;
      }
      // User is not authenticated, allow access to login/register
      return true;
    })
  );
};
