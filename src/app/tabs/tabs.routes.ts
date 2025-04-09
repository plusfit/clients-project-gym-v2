import { Routes } from "@angular/router";
import { TabsPage } from "./tabs.page";

export const routes: Routes = [
	{
		path: "cliente",
		component: TabsPage,
		children: [
			{
				path: "inicio",
				loadComponent: () => import("../features/home/pages/home/home.page").then((m) => m.HomePage),
			},
			{
				path: "horarios",
				loadComponent: () =>
					import("@feature/schedule/pages/schedule-page/schedule.page").then((m) => m.SchedulePageComponent),
			},
			{
				path: "rutinas",
				children: [
					{
						path: "",
						loadComponent: () =>
							import("../features/routine/pages/routine-detail.page").then((m) => m.RoutineDetailPage),
					},
					{
						path: "ejercicio/:id",
						loadComponent: () =>
							import("../features/routine/pages/exercise-detail.page").then((m) => m.ExerciseDetailPage),
					},
				],
			},
			{
				path: "perfil",
				loadComponent: () => import("@feature/profile/pages/profile.page").then((m) => m.ProfilePage),
			},
			{
				path: "",
				redirectTo: "/cliente/inicio",
				pathMatch: "full",
			},
			{
				path: "onboarding",
				loadComponent: () => import("../features/onboarding/pages/onboarding.page").then((m) => m.OnboardingPage),
			},
			{
				path: "mi-plan",
				loadComponent: () =>
					import("../features/plans/pages/assigned-plan/assigned-plan.page").then((m) => m.AssignedPlanPage),
			},
		],
	},
	{
		path: "",
		redirectTo: "/cliente/inicio",
		pathMatch: "full",
	},
];
