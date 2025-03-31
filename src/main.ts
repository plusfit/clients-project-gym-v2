import { bootstrapApplication } from '@angular/platform-browser';
import {
  RouteReuseStrategy,
  provideRouter,
  withPreloading,
  PreloadAllModules,
} from '@angular/router';
import {
  IonicRouteStrategy,
  provideIonicAngular,
} from '@ionic/angular/standalone';
import { provideHttpClient } from '@angular/common/http';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { APP_INITIALIZER, importProvidersFrom } from '@angular/core';
import { NgxsModule } from '@ngxs/store';
import { HomeState } from '@feature/home/state/home.state';
import { environment } from './environments/environment';
import { NgxsReduxDevtoolsPluginModule } from '@ngxs/devtools-plugin';
import { ScheduleState } from '@feature/schedule/state/schedule.state';
import { RoutineState } from '@feature/routine/state/routine.state';
import { register } from 'swiper/element/bundle';
import { UserState } from '@feature/profile/state/user.state';
import { AuthState } from '@feature/auth/state/auth.state';
import { AuthInitializerService } from '@feature/auth/services/auth-initializer.service';
register();

// Factory para el inicializador de autenticación
export function initializeAuthFactory(authInitializer: AuthInitializerService) {
  return () => authInitializer.init();
}

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideHttpClient(),
    // Proveedor para inicializar la autenticación al arranque
    {
      provide: APP_INITIALIZER,
      useFactory: initializeAuthFactory,
      deps: [AuthInitializerService],
      multi: true,
    },
    importProvidersFrom(
      NgxsModule.forRoot(
        [HomeState, ScheduleState, RoutineState, UserState, AuthState],
        {
          developmentMode: !environment.production,
          selectorOptions: {
            suppressErrors: false,
            injectContainerState: false,
          },
        },
      ),
      NgxsReduxDevtoolsPluginModule.forRoot(),
    ),
  ],
});
