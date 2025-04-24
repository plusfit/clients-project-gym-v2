import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthState } from '@feature/auth/state/auth.state';
import { Store } from '@ngxs/store';
import { map, take } from 'rxjs/operators';

export const authGuard = () => {
  const router = inject(Router);
  const store = inject(Store);

  return store.select(AuthState.isAuthenticated).pipe(
    take(1),
    map(isAuthenticated => {
      if (!isAuthenticated) {
        router.navigate(['/login']);
        return false;
      }
      return true;
    })
  );
};
