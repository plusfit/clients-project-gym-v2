import { Action, Selector, State, StateContext } from "@ngxs/store";

import { Injectable } from "@angular/core";
import { User } from "@feature/profile/interfaces/user.interface";
import { of } from "rxjs";
import { catchError, tap } from "rxjs/operators";
import { Plan } from "../interfaces/plan.interface";
import { UserService } from "../services/user.service";
import { LoadPlan, LoadPlanByUser, LoadUser } from "./user.actions";

export interface UserStateModel {
	user: User | null;
	plan: any | null;
	loadingUser: boolean;
	loadingPlan: boolean;
	error: string | null;
}

@Injectable()
@State<UserStateModel>({
	name: "user",
	defaults: {
		loadingUser: false,
		loadingPlan: false,
		user: null,
		plan: null,
		error: null,
	},
})
export class UserState {
	constructor(private userService: UserService) {}

	@Selector()
	static getUser(state: UserStateModel): User | null {
		return state.user;
	}

	@Selector()
	static getPlan(state: UserStateModel): Plan | null {
		return state.plan;
	}

	@Selector()
	static isLoading(state: UserStateModel): boolean {
		return state.loadingUser || state.loadingPlan;
	}

	@Action(LoadUser, { cancelUncompleted: true })
	loadUser(ctx: StateContext<UserStateModel>, action: LoadUser) {
		ctx.patchState({ loadingUser: true, error: null });
		return this.userService.getUser(action.id).pipe(
			tap((user) => {
				ctx.patchState({
					user: user,
					loadingUser: false,
				});
			}),
			catchError((error) => {
				ctx.patchState({
					loadingUser: false,
					error: error.message || "Error al cargar el usuario",
				});
				return of(error);
			}),
		);
	}

	@Action(LoadPlan, { cancelUncompleted: true })
	getPlan(ctx: StateContext<UserStateModel>, action: LoadPlan) {
		ctx.patchState({ loadingPlan: true, error: null });

		return this.userService.getPlanById(action.planId).pipe(
			tap((plan) => ctx.patchState({ plan, loadingPlan: false })),
			catchError((error) => {
				ctx.patchState({
					loadingPlan: false,
					error: error.message || "Error al cargar el plan",
				});
				return of(null);
			}),
		);
	}

	@Action(LoadPlanByUser, { cancelUncompleted: true })
	getPlanByUser(ctx: StateContext<UserStateModel>, action: LoadPlanByUser) {
		ctx.patchState({ loadingPlan: true, error: null });

		return this.userService.getPlanByUserId(action.userId).pipe(
			tap((plan) => ctx.patchState({ plan, loadingPlan: false })),
			catchError((error) => {
				ctx.patchState({
					loadingPlan: false,
					error: error.message || "Error al cargar el plan",
				});
				return of(null);
			}),
		);
	}
}
