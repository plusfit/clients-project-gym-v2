import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { environment } from "../../../../environments/environment";

export interface AvailableDaysResponse {
	success: boolean;
	data: {
		availableDays: number;
		totalDays: number;
		planName?: string;
		expiryDate?: string;
	};
}

@Injectable({
	providedIn: "root",
})
export class UserPlanService {
	private apiUrl = environment.apiUrl;

	constructor(private http: HttpClient) {}

	/**
	 * Obtiene los días disponibles del plan del usuario
	 * @param userId ID del usuario
	 * @returns Observable con la información de días disponibles
	 */
	getAvailableDays(userId: string): Observable<{
		availableDays: number;
		totalDays: number;
		planName?: string;
		expiryDate?: string;
	} | null> {
		const url = `${this.apiUrl}/clients/available-days/${userId}`;

		return this.http.get<AvailableDaysResponse>(url).pipe(
			map((response) => {
				if (response.success) {
					return response.data;
				}
				return null;
			}),
			catchError(() => {
				return of(null);
			}),
		);
	}
}
