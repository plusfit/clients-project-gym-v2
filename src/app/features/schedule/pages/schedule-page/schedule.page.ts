import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
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
  IonSpinner,
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { EnrollConfirmationModalComponent } from '@feature/schedule/components/enroll-confirmation-modal/enroll-confirmation-modal.component';
import { ScheduleCardComponent } from '@feature/schedule/components/schedule-card/schedule-card.component';
import { DaySelectorComponent } from '@feature/schedule/components/day-selector/day-selector.component';
import {
  Schedule,
  ScheduleState,
} from '@feature/schedule/state/schedule.state';
import { UnsubscribeConfirmationModalComponent } from '@feature/schedule/components/unsubscribe-confirmation-modal/unsubscribe-confirmation-modal.component';
import { ScheduleFacadeService } from '@feature/schedule/services/schedule-facade.service';
import { Store, Select } from '@ngxs/store';
import { UserState } from '@feature/profile/state/user.state';
import { AuthState } from '@feature/auth/state/auth.state';
import { Plan } from '@feature/profile/interfaces/plan.interface';
import { LoadPlan } from '@feature/profile/state/user.actions';

interface DayEnrollment {
  day: string;
  count: number;
}

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
    UnsubscribeConfirmationModalComponent,
    IonModal,
    IonTitle,
    IonToolbar,
    IonHeader,
    IonContent,
    IonGrid,
    IonRow,
    IonCol,
    IonAlert,
    IonSpinner,
  ],
})
export class SchedulePageComponent implements OnInit, OnDestroy {
  @Select(UserState.getPlan) plan$!: Observable<Plan | null>;

  schedules$: Observable<Schedule[]>;
  loading: boolean = true;
  error: string | null = null;

  selectedDay: string = 'Lunes';
  schedulesForDay: Schedule[] = [];
  currentUserId: string = '';
  userPlan = { days: 2 }; // Valor por defecto hasta que se cargue el plan
  enrolledDaysCount: number = 0;
  totalEnrollments: number = 0; // Nuevo contador para el total de inscripciones
  enrollmentsByDay: DayEnrollment[] = [];

  // Variables para modal
  showEnrollModal: boolean = false;
  showUnsubscribeModal: boolean = false;
  selectedSchedule: Schedule | null = null;

  showAlert: boolean = false;
  alertMessage: string = '';

  private subscriptions: Subscription = new Subscription();

  constructor(
    private scheduleFacade: ScheduleFacadeService,
    private store: Store,
  ) {
    this.schedules$ = this.scheduleFacade.schedules$;
  }

