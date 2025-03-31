import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  IonCol,
  IonContent,
  IonHeader,
  IonRow,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonButton,
  IonIcon,
  IonSpinner,
} from '@ionic/angular/standalone';
import { NgIf, AsyncPipe, DatePipe } from '@angular/common';
import { RoutineCardComponent } from '../../components/routine-card/routine-card.component';
import { Observable, interval, Subscription } from 'rxjs';
import { Select, Store } from '@ngxs/store';
import { HomeState, LoadRoutineForToday } from '@feature/home/state/home.state';
import { Router, RouterLink } from '@angular/router';
import { SubRoutine } from '@feature/routine/interfaces/routine.interface';
import { DayTranslatePipe } from '@shared/pipes/day-translate.pipe';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  imports: [
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonIcon,
    IonSpinner,
    DatePipe,
    RoutineCardComponent,
    IonRow,
    IonCol,
    AsyncPipe,
    DayTranslatePipe,
    NgIf,
    RouterLink,
  ],
  standalone: true,
})
export class HomePage implements OnInit, OnDestroy {
  today: Date = new Date();
  currentTime: Date = new Date();
  private clockSubscription!: Subscription;

  @Select(HomeState.getRoutine) routine$!: Observable<SubRoutine | null>;
  @Select(HomeState.isLoading) loading$!: Observable<boolean>;
  @Select(HomeState.getError) error$!: Observable<string | null>;
  @Select(HomeState.getMotivationalMessage)
  motivationalMessage$!: Observable<string>;

  constructor(
    private store: Store,
    private router: Router,
  ) {}

  ngOnInit(): void {
    // Reloj en tiempo real con actualización cada segundo
    this.clockSubscription = interval(1000).subscribe(() => {
      this.currentTime = new Date();
    });

    // Cargar la rutina para hoy
    this.store.dispatch(new LoadRoutineForToday());
  }

  ngOnDestroy(): void {
    if (this.clockSubscription) {
      this.clockSubscription.unsubscribe();
    }
  }

  onExerciseClicked(exercise: any) {
    this.router.navigate(['/cliente/rutinas', exercise.id]);
  }

  reloadRoutine() {
    this.store.dispatch(new LoadRoutineForToday());
  }

  /**
   * Navega a la página de horarios disponibles
   */
  goToSchedules() {
    this.router.navigate(['/cliente/horarios']);
  }
}
