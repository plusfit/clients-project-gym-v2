import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ChangeDetectorRef,
} from '@angular/core';
import { ExerciseItemComponent } from '../exercise-item/exercise-item.component';
import { NgForOf, NgIf, UpperCasePipe } from '@angular/common';
import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonIcon,
  IonLabel,
  IonList,
  IonListHeader,
  IonSpinner,
} from '@ionic/angular/standalone';
import {
  SubRoutine,
  Exercise,
} from '@feature/routine/interfaces/routine.interface';
import { ExerciseService } from '@feature/routine/services/exercise.service';
import { catchError, forkJoin, map, of, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-routine-card',
  templateUrl: './routine-card.component.html',
  styleUrls: ['./routine-card.component.scss'],
  standalone: true,
  imports: [
    ExerciseItemComponent,
    NgForOf,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonIcon,
    IonCardSubtitle,
    UpperCasePipe,
    IonCardContent,
    IonList,
    IonListHeader,
    IonLabel,
    NgIf,
    IonSpinner,
  ],
})
export class RoutineCardComponent implements OnChanges, OnDestroy {
  @Input() routine!: SubRoutine | null;
  @Output() exerciseClicked = new EventEmitter<Exercise>();

  isLoading = true;
  loadedExercises: Exercise[] = [];
  private destroy$ = new Subject<void>();

  constructor(
    private exerciseService: ExerciseService,
    private cd: ChangeDetectorRef,
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['routine']) {
      this.processExercises();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Procesa los ejercicios de la rutina, convirtiendo IDs en objetos Exercise si es necesario
   */
  processExercises(): void {
    if (!this.routine?.exercises) {
      this.loadedExercises = [];
      this.isLoading = false;
      return;
    }

    // Si ya tenemos objetos Exercise, usamos la lista directamente
    if (typeof this.routine.exercises[0] !== 'string') {
      this.loadedExercises = this.routine.exercises as Exercise[];
      this.isLoading = false;
      return;
    }

    // Si tenemos IDs, cargamos cada ejercicio
    this.isLoading = true;
    const exerciseIds = this.routine.exercises as string[];

    if (exerciseIds.length === 0) {
      this.loadedExercises = [];
      this.isLoading = false;
      return;
    }

    // Cargamos los ejercicios en paralelo
    const observables = exerciseIds.map((id) =>
      this.exerciseService.getExerciseById(id).pipe(
        catchError(() => {
          return of(null);
        }),
      ),
    );

    forkJoin(observables)
      .pipe(
        map((exercises) => exercises.filter((ex) => ex !== null) as Exercise[]),
        takeUntil(this.destroy$),
      )
      .subscribe({
        next: (exercises) => {
          this.loadedExercises = exercises;
          this.isLoading = false;
          this.cd.markForCheck();
        },
        error: () => {
          this.loadedExercises = [];
          this.isLoading = false;
          this.cd.markForCheck();
        },
      });
  }

  /**
   * Función de utilidad para verificar si los ejercicios son objetos o strings
   */
  private areExerciseObjects(
    exercises: Exercise[] | string[],
  ): exercises is Exercise[] {
    return (
      exercises.length === 0 ||
      (exercises.length > 0 && typeof exercises[0] !== 'string')
    );
  }

  onExerciseClick(exercise: Exercise): void {
    this.exerciseClicked.emit(exercise);
  }
}
