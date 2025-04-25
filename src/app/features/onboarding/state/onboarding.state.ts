import { Action, Selector, State, StateContext } from "@ngxs/store";

import { Injectable } from "@angular/core";
import { of } from "rxjs";
import { catchError, switchMap, tap } from "rxjs/operators";
import { Step1, Step2, Step3 } from "../interfaces/onboarding.interfaces";
import { OnboardingService } from "../services/onboarding.service";
import { InitOnboarding, LoadOnboardingData, SetStep1, SetStep2, SetStep3 } from "./onboarding.actions";

export interface OnBoardingStateModel {
	isInitialized: boolean;
	isLoading: boolean;
	step1: Step1 | null;
	step2: Step2 | null;
	step3: Step3 | null;
	currentStep: number;
}

@Injectable()
@State<OnBoardingStateModel>({
	name: "onboarding",
	defaults: {
		isInitialized: false,
		isLoading: false,
		step1: null,
		step2: null,
		step3: null,
		currentStep: 1,
	},
})
export class OnboardingState {
	constructor(private onboardingService: OnboardingService) {}

	@Selector()
	static getStep1(state: OnBoardingStateModel) {
		return state.step1;
	}

	@Selector()
	static getStep2(state: OnBoardingStateModel) {
		return state.step2;
	}

	@Selector()
	static getStep3(state: OnBoardingStateModel) {
		return state.step3;
	}

	@Selector()
	static isComplete(state: OnBoardingStateModel) {
		return state.step1 !== null && state.step2 !== null && state.step3 !== null;
	}

	@Selector()
	static isInitialized(state: OnBoardingStateModel) {
		return state.isInitialized;
	}

	@Selector()
	static isLoading(state: OnBoardingStateModel) {
		return state.isLoading;
	}

	@Selector()
	static getCurrentStep(state: OnBoardingStateModel) {
		return state.currentStep;
	}

	@Action(LoadOnboardingData)
	loadOnboardingData(ctx: StateContext<OnBoardingStateModel>) {
		const state = ctx.getState();

		ctx.patchState({ isLoading: true });

		return this.onboardingService.getOnboarding().pipe(
			tap((response) => {
				if (response?.data) {
					// La estructura real tiene data.data que contiene los steps
					const { step, completed } = response.data;
					const onboardingData = response.data.data || {};

					// Actualizar el estado con los datos cargados
					ctx.patchState({
						isInitialized: true,
						step1: onboardingData.step1 || null,
						step2: onboardingData.step2 || null,
						step3: onboardingData.step3 || null,
						currentStep: step || 1,
						isLoading: false,
					});
				} else {
					ctx.patchState({ isLoading: false });
				}
			}),
			catchError((error) => {
				ctx.patchState({ isLoading: false });

				// Si el error es 404, significa que no hay datos para el usuario
				if (error.status === 404) {
					// Disparamos acción para inicializar el onboarding
					return ctx.dispatch(new InitOnboarding());
				}

				return of(state);
			}),
		);
	}

	@Action(InitOnboarding)
	initOnboarding(ctx: StateContext<OnBoardingStateModel>) {
		const state = ctx.getState();

		// Si ya está inicializado, no hacer nada
		if (state.isInitialized) {
			return of(state);
		}

		// Crear el documento de onboarding vacío con la estructura correcta según el DTO
		return this.onboardingService
			.createOnboarding({
				userId: this.onboardingService["userId"],
				step: 1, // Current step, required by DTO
				completed: false,
				data: {
					// La estructura correcta según el DTO
					step1: undefined, // Se llenará después con SetStep1
					step2: undefined,
					step3: undefined,
				},
			})
			.pipe(
				tap(() => {
					ctx.patchState({ isInitialized: true });
				}),
				catchError((error) => {
					// Si el error es porque ya existe (409 Conflict) marcamos como inicializado
					if (error.status === 409 || error.status === 400) {
						ctx.patchState({ isInitialized: true });
					}
					return of(state);
				}),
			);
	}

	@Action(SetStep1, { cancelUncompleted: true })
	setStep1(ctx: StateContext<OnBoardingStateModel>, action: SetStep1) {
		const state = ctx.getState();

		// Si no está inicializado, inicializar primero
		if (!state.isInitialized) {
			return ctx.dispatch(new InitOnboarding()).pipe(
				switchMap(() => {
					// Luego continuar con la actualización del paso 1
					return this.onboardingService.updateStep1(action.step).pipe(
						tap(() => {
							ctx.patchState({
								step1: action.step,
								currentStep: 2,
							});
						}),
						catchError((error) => {
							// Actualizar el estado local aunque falle el backend
							ctx.patchState({
								step1: action.step,
								currentStep: 2,
							});
							return of(state);
						}),
					);
				}),
			);
		}

		// Si ya está inicializado, solo actualizar paso 1
		return this.onboardingService.updateStep1(action.step).pipe(
			tap(() => {
				ctx.patchState({
					step1: action.step,
					currentStep: 2,
				});
			}),
			catchError((error) => {
				// Actualizar el estado local aunque falle el backend
				ctx.patchState({
					step1: action.step,
					currentStep: 2,
				});
				return of(state);
			}),
		);
	}

	@Action(SetStep2, { cancelUncompleted: true })
	setStep2(ctx: StateContext<OnBoardingStateModel>, action: SetStep2) {
		const state = ctx.getState();

		return this.onboardingService.updateStep2(action.step).pipe(
			tap(() => {
				ctx.patchState({
					step2: action.step,
					currentStep: 3,
				});
			}),
			catchError((error) => {
				// Actualizar el estado local aunque falle el backend
				ctx.patchState({
					step2: action.step,
					currentStep: 3,
				});
				return of(state);
			}),
		);
	}

	@Action(SetStep3, { cancelUncompleted: true })
	setStep3(ctx: StateContext<OnBoardingStateModel>, action: SetStep3) {
		const state = ctx.getState();

		return this.onboardingService.updateStep3(action.step).pipe(
			tap(() => {
				ctx.patchState({
					step3: action.step,
					currentStep: 4,
				});
			}),
			catchError((error) => {
				// Actualizar el estado local aunque falle el backend
				ctx.patchState({
					step3: action.step,
					currentStep: 4,
				});
				return of(state);
			}),
		);
	}
}
