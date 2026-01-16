import { CommonModule } from "@angular/common";
import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, QueryList, ViewChildren } from "@angular/core";
import { AuthState } from "@feature/auth/state/auth.state";
import { Plan } from "@feature/profile/interfaces/plan.interface";
import { UserPlanService } from "@feature/profile/services/user-plan.service";
import { LoadPlan } from "@feature/profile/state/user.actions";
import { UserState } from "@feature/profile/state/user.state";
import { DaySelectorComponent } from "@feature/schedule/components/day-selector/day-selector.component";
import { EnrollConfirmationModalComponent } from "@feature/schedule/components/enroll-confirmation-modal/enroll-confirmation-modal.component";
import { ScheduleCardComponent } from "@feature/schedule/components/schedule-card/schedule-card.component";
import { UnsubscribeConfirmationModalComponent } from "@feature/schedule/components/unsubscribe-confirmation-modal/unsubscribe-confirmation-modal.component";
import { ScheduleFacadeService } from "@feature/schedule/services/schedule-facade.service";
import { Schedule, ScheduleState } from "@feature/schedule/state/schedule.state";
import { IonCol, IonContent, IonGrid, IonIcon, IonModal, IonRow, IonSpinner } from "@ionic/angular/standalone";
import { Select, Store } from "@ngxs/store";
import { AppHeaderComponent } from "@shared/components/app-header/app-header.component";
import { ToastService } from "@shared/services/toast.service";
import { ErrorHandlerService } from "@core/services/error-handler.service";
import { Observable, Subscription } from "rxjs";

interface DayEnrollment {
	day: string;
	count: number;
}

interface DayStatus {
	day: string;
	disabled: boolean;
	hasSchedules: boolean;
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
		IonIcon,
		AppHeaderComponent,
	],
})
export class SchedulePageComponent implements OnInit, OnDestroy, AfterViewInit {
	@Select(UserState.getPlan) plan$!: Observable<Plan | null>;

	schedules$: Observable<Schedule[]>;
	loading = true;
	error: string | null = null;

	selectedDay = "Lunes";
	schedulesForDay: Schedule[] = [];
	currentUserId = "";
	userPlan = { days: 2 };
	enrolledDaysCount = 0;
	totalEnrollments = 0;
	enrollmentsByDay: DayEnrollment[] = [];
	dayStatuses: DayStatus[] = [];
	disabledDaysInfo: Array<{ day: string, reasons: string[] }> = []; // Información de días deshabilitados para el home

	showEnrollModal = false;
	showUnsubscribeModal = false;
	selectedSchedule: Schedule | null = null;

	@ViewChildren(ScheduleCardComponent, { read: ElementRef })
	scheduleCardElements!: QueryList<ElementRef>;

	availableSlots = 0;
	availableDays: number | null = null;

	private subscriptions = new Subscription();

	constructor(
		private scheduleFacade: ScheduleFacadeService,
		private store: Store,
		private toastService: ToastService,
		private userPlanService: UserPlanService,
		private errorHandler: ErrorHandlerService,
	) {
		this.schedules$ = this.scheduleFacade.schedules$;
	}

