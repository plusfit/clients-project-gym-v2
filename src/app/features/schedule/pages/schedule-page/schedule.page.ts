import { Component, OnInit } from '@angular/core';
import { Store, Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import {
  IonModal,
  IonTitle,
  IonToolbar,
  IonHeader,
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonAlert,
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { EnrollConfirmationModalComponent } from '@feature/schedule/components/enroll-confirmation-modal/enroll-confirmation-modal.component';
import { ScheduleCardComponent } from '@feature/schedule/components/schedule-card/schedule-card.component';
import { DaySelectorComponent } from '@feature/schedule/components/day-selector/day-selector.component';
import {
  EnrollInSchedule,
  // Suponemos que existe una acción de desinscripción:
  UnenrollFromSchedule,
  Schedule,
  ScheduleState,
} from '@feature/schedule/state/schedule.state';
import { UnsubscribeConfirmationModalComponent } from '@feature/schedule/components/unsubscribe-confirmation-modal/unsubscribe-confirmation-modal.component';

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
    // Suponiendo que también importas el modal de desinscripción:
    // UnsubscribeConfirmationModalComponent,
    IonModal,
    IonTitle,
    IonToolbar,
    IonHeader,
    IonContent,
    IonGrid,
    IonRow,
    IonCol,
    UnsubscribeConfirmationModalComponent,
    IonAlert,
  ],
})
export class SchedulePageComponent implements OnInit {
  @Select(ScheduleState.getSchedules) schedules$!: Observable<Schedule[]>;

  selectedDay: string = 'Lunes';
  schedulesForDay: Schedule[] = [];
  currentUserId: string = 'currentUserId';
  userPlan = { days: 2 };
  enrolledDaysCount: number = 0;

  // Variables para modal
  showEnrollModal: boolean = false;
  showUnsubscribeModal: boolean = false;
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
    this.selectedSchedule = schedule;
    if (schedule.clients.includes(this.currentUserId)) {
      // Si el usuario ya está inscrito, se abre el modal de desinscripción
      this.showUnsubscribeModal = true;
    } else {
      // Si no está inscrito, validar límite de días
      if (this.enrolledDaysCount >= this.userPlan.days) {
        this.alertMessage =
          'Ya estás inscrito en el número máximo de días permitidos. Debes desinscribirte de un horario para inscribirte en otro.';
        this.showAlert = true;
        return;
      }
      // Abrir el modal de inscripción
      this.showEnrollModal = true;
    }
  }

  onEnrollConfirmed() {
    if (this.selectedSchedule) {
      this.store.dispatch(
        new EnrollInSchedule(this.selectedSchedule._id, this.currentUserId),
      );
      this.closeModals();
    }
  }

  onUnsubscribeConfirmed() {
    if (this.selectedSchedule) {
      this.store.dispatch(
        new UnenrollFromSchedule(this.selectedSchedule._id, this.currentUserId),
      );
      this.closeModals();
    }
  }

  onEnrollModalDismiss() {
    this.showEnrollModal = false;
    this.selectedSchedule = null;
  }

  onUnsubscribeModalDismiss() {
    this.showUnsubscribeModal = false;
    this.selectedSchedule = null;
  }

  onAlertDismiss() {
    this.showAlert = false;
    this.alertMessage = '';
  }

  private closeModals() {
    this.showEnrollModal = false;
    this.showUnsubscribeModal = false;
    this.selectedSchedule = null;
  }
}
