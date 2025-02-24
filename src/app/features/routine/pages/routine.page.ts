import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Store, Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonList,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import {
  LoadRoutines,
  RoutineState,
} from '@feature/routine/state/routine.state';
import { Routine } from '@shared/interfaces/routines.interface';

@Component({
  selector: 'app-routine-page',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Mis Rutinas</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <ion-list>
        <ion-card
          *ngFor="let routine of routines$ | async"
          (click)="openRoutine(routine)"
        >
          <ion-card-header>
            <ion-card-title>{{ routine.name }}</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <p>{{ routine.description }}</p>
            <p><strong>Categoría:</strong> {{ routine.category }}</p>
          </ion-card-content>
        </ion-card>
      </ion-list>
    </ion-content>
  `,
  styles: [
    `
      ion-card {
        margin-bottom: 16px;
        cursor: pointer;
        transition: transform 0.2s;
      }
      ion-card:hover {
        transform: scale(1.02);
      }
      ion-card-title {
        font-size: 1.2rem;
        font-weight: bold;
      }
      ion-card-content p {
        margin: 4px 0;
      }
    `,
  ],
  standalone: true,
  imports: [
    CommonModule,
    IonToolbar,
    IonHeader,
    IonTitle,
    IonContent,
    IonList,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
  ],
})
export class RoutinePage implements OnInit {
  @Select(RoutineState.getRoutines) routines$!: Observable<Routine[]>;

  constructor(
    private store: Store,
    private router: Router,
  ) {}

  ngOnInit() {
    this.store.dispatch(new LoadRoutines());
  }

  openRoutine(routine: Routine) {
    // Se redirige a la página de detalle, pasando él, id de la rutina
    this.router.navigate(['/cliente/rutinas', routine._id]);
  }
}
