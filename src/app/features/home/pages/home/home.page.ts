import { Component, OnInit } from '@angular/core';
import {
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonRow,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { AsyncPipe, DatePipe } from '@angular/common';
import { RoutineCardComponent } from '../../components/routine-card/routine-card.component';
import { Observable } from 'rxjs';
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
    DatePipe,
    RoutineCardComponent,
    IonGrid,
    IonRow,
    IonCol,
    AsyncPipe,
    DayTranslatePipe,
  ],
  standalone: true,
})
export class HomePage implements OnInit {
  today: Date = new Date();

  @Select(HomeState.getRoutine) routine$!: Observable<SubRoutine | null>;
  @Select(HomeState.getMotivationalMessage)
  motivationalMessage$!: Observable<string>;

  constructor(
    private store: Store,
    private router: Router,
  ) {}

  ngOnInit(): void {}

  onExerciseClicked(exercise: any) {
    this.router.navigate(['/cliente/rutinas', exercise.id]);
  }
}
