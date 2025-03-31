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
} from '@ionic/angular/standalone';
import { NgIf, AsyncPipe, DatePipe } from '@angular/common';
import { RoutineCardComponent } from '../../components/routine-card/routine-card.component';
import { Observable, interval, Subscription } from 'rxjs';
import { Select, Store } from '@ngxs/store';
import { HomeState } from '@feature/home/state/home.state';
import { Router } from '@angular/router';
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
    DatePipe,
    RoutineCardComponent,
    IonRow,
    IonCol,
    AsyncPipe,
    DayTranslatePipe,
    NgIf,
  ],
  standalone: true,
})
export class HomePage implements OnInit, OnDestroy {
  today: Date = new Date();
  currentTime: Date = new Date();
  private clockSubscription!: Subscription;

  @Select(HomeState.getRoutine) routine$!: Observable<SubRoutine | null>;
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
  }

  ngOnDestroy(): void {
    if (this.clockSubscription) {
      this.clockSubscription.unsubscribe();
    }
  }

  onExerciseClicked(exercise: any) {
    this.router.navigate(['/cliente/rutinas', exercise.id]);
  }
}
