import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngxs/store';

import { CommonModule } from '@angular/common';
import { map } from 'rxjs/operators';
import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { Routine } from '@shared/interfaces/routines.interface';
import { RoutineState } from '@feature/routine/state/routine.state';
import { SubroutineCardComponent } from '@feature/routine/components/subroutine-card.component';

@Component({
  selector: 'app-routine-detail-page',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/cliente/rutinas"></ion-back-button>
        </ion-buttons>
        <ion-title>{{ routine?.name }}</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <p class="description">{{ routine?.description }}</p>
      <div class="subroutines">
        <app-subroutine-card
          *ngFor="let sub of routine?.subRoutines"
          [subroutine]="sub"
        >
        </app-subroutine-card>
      </div>
    </ion-content>
  `,
  styles: [
    `
      .description {
        font-size: 1rem;
        margin-bottom: 16px;
        color: #424242;
      }
      .subroutines {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
    `,
  ],
  standalone: true,
  imports: [
    CommonModule,
    SubroutineCardComponent,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonTitle,
    IonContent,
    SubroutineCardComponent,
  ],
})
export class RoutineDetailPage implements OnInit {
  routine?: Routine;

  constructor(
    private route: ActivatedRoute,
    private store: Store,
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    this.store
      .select(RoutineState.getRoutines)
      .pipe(map((routines: any) => routines.find((r: Routine) => r._id === id)))
      .subscribe((routine) => {
        this.routine = routine;
      });
  }
}