	ngOnInit(): void {
		this.loading = true;
		this.scheduleFacade.loadSchedules();

		// Get current user ID and load plan
		const userSub = this.store.select(AuthState.getUser).subscribe((user) => {
			if (user) {
				this.currentUserId = user._id;

				if (user.planId) {
					this.store.dispatch(new LoadPlan(user.planId));
				}

				this.userPlanService.getAvailableDays(user._id).subscribe({
					next: (data) => {
						if (data) {
							this.availableDays = data.availableDays;
						}
					},
					error: (err) => {
						console.error("Error loading available days", err);
					},
				});
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
			this.calculateDayStatuses(schedules);
			this.disabledDaysInfo = this.getDisabledDaysInfo(); // Actualizar información de días deshabilitados
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

		// Ya no mostramos warning por días deshabilitados, permitimos acceso completo
		// El usuario verá la información visual en la interfaz
	}

	filterSchedules(schedules: Schedule[]) {
		this.schedulesForDay = schedules
			.filter((schedule) => schedule.day === this.selectedDay)
			// Incluir todos los horarios para mostrar, incluso los deshabilitados (con indicación visual)
			.sort((a, b) => {
				const timeA = Number.parseInt(a.startTime, 10);
				const timeB = Number.parseInt(b.startTime, 10);
				return timeA - timeB;
			});
	}

	calculateEnrollments(schedules: Schedule[]) {
		// Contar los días distintos (para mantener compatibilidad)
		const enrolledDays = new Set<string>();

		// Contar total de horarios en los que está inscripto
		let totalCount = 0;

		// Solo contar si el ID de usuario es válido
		if (this.currentUserId) {
			for (const schedule of schedules) {
				if (schedule.clients?.includes(this.currentUserId)) {
					enrolledDays.add(schedule.day);
					totalCount++;
				}
			}
		}

		// Actualizar contadores
		this.enrolledDaysCount = enrolledDays.size;
		this.totalEnrollments = totalCount;

		// Calcular horarios disponibles con la lógica de 6 horarios para planes de 5 días
		const planDays = this.userPlan?.days || 0;
		const maxEnrollments = this.getMaxAllowedSchedules(planDays);
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

	calculateDayStatuses(schedules: Schedule[]) {
		const days = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

		this.dayStatuses = days.map(day => {
			const daySchedules = schedules.filter(schedule => schedule.day === day);
			const hasSchedules = daySchedules.length > 0;

			// Un día está DESHABILITADO solo si:
			// 1. Tiene horarios Y todos están explícitamente deshabilitados (disabled === true)
			// Los días sin horarios NO se consideran deshabilitados, solo no tienen horarios
			let isDayDisabled = false;
			if (hasSchedules) {
				const enabledSchedules = daySchedules.filter(schedule => schedule.disabled !== true);
				isDayDisabled = enabledSchedules.length === 0; // Solo si TODOS están disabled = true
			}

			return {
				day,
				disabled: isDayDisabled,
				hasSchedules
			};
		});

		// Ya NO cambiamos automáticamente el día seleccionado
		// Los usuarios pueden ver días deshabilitados y acceder a ellos
	}

	isDayCompletelyDisabled(): boolean {
		const dayStatus = this.dayStatuses.find(status => status.day === this.selectedDay);
		// Solo retorna true si el día está explícitamente deshabilitado
		// NO bloquea días sin horarios, solo días con horarios deshabilitados
		return dayStatus ? dayStatus.disabled : false;
	}

	getDisabledDayReason(): string {
		const dayStatus = this.dayStatuses.find(status => status.day === this.selectedDay);
		if (!dayStatus) {
			return 'No hay información disponible para este día.';
		}

		if (!dayStatus.hasSchedules) {
			return 'No hay horarios configurados para este día.';
		}

		if (dayStatus.disabled) {
			// Obtener todas las razones de los horarios deshabilitados del día
			const daySchedules = this.schedulesForDay.filter(schedule => schedule.disabled === true);
			const reasons = daySchedules
				.map(schedule => schedule.disabledReason)
				.filter(reason => reason) // Filtrar razones vacías
				.filter((reason, index, array) => array.indexOf(reason) === index); // Eliminar duplicados

			if (reasons.length > 0) {
				return reasons.length === 1
					? `Razón: ${reasons[0]}`
					: `Razones: ${reasons.join(', ')}`;
			}

			return 'Todos los horarios de este día están deshabilitados sin razón específica.';
		}

		return 'Este día está disponible.';
	}

	/**
	 * Obtiene todos los días deshabilitados con sus razones para mostrar en el home
	 */
	getDisabledDaysInfo(): Array<{ day: string, reasons: string[] }> {
		const allSchedules = this.store.selectSnapshot(ScheduleState.getSchedules);
		const disabledDaysInfo: Array<{ day: string, reasons: string[] }> = [];

		const days = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

		for (const day of days) {
			const daySchedules = allSchedules.filter(schedule => schedule.day === day);
			const disabledSchedules = daySchedules.filter(schedule => schedule.disabled === true);

			if (disabledSchedules.length > 0) {
				const reasons = disabledSchedules
					.map(schedule => schedule.disabledReason)
					.filter((reason): reason is string => reason !== undefined && reason.trim() !== '')
					.filter((reason, index, arr) => arr.indexOf(reason) === index); // Eliminar duplicados

				if (reasons.length > 0) {
					disabledDaysInfo.push({
						day,
						reasons
					});
				} else {
					// Si hay horarios deshabilitados pero sin razón
					disabledDaysInfo.push({
						day,
						reasons: ['Sin razón especificada']
					});
				}
			}
		}

		return disabledDaysInfo;
	}

	/**
	 * Obtiene el máximo de horarios permitidos según el plan
	 * Planes de 5 días permiten 6 horarios, el resto permite plan.days horarios
	 */
	private getMaxAllowedSchedules(planDays: number): number {
		return planDays === 5 ? 6 : planDays;
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
		const planDays = plan?.days || this.userPlan.days;
		const maxEnrollments = this.getMaxAllowedSchedules(planDays);

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

		// Si el horario está deshabilitado, mostrar información pero permitir agendar/desagendar
		if (schedule.disabled === true) {
			const reason = schedule.disabledReason || 'Sin razón especificada';

			// Si el usuario ya está inscrito, permitir desinscripción con aviso
			if (schedule.clients?.includes(this.currentUserId)) {
				this.toastService.showInfo(
					`ℹ️ Este horario tiene limitaciones (${reason}). Puedes desanotarte si lo deseas.`,
				);
				this.showUnsubscribeModal = true;
				return;
			}

			// Si no está inscrito, permitir inscripción con aviso
			this.toastService.showInfo(
				`ℹ️ Este horario tiene limitaciones (${reason}). Aún puedes anotarte, pero considera las limitaciones.`,
			);
			// Continuar con la lógica normal de inscripción
		}

		if (schedule.clients?.includes(this.currentUserId)) {
			// Si el usuario ya está inscripto, se abre el modal de desinscripción
			this.showUnsubscribeModal = true;
		} else {
			if (this.availableDays !== null && this.availableDays <= 0) {
				this.toastService.showWarning("No tienes días disponibles para inscribirte. Por favor renueva tu plan.");
				return;
			}

			// Check if schedule is at capacity
			if (schedule.clients && schedule.clients.length >= schedule.maxCount) {
				this.toastService.showWarning(
					`Este horario está completo (${schedule.clients.length}/${schedule.maxCount} cupos ocupados).`
				);
				return;
			}

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
				const planDays = plan?.days || this.userPlan.days;
				const maxEnrollments = this.getMaxAllowedSchedules(planDays);

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

							// Reload available days
							this.userPlanService.getAvailableDays(this.currentUserId).subscribe((data) => {
								if (data) this.availableDays = data.availableDays;
							});
						}, 300);
					},
					error: (error) => {
						this.loading = false;
						const errorMessage = this.errorHandler.handleError(error, false);
						this.error = `Error al inscribirse: ${errorMessage}`;

						// Show error toast - No mostramos toast aquí porque errorHandler ya lo muestra si showToast es true
						// Pero en el plan decidimos mantenerlo con el mensaje corregido para consistencia, 
						// aunque el interceptor ya muestra uno. Para evitar doble toast, usaremos false en handleError.
						this.toastService.showError(`No se pudo completar la inscripción: ${errorMessage}`);

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

						// Reload available days
						this.userPlanService.getAvailableDays(this.currentUserId).subscribe((data) => {
							if (data) this.availableDays = data.availableDays;
						});
					},
					error: (error) => {
						this.loading = false;
						const errorMessage = this.errorHandler.handleError(error, false);
						this.error = `Error al desinscribirse: ${errorMessage}`;

						// Show error toast
						this.toastService.showError(
							`No se pudo completar la desinscripción: ${errorMessage}`,
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
