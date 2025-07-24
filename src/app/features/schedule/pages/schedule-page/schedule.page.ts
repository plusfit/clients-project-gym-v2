import { CommonModule } from "@angular/common";
import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, QueryList, ViewChildren } from "@angular/core";
import { AuthState } from "@feature/auth/state/auth.state";
import { Plan } from "@feature/profile/interfaces/plan.interface";
import { LoadPlanByUser } from "@feature/profile/state/user.actions";
import { UserState } from "@feature/profile/state/user.state";
import { DaySelectorComponent } from "@feature/schedule/components/day-selector/day-selector.component";
import { EnrollConfirmationModalComponent } from "@feature/schedule/components/enroll-confirmation-modal/enroll-confirmation-modal.component";
import { ScheduleCardComponent } from "@feature/schedule/components/schedule-card/schedule-card.component";
import { UnsubscribeConfirmationModalComponent } from "@feature/schedule/components/unsubscribe-confirmation-modal/unsubscribe-confirmation-modal.component";
import { ScheduleFacadeService } from "@feature/schedule/services/schedule-facade.service";
import { Schedule, ScheduleState } from "@feature/schedule/state/schedule.state";
import { IonCol, IonContent, IonGrid, IonModal, IonRow, IonSpinner } from "@ionic/angular/standalone";
import { Select, Store } from "@ngxs/store";
import { AppHeaderComponent } from "@shared/components/app-header/app-header.component";
import { ToastService } from "@shared/services/toast.service";
import { Observable, Subscription } from "rxjs";

interface DayEnrollment {
	day: string;
	count: number;
}

@Component({
	selector: "app-schedule-page",
	templateUrl: "./schedule.page.html",
	styleUrls: ["./schedule.page.scss"],
	standalone: true,
	imports: [
		CommonModule,
		DaySelectorComponent,
		ScheduleCardComponent,
		EnrollConfirmationModalComponent,
		UnsubscribeConfirmationModalComponent,
		IonModal,
		IonContent,
		IonGrid,
		IonRow,
		IonCol,
		IonSpinner,
		AppHeaderComponent,
	],
})
export class SchedulePageComponent implements OnInit, OnDestroy, AfterViewInit {
	@Select(UserState.getPlan) plan$!: Observable<Plan | null>;

	schedules$: Observable<Schedule[]>;
	loading = true;

	selectedDay = "Lunes";
	schedulesForDay: Schedule[] = [];
	currentUserId = "";
	userPlan = { days: 2 };
	totalEnrollments = 0;
	enrollmentsByDay: DayEnrollment[] = [];

	showEnrollModal = false;
	showUnsubscribeModal = false;
	selectedSchedule: Schedule | null = null;

	@ViewChildren(ScheduleCardComponent, { read: ElementRef })
	scheduleCardElements!: QueryList<ElementRef>;

	availableSlots = 0;

	private subscriptions = new Subscription();

	constructor(
		private scheduleFacade: ScheduleFacadeService,
		private store: Store,
		private toastService: ToastService,
	) {
		this.schedules$ = this.scheduleFacade.schedules$;
	}

	ionViewWillEnter(): void {
		this.loading = true;
		this.scheduleFacade.loadSchedules();
		const user = this.store.selectSnapshot(AuthState.getUser);
		if (user) {
			this.store.dispatch(new LoadPlanByUser(user._id));
		}
	}

