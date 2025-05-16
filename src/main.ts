import {
  provideHttpClient,
  withFetch,
  withInterceptors,
} from '@angular/common/http';
import { bootstrapApplication } from '@angular/platform-browser';
import {
  PreloadAllModules,
  RouteReuseStrategy,
  provideRouter,
  withPreloading,
} from '@angular/router';
import {
  IonicRouteStrategy,
  provideIonicAngular,
} from '@ionic/angular/standalone';

import { importProvidersFrom } from '@angular/core';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getStorage, provideStorage } from '@angular/fire/storage';
import { authorizeInterceptor } from '@core/interceptors/authorize.interceptor';
import { errorInterceptor } from '@core/interceptors/error.interceptor';
import { tokenInterceptor } from '@core/interceptors/token.interceptor';
import { AuthState } from '@feature/auth/state/auth.state';
import { HomeState } from '@feature/home/state/home.state';
import { OnboardingState } from '@feature/onboarding/state/onboarding.state';
import { UserState } from '@feature/profile/state/user.state';
import { RoutineState } from '@feature/routine/state/routine.state';
import { ScheduleState } from '@feature/schedule/state/schedule.state';
import { defineCustomElements } from '@ionic/core/loader';
import { NgxsReduxDevtoolsPluginModule } from '@ngxs/devtools-plugin';
import {
  LOCAL_STORAGE_ENGINE,
  NgxsStoragePluginModule,
} from '@ngxs/storage-plugin';
import { NgxsModule } from '@ngxs/store';
import { register } from 'swiper/element/bundle';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { environment } from './environments/environment';

register();

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideHttpClient(
      withFetch(),
      withInterceptors([
        tokenInterceptor,
        authorizeInterceptor,
        errorInterceptor,
      ]),
    ),
    provideHttpClient(),
    importProvidersFrom(
      NgxsModule.forRoot(
        [
          HomeState,
          ScheduleState,
          RoutineState,
          UserState,
          AuthState,
          OnboardingState,
        ],
        {
          developmentMode: !environment.production,
          selectorOptions: {
            suppressErrors: false,
            injectContainerState: false,
          },
        },
      ),
      NgxsStoragePluginModule.forRoot({
        keys: [
          {
            key: AuthState,
            engine: LOCAL_STORAGE_ENGINE,
          },
        ],
      }),
      NgxsReduxDevtoolsPluginModule.forRoot(),
    ),
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideStorage(() => getStorage()),
  ],
});
