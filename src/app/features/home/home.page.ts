import { CommonModule } from "@angular/common";
import { HttpClient } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";
import { RouterModule } from "@angular/router";
import { IonicModule, LoadingController } from "@ionic/angular";
import { environment } from "environments/environment";

@Component({
	selector: "app-home",
	templateUrl: "home.page.html",
	styleUrls: ["home.page.scss"],
	standalone: true,
	imports: [IonicModule, CommonModule, RouterModule],
})
export class HomePage implements OnInit {
	hasAssignedPlan = false;
	planName = "";
	userId: string;

	constructor(
		private http: HttpClient,
		private loadingCtrl: LoadingController,
	) {
		this.userId = localStorage.getItem("userId") || "currentUser";
	}

	async ngOnInit() {
		await this.checkAssignedPlan();
	}

	/**
	 * Verifica si el usuario tiene un plan asignado
	 */
	async checkAssignedPlan() {
		const loading = await this.loadingCtrl.create({
			message: "Cargando información...",
			spinner: "circles",
			cssClass: "loading-content",
		});

		await loading.present();

		try {
			// Obtener el cliente con su plan asignado
			const response = await this.http.get<any>(`${environment.apiUrl}/clients/${this.userId}`).toPromise();

			if (response && response.planId) {
				this.hasAssignedPlan = true;

				// Obtener los detalles del plan para mostrar el nombre
				const planResponse = await this.http.get<any>(`${environment.apiUrl}/plans/${response.planId}`).toPromise();
				if (planResponse) {
					this.planName = planResponse.name;
				}
			} else {
				this.hasAssignedPlan = false;
			}
		} catch (error) {
			this.hasAssignedPlan = false;
		} finally {
			loading.dismiss();
		}
	}
}