	ngOnInit(): void {
		// Get current user ID and load plan
		const userSub = this.store.select(AuthState.getUser).subscribe((user) => {
			if (user) {
				this.currentUserId = user._id;
			}
		});
		this.subscriptions.add(userSub);

		// Get plan info with highest priority
		const planSub = this.plan$.subscribe((plan) => {
			if (plan?.days) {
				this.userPlan = { days: plan.days };
				const schedules = this.store.selectSnapshot(ScheduleState.getSchedules);
				if (schedules) {
					this.calculateEnrollments(schedules);
				}
			}
		});
		this.subscriptions.add(planSub);

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

	ngAfterViewInit(): void {
		const scrollSub = this.scheduleCardElements.changes.subscribe(() => {
			setTimeout(() => this.scrollToFirstEnrolledSchedule(), 0);
		});
		this.subscriptions.add(scrollSub);

		setTimeout(() => this.scrollToFirstEnrolledSchedule(), 0);
	}

	onDaySelected(day: string) {
		this.selectedDay = day;
		const schedules = this.store.selectSnapshot(ScheduleState.getSchedules);
		this.filterSchedules(schedules);
	}

	filterSchedules(schedules: Schedule[]) {
		this.schedulesForDay = schedules
			.filter((schedule) => schedule.day === this.selectedDay)
			.sort((a, b) => {
				const timeA = Number.parseInt(a.startTime, 10);
				const timeB = Number.parseInt(b.startTime, 10);
				return timeA - timeB;
			});
	}

	calculateEnrollments(schedules: Schedule[]) {
		// Contar total de horarios en los que está inscripto
		let totalCount = 0;

		// Solo contar si el ID de usuario es válido
		if (this.currentUserId) {
			for (const schedule of schedules) {
				if (schedule.clients?.includes(this.currentUserId)) {
					totalCount++;
				}
			}
		}

		// Actualizar contadores
		this.totalEnrollments = totalCount;

		// Calcular horarios disponibles
		const maxEnrollments = this.userPlan?.days || 0;
		this.availableSlots = Math.max(0, maxEnrollments - totalCount);
	}

	calculateEnrollmentsByDay(schedules: Schedule[]) {
		// Mapear días a un objeto para contar inscripciones
		const dayCountMap = new Map<string, number>();

		// Inicializar todos los días con 0
		const allDays = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
		for (const day of allDays) {
			dayCountMap.set(day, 0);
		}

		// Contar inscripciones por día
		for (const schedule of schedules) {
			if (schedule.clients?.includes(this.currentUserId)) {
				const currentCount = dayCountMap.get(schedule.day) || 0;
				dayCountMap.set(schedule.day, currentCount + 1);
			}
		}

		// Convertir a array para pasar al componente
		this.enrollmentsByDay = Array.from(dayCountMap).map(([day, count]) => ({
			day,
			count,
		}));
	}

	checkMaxEnrollmentsLimit(newSchedule: Schedule): boolean {
		// Si el usuario ya está inscripto en este horario, no hay problema
		if (newSchedule.clients?.includes(this.currentUserId)) {
			return true;
		}

		// Obtenemos todos los horarios actuales
		const allSchedules = this.store.selectSnapshot(ScheduleState.getSchedules);

		// Contamos en cuántos horarios está inscripto actualmente
		const currentEnrollments = allSchedules.filter((schedule) => schedule.clients?.includes(this.currentUserId)).length;

		// Obtenemos el máximo de horarios del plan
		const plan = this.store.selectSnapshot(UserState.getPlan);
		const maxEnrollments = plan?.days || this.userPlan.days;

		// Si ya está en el límite, no puede inscribirse en un nuevo horario
		return currentEnrollments < maxEnrollments;
	}

	checkDayEnrollmentLimit(newSchedule: Schedule): boolean {
		// Si el usuario ya está inscripto en este horario específico, no hay problema
		if (newSchedule.clients?.includes(this.currentUserId)) {
			return true;
		}

		// Obtenemos todos los horarios actuales
		const allSchedules = this.store.selectSnapshot(ScheduleState.getSchedules);

		// Verificamos si ya está inscrito en algún horario del mismo día
		const isAlreadyEnrolledInDay = allSchedules.some(
			(schedule) => 
				schedule.day === newSchedule.day && 
				schedule.clients?.includes(this.currentUserId)
		);

		// Si ya está inscrito en el mismo día, no puede inscribirse en otro horario del mismo día
		return !isAlreadyEnrolledInDay;
	}

	onScheduleClicked(schedule: Schedule) {
		this.selectedSchedule = schedule;

		if (schedule.clients?.includes(this.currentUserId)) {
			// Si el usuario ya está inscripto, se abre el modal de desinscripción
			this.showUnsubscribeModal = true;
		} else {
			// Verificamos si el usuario ya está inscrito en el mismo día
			if (!this.checkDayEnrollmentLimit(schedule)) {
				this.toastService.showWarning(
					`Ya estás inscripto en otro horario el día ${schedule.day}. Solo puedes estar inscripto en un horario por día.`,
				);
				return;
			}

			// Verificamos si el usuario puede inscribirse en más horarios
			if (!this.checkMaxEnrollmentsLimit(schedule)) {
				// Obtenemos el máximo de horarios del plan
				const plan = this.store.selectSnapshot(UserState.getPlan);
				const maxEnrollments = plan?.days || this.userPlan.days;

				// Usar toast warning en lugar de alert
				this.toastService.showWarning(
					`Ya estás inscripto en el número máximo de horarios permitidos (${maxEnrollments}). Debes desinscribirte de un horario para inscribirte en otro.`,
				);
				return;
			}

			// Abrir el modal de inscripción
			this.showEnrollModal = true;
		}
	}

	onEnrollConfirmed() {
		if (this.selectedSchedule && this.currentUserId) {
			this.loading = true;
			const scheduleInfo = {
				startTime: this.selectedSchedule.startTime || "",
				day: this.selectedSchedule.day || "",
			};

			const enrollSub = this.scheduleFacade
				.enrollUserInSchedule(this.selectedSchedule._id, this.currentUserId)
				.subscribe({
					next: () => {
						this.loading = false;
						this.closeModals();

						// Show success toast
						this.toastService.showSuccess(
							`Te has inscripto exitosamente en el horario de ${scheduleInfo.startTime}:00 el día ${scheduleInfo.day}.`,
						);

						// Recalcular inscripciones después de inscripción exitosa
						setTimeout(() => {
							const updatedSchedules = this.store.selectSnapshot(ScheduleState.getSchedules);
							this.calculateEnrollments(updatedSchedules);
							this.calculateEnrollmentsByDay(updatedSchedules);
						}, 300);
					},
					error: (error) => {
						this.loading = false;
						// Show error toast
						this.toastService.showError(`No se pudo completar la inscripción: ${error.message || "Error desconocido"}`);

						this.closeModals();
					},
				});
			this.subscriptions.add(enrollSub);
		}
	}

	onUnsubscribeConfirmed() {
		if (this.selectedSchedule && this.currentUserId) {
			this.loading = true;
			const scheduleInfo = {
				startTime: this.selectedSchedule.startTime || "",
				day: this.selectedSchedule.day || "",
			};

			const unenrollSub = this.scheduleFacade
				.unenrollUserFromSchedule(this.selectedSchedule._id, this.currentUserId)
				.subscribe({
					next: () => {
						this.loading = false;
						this.closeModals();

						// Show success toast
						this.toastService.showSuccess(
							`Te has desinscripto exitosamente del horario de ${scheduleInfo.startTime}:00 el día ${scheduleInfo.day}.`,
						);

						const updatedSchedules = this.store.selectSnapshot(ScheduleState.getSchedules);
						this.calculateEnrollments(updatedSchedules);
						this.calculateEnrollmentsByDay(updatedSchedules);
					},
					error: (error) => {
						this.loading = false;
						// Show error toast
						this.toastService.showError(
							`No se pudo completar la desinscripción: ${error.message || "Error desconocido"}`,
						);

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

	scrollToFirstEnrolledSchedule(): void {
		if (
			!this.currentUserId ||
			!this.schedulesForDay ||
			this.schedulesForDay.length === 0 ||
			this.scheduleCardElements.length === 0
		) {
			return; // Salir si no hay datos necesarios o elementos renderizados
		}

		// Encontrar el índice del primer horario inscripto en la lista filtrada actual
		const firstEnrolledIndex = this.schedulesForDay.findIndex((schedule) =>
			schedule.clients?.includes(this.currentUserId),
		);

		if (firstEnrolledIndex !== -1) {
			// Obtener la lista de elementos DOM
			const cardElements = this.scheduleCardElements.toArray();
			// Asegurarse de que el índice es válido
			if (cardElements[firstEnrolledIndex]) {
				const targetElement = cardElements[firstEnrolledIndex].nativeElement;
				// Hacer scroll hacia el elemento
				targetElement.scrollIntoView({ behavior: "smooth", block: "center" });
			}
		}
	}
}
