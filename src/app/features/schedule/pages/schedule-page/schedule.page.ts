// schedule-page.component.ts
import { Component, OnInit } from '@angular/core';
import { Store, Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import {
  IonModal,
  // IonAlert,
  IonTitle,
  IonToolbar,
  IonHeader,
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { EnrollConfirmationModalComponent } from '@feature/schedule/components/enroll-confirmation-modal/enroll-confirmation-modal.component';
import { ScheduleCardComponent } from '@feature/schedule/components/schedule-card/schedule-card.component';
import { DaySelectorComponent } from '@feature/schedule/components/day-selector/day-selector.component';
import {
  EnrollInSchedule,
  Schedule,
  ScheduleState,
} from '@feature/schedule/state/schedule.state';

@Component({
  selector: 'app-schedule-page',
  templateUrl: './schedule.page.html',
  styleUrls: ['./schedule.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    DaySelectorComponent,
    ScheduleCardComponent,
    EnrollConfirmationModalComponent,
    IonModal,
    // IonAlert,
    IonTitle,
    IonToolbar,
    IonHeader,
    IonContent,
    IonGrid,
    IonRow,
    IonCol,
  ],
})
export class SchedulePageComponent implements OnInit {
  @Select(ScheduleState.getSchedules) schedules$!: Observable<Schedule[]>;

  selectedDay: string = 'Lunes';
  schedulesForDay: Schedule[] = [];
  currentUserId: string = 'currentUserId';
  userPlan = { days: 2 };
  enrolledDaysCount: number = 0;

  showModal: boolean = false;
  selectedSchedule: Schedule | null = null;
  showAlert: boolean = false;
  alertMessage: string = '';

  constructor(private store: Store) {}

  ngOnInit(): void {
    this.schedules$.subscribe((schedules) => {
      this.filterSchedules(schedules);
      this.calculateEnrolledDays(schedules);
    });
  }

  onDaySelected(day: string) {
    this.selectedDay = day;
    this.schedules$.subscribe((schedules) => {
      this.filterSchedules(schedules);
    });
  }

  filterSchedules(schedules: Schedule[]) {
    this.schedulesForDay = schedules.filter(
      (schedule) => schedule.day === this.selectedDay,
    );
  }

  calculateEnrolledDays(schedules: Schedule[]) {
    // Contar los días distintos en los que el usuario ya está inscrito
    const enrolledDays = new Set<string>();
    schedules.forEach((schedule) => {
      if (schedule.clients.includes(this.currentUserId)) {
        enrolledDays.add(schedule.day);
      }
    });
    this.enrolledDaysCount = enrolledDays.size;
  }

  onScheduleClicked(schedule: Schedule) {
    // Si el usuario ya está inscrito en este horario, no se hace nada
    if (schedule.clients.includes(this.currentUserId)) {
      return;
    }

    // Si ya alcanzó el límite de días permitidos, se muestra un alert
    if (this.enrolledDaysCount >= this.userPlan.days) {
      this.alertMessage =
        'Ya estás inscrito en el número máximo de días permitidos. Debes desinscribirte de un horario para inscribirte en otro.';
      this.showAlert = true;
      return;
    }

    // Abrir el modal de confirmación
    this.selectedSchedule = schedule;
    this.showModal = true;
  }

  onEnrollConfirmed() {
    if (this.selectedSchedule) {
      this.store.dispatch(
        new EnrollInSchedule(this.selectedSchedule._id, this.currentUserId),
      );
      this.showModal = false;
      this.selectedSchedule = null;
    }
  }

  onModalDismiss() {
    this.showModal = false;
    this.selectedSchedule = null;
  }

  onAlertDismiss() {
    this.showAlert = false;
    this.alertMessage = '';
  }
}
