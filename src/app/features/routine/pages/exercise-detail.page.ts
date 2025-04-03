import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonSpinner,
  IonIcon,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonButton,
} from '@ionic/angular/standalone';
import {
  AsyncPipe,
  NgIf,
  NgOptimizedImage,
  UpperCasePipe,
  NgClass,
} from '@angular/common';

import {
  RoutineState,
  LoadSelectedExercise,
} from '@feature/routine/state/routine.state';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { Exercise } from '../interfaces/routine.interface';
import { PluralizePipe } from '@shared/pipes/pluralize.pipe';

declare module '../interfaces/routine.interface' {
  interface Exercise {
    instructions?: string;
    category?: string;
  }
}

@Component({
  selector: 'app-exercise-detail',
  standalone: true,
  templateUrl: './exercise-detail.page.html',
  styleUrls: ['./exercise-detail.page.scss'],
  imports: [
    NgIf,
    IonHeader,
    IonContent,
    IonTitle,
    IonToolbar,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonSpinner,
    IonIcon,
    IonButtons,
    IonBackButton,
    AsyncPipe,
    NgOptimizedImage,
    UpperCasePipe,
    NgClass,
    IonButton,
    RouterLink,
    PluralizePipe,
  ],
})
export class ExerciseDetailPage implements OnInit {
  @Select(RoutineState.getSelectedExercise)
  selectedExercise$!: Observable<Exercise | null>;
  isLoading = false;

  constructor(
    private route: ActivatedRoute,
    private store: Store,
  ) {}

  ngOnInit() {
    const exerciseId = this.route.snapshot.paramMap.get('id');
    if (exerciseId) {
      this.isLoading = true;
      this.store.dispatch(new LoadSelectedExercise(exerciseId)).subscribe({
        next: () => (this.isLoading = false),
        error: () => (this.isLoading = false),
      });
    }
  }
}