  ngOnInit(): void {
    // Load schedules from backend
    this.loading = true;
    this.scheduleFacade.loadSchedules();

    // Get current user ID and load plan
    const userSub = this.store.select(AuthState.getUser).subscribe((user) => {
      if (user) {
        this.currentUserId = user._id;
        console.log('Usuario actual ID:', this.currentUserId);

        if (user.planId) {
          this.store.dispatch(new LoadPlan(user.planId));
        }
      }
    });
    this.subscriptions.add(userSub);

    // Get plan info
    const planSub = this.plan$.subscribe((plan) => {
      if (plan && plan.days) {
        this.userPlan = { days: plan.days };
        console.log(
          'Plan del usuario cargado. Máximo horarios:',
          this.userPlan.days,
        );
      }
    });
    this.subscriptions.add(planSub);

    // Update schedules when they change
    const schedulesSub = this.schedules$.subscribe((schedules) => {
      this.loading = false;
      this.filterSchedules(schedules);
      this.calculateEnrollments(schedules);
      this.calculateEnrollmentsByDay(schedules);
    });
    this.subscriptions.add(schedulesSub);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  onDaySelected(day: string) {
    this.selectedDay = day;
    // En lugar de crear una nueva suscripción aquí, usamos el último valor de schedules
    const schedules = this.store.selectSnapshot(ScheduleState.getSchedules);
    this.filterSchedules(schedules);
  }

  filterSchedules(schedules: Schedule[]) {
    this.schedulesForDay = schedules
      .filter((schedule) => schedule.day === this.selectedDay)
      .sort((a, b) => {
        const timeA = parseInt(a.startTime, 10);
        const timeB = parseInt(b.startTime, 10);
        return timeA - timeB;
      });
  }

  calculateEnrollments(schedules: Schedule[]) {
    // Contar los días distintos (para mantener compatibilidad)
    const enrolledDays = new Set<string>();

    // Contar total de horarios en los que está inscrito
    let totalCount = 0;

    // Solo contar si el ID de usuario es válido
    if (this.currentUserId) {
      schedules.forEach((schedule) => {
        if (schedule.clients && schedule.clients.includes(this.currentUserId)) {
          enrolledDays.add(schedule.day);
          totalCount++;
        }
      });
    }

    // Actualizar contadores
    this.enrolledDaysCount = enrolledDays.size;
    this.totalEnrollments = totalCount;

    console.log(
      `Usuario inscrito en ${this.totalEnrollments} horarios. Máximo permitido: ${this.userPlan.days}`,
    );
  }

  calculateEnrollmentsByDay(schedules: Schedule[]) {
    // Mapear días a un objeto para contar inscripciones
    const dayCountMap = new Map<string, number>();

    // Inicializar todos los días con 0
    const allDays = [
      'Lunes',
      'Martes',
      'Miércoles',
      'Jueves',
      'Viernes',
      'Sábado',
      'Domingo',
    ];
    allDays.forEach((day) => dayCountMap.set(day, 0));

    // Contar inscripciones por día
    schedules.forEach((schedule) => {
      if (schedule.clients && schedule.clients.includes(this.currentUserId)) {
        const currentCount = dayCountMap.get(schedule.day) || 0;
        dayCountMap.set(schedule.day, currentCount + 1);
      }
    });

    // Convertir a array para pasar al componente
    this.enrollmentsByDay = Array.from(dayCountMap).map(([day, count]) => ({
      day,
      count,
    }));
  }

  checkMaxEnrollmentsLimit(newSchedule: Schedule): boolean {
    // Si el usuario ya está inscrito en este horario, no hay problema
    if (
      newSchedule.clients &&
      newSchedule.clients.includes(this.currentUserId)
    ) {
      return true;
    }

    // Obtenemos todos los horarios actuales
    const allSchedules = this.store.selectSnapshot(ScheduleState.getSchedules);

    // Contamos en cuántos horarios está inscrito actualmente
    const currentEnrollments = allSchedules.filter(
      (schedule) =>
        schedule.clients && schedule.clients.includes(this.currentUserId),
    ).length;

    // Obtenemos el máximo de horarios del plan
    const plan = this.store.selectSnapshot(UserState.getPlan);
    const maxEnrollments = plan?.days || this.userPlan.days;

    console.log(
      `Validación de horarios: Inscritos=${currentEnrollments}, Máximo=${maxEnrollments}`,
    );

    // Si ya está en el límite, no puede inscribirse en un nuevo horario
    return currentEnrollments < maxEnrollments;
  }

  onScheduleClicked(schedule: Schedule) {
    this.selectedSchedule = schedule;

    if (schedule.clients && schedule.clients.includes(this.currentUserId)) {
      // Si el usuario ya está inscrito, se abre el modal de desinscripción
      this.showUnsubscribeModal = true;
    } else {
      // Verificamos si el usuario puede inscribirse en más horarios
      if (!this.checkMaxEnrollmentsLimit(schedule)) {
        // Obtenemos el máximo de horarios del plan
        const plan = this.store.selectSnapshot(UserState.getPlan);
        const maxEnrollments = plan?.days || this.userPlan.days;

        this.alertMessage = `Ya estás inscrito en el número máximo de horarios permitidos (${maxEnrollments}). Debes desinscribirte de un horario para inscribirte en otro.`;
        this.showAlert = true;
        return;
      }

      // Abrir el modal de inscripción
      this.showEnrollModal = true;
    }
  }

  onEnrollConfirmed() {
    if (this.selectedSchedule && this.currentUserId) {
      this.loading = true;
      const enrollSub = this.scheduleFacade
        .enrollUserInSchedule(this.selectedSchedule._id, this.currentUserId)
        .subscribe({
          next: () => {
            this.loading = false;
            this.closeModals();

            // Recalcular inscripciones después de inscripción exitosa
            setTimeout(() => {
              const updatedSchedules = this.store.selectSnapshot(
                ScheduleState.getSchedules,
              );
              this.calculateEnrollments(updatedSchedules);
              this.calculateEnrollmentsByDay(updatedSchedules);
            }, 300);
          },
          error: (error) => {
            this.loading = false;
            this.error = `Error al inscribirse: ${error.message}`;
            this.showAlert = true;
            this.alertMessage = this.error;
            this.closeModals();
          },
        });
      this.subscriptions.add(enrollSub);
    }
  }

  onUnsubscribeConfirmed() {
    if (this.selectedSchedule && this.currentUserId) {
      this.loading = true;
      const unenrollSub = this.scheduleFacade
        .unenrollUserFromSchedule(this.selectedSchedule._id, this.currentUserId)
        .subscribe({
          next: () => {
            this.loading = false;
            this.closeModals();

            // Recalcular inscripciones después de desinscripción exitosa
            setTimeout(() => {
              const updatedSchedules = this.store.selectSnapshot(
                ScheduleState.getSchedules,
              );
              this.calculateEnrollments(updatedSchedules);
              this.calculateEnrollmentsByDay(updatedSchedules);
            }, 300);
          },
          error: (error) => {
            this.loading = false;
            this.error = `Error al desinscribirse: ${error.message}`;
            this.showAlert = true;
            this.alertMessage = this.error;
            this.closeModals();
          },
        });
      this.subscriptions.add(unenrollSub);
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
    // Resetear todas las variables de modales
    this.showEnrollModal = false;
    this.showUnsubscribeModal = false;

    // Importante: resetear el schedule seleccionado después de un breve delay
    // para evitar problemas de sincronización
    setTimeout(() => {
      this.selectedSchedule = null;
    }, 100);
  }
}
