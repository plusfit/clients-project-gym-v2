import { Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

export const routes: Routes = [
  {
    path: 'cliente',
    component: TabsPage,
    children: [
      {
        path: 'inicio',
        loadComponent: () =>
          import('../features/home/pages/home/home.page').then(
            (m) => m.HomePage,
          ),
      },
      {
        path: 'horarios',
        loadComponent: () =>
          import('@feature/schedule/pages/schedule-page/schedule.page').then(
            (m) => m.SchedulePageComponent,
          ),
      },
      {
        path: 'feedback',
        loadComponent: () =>
          import('../features/feedback/tab3.page').then((m) => m.Tab3Page),
      },
      {
        path: 'rutinas',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('../features/routine/pages/routine.page').then(
                (m) => m.RoutinePage,
              ),
          },
          {
            path: ':id',
            loadComponent: () =>
              import('../features/routine/pages/routine-detail.page').then(
                (m) => m.RoutineDetailPage,
              ),
          },
        ],
      },
      {
        path: 'perfil',
        loadComponent: () =>
          import('../features/profile/tab4.page').then((m) => m.Tab4Page),
      },
      {
        path: '',
        redirectTo: '/cliente/inicio',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    redirectTo: '/cliente/inicio',
    pathMatch: 'full',
  },
];
