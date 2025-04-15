import { CommonModule } from "@angular/common";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { AuthFacadeService } from "@feature/auth/services/auth-facade.service";
import { SubroutineCardComponent } from "@feature/routine/components/subroutine-card.component";
import { LoadRoutineById, LoadRoutines, RoutineState } from "@feature/routine/state/routine.state";
import { IonContent, IonIcon, IonSpinner } from "@ionic/angular/standalone";
import { Actions, Store, ofActionSuccessful } from "@ngxs/store";
import { AppHeaderComponent } from "@shared/components/app-header/app-header.component";
import { addIcons } from "ionicons";
import { barbellOutline, fitnessOutline } from "ionicons/icons";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { Routine, SubRoutine } from "../interfaces/routine.interface";

@Component({
	selector: "app-routine-detail-page",
	templateUrl: './routine-detail.page.html',
	styleUrls: ['./routine-detail.page.scss'],
	standalone: true,
	imports: [CommonModule, SubroutineCardComponent, IonContent, IonIcon, IonSpinner, AppHeaderComponent],
})
export class RoutineDetailPage implements OnInit, OnDestroy {
	routine?: Routine;
	subroutines: SubRoutine[] = [];
	isLoading = true;
	private destroy$ = new Subject<void>();

	constructor(
		private store: Store,
		private actions$: Actions,
		private router: Router,
		private route: ActivatedRoute,
		private authFacade: AuthFacadeService,
	) {
		addIcons({barbellOutline,fitnessOutline});
	}

	ngOnInit() {
		this.actions$.pipe(ofActionSuccessful(LoadRoutineById), takeUntil(this.destroy$)).subscribe(() => {
			const routine = this.store.selectSnapshot(RoutineState.getSelectedRoutine);

			if (routine) {
				this.routine = routine;
				this.subroutines = routine.subRoutines as SubRoutine[];
			}
			this.isLoading = false;
		});

		this.authFacade.user$.subscribe((user) => {
			this.isLoading = true;
			if (user?.routineId) {
				this.store.dispatch(new LoadRoutineById(user.routineId)).subscribe({
					error: () => {
						this.isLoading = false;
					},
				});
			} else {
				this.store.dispatch(new LoadRoutines()).subscribe({
					next: () => {
						const routines = this.store.selectSnapshot(RoutineState.getRoutines);

						if (routines && routines.length > 0) {
							this.store.dispatch(new LoadRoutineById(routines[0]._id)).subscribe({
								error: () => {
									this.isLoading = false;
								},
							});
						} else {
							this.isLoading = false;
						}
					},
					error: () => {
						this.isLoading = false;
					},
				});
			}
		});
	}

	ngOnDestroy() {
		this.destroy$.next();
		this.destroy$.complete();
	}
}
