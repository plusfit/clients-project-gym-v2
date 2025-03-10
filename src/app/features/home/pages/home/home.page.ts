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
import { SubRoutine } from '@shared/interfaces/routines.interface';
import { Observable } from 'rxjs';
import { Select, Store } from '@ngxs/store';
import { HomeState } from '@feature/home/state/home.state';
import { Router } from '@angular/router';

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

  ngOnInit(): void {
    // Aquí podrías despachar acciones para cargar datos si fuera necesario
  }

  onExerciseClicked(exercise: any) {
    // Suponemos que el ejercicio posee una propiedad 'id'
    this.router.navigate(['/cliente/rutinas', exercise.id]);
  }
}
