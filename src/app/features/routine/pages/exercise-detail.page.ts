import { AsyncPipe, NgClass, NgIf, NgOptimizedImage, UpperCasePipe } from "@angular/common";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, RouterLink } from "@angular/router";
import {
	IonButton,
	IonCard,
	IonCardContent,
	IonCardHeader,
	IonCardTitle,
	IonContent,
	IonIcon,
	IonSpinner,
} from "@ionic/angular/standalone";
import { addIcons } from "ionicons";
import {
	alertCircleOutline,
	arrowForward,
	documentTextOutline,
	fitnessOutline,
	informationCircleOutline,
	layersOutline,
	listOutline,playCircle, 
	repeatOutline,
	starOutline,
	stopwatchOutline,
	timeOutline } from "ionicons/icons";

import { LoadSelectedExercise, RoutineState } from "@feature/routine/state/routine.state";
import { Select, Store } from "@ngxs/store";
import { AppHeaderComponent } from "@shared/components/app-header/app-header.component";
import { PluralizePipe } from "@shared/pipes/pluralize.pipe";
import { Observable, Subject, takeUntil } from "rxjs";
import { Exercise } from "../interfaces/routine.interface";

declare module "../interfaces/routine.interface" {
	interface Exercise {
		instructions?: string;
		category?: string;
	}
}

@Component({
	selector: "app-exercise-detail",
	standalone: true,
	templateUrl: "./exercise-detail.page.html",
	styleUrls: ["./exercise-detail.page.scss"],
	imports: [
		NgIf,
		IonContent,
		IonCard,
		IonCardHeader,
		IonCardTitle,
		IonCardContent,
		IonSpinner,
		IonIcon,
		AsyncPipe,
		NgOptimizedImage,
		UpperCasePipe,
		NgClass,
		IonButton,
		RouterLink,
		PluralizePipe,
		AppHeaderComponent,
	],
})
export class ExerciseDetailPage implements OnInit, OnDestroy {
	@Select(RoutineState.getSelectedExercise)
	selectedExercise$!: Observable<Exercise | null>;
	isLoading = false;
	showPlayButton = false; // Para mostrar botón de play si autoplay falla
	private destroy$ = new Subject<void>();

	constructor(
		private route: ActivatedRoute,
		private store: Store,
	) {
		// Registrar todos los iconos utilizados en el componente
		addIcons({playCircle,starOutline,documentTextOutline,informationCircleOutline,timeOutline,repeatOutline,layersOutline,stopwatchOutline,listOutline,alertCircleOutline,fitnessOutline,arrowForward,});
	}

	ngOnInit() {
		const exerciseId = this.route.snapshot.paramMap.get("id");
		if (exerciseId) {
			this.isLoading = true;
			this.store
				.dispatch(new LoadSelectedExercise(exerciseId))
				.pipe(takeUntil(this.destroy$))
				.subscribe({
					next: () => {
						this.isLoading = false;
					},
					error: () => {
						this.isLoading = false;
					},
				});
		}
	}

	ngOnDestroy() {
		this.destroy$.next();
		this.destroy$.complete();
	}

	isVideo(url: string, exercise?: Exercise): boolean {
		if (!url) return false;
		
		// Si tenemos información del ejercicio y mediaType está definido, úsalo
		if (exercise?.mediaType) {
			return exercise.mediaType === 'video';
		}
		
		// Para URLs de Firebase Storage, intentamos detectar mediante patrones comunes
		if (url.includes('firebasestorage.googleapis.com')) {
			// Si podemos extraer el nombre del archivo de la URL
			const urlParts = url.split('/');
			const fileNamePart = urlParts.find(part => part.includes('%2F') || part.includes('.'));
			
			if (fileNamePart) {
				// Decodificar URL encoded characters
				const decodedPart = decodeURIComponent(fileNamePart);
				return decodedPart.toLowerCase().includes('.mp4') ||
					   decodedPart.toLowerCase().includes('.webm') ||
					   decodedPart.toLowerCase().includes('.mov') ||
					   decodedPart.toLowerCase().includes('.avi');
			}
			
			// TEMPORAL: Si no podemos detectar, intentar cargar como video primero
			// Esto es arriesgado pero puede funcionar para testing
			return url.includes('excercises'); // Asume que los videos están en la carpeta exercises
		}
		
		// Para URLs normales, verificar extensión
		return url.toLowerCase().includes('.mp4') || 
			   url.toLowerCase().includes('.webm') || 
			   url.toLowerCase().includes('.mov') ||
			   url.toLowerCase().includes('.avi');
	}

	onVideoLoaded(event: Event): void {
		const video = event.target as HTMLVideoElement;
		if (video) {
			// Intentar reproducir el video cuando esté cargado
			const playPromise = video.play();
			
			if (playPromise !== undefined) {
				playPromise
					.then(() => {
						this.showPlayButton = false;
					})
					.catch((error) => {
						// Autoplay falló, mostrar botón de play
						console.warn('Autoplay falló:', error);
						this.showPlayButton = true;
					});
			}
		}
	}

	onVideoError(event: Event): void {
		const video = event.target as HTMLVideoElement;
		console.error('Error cargando video:', video?.error);
	}

	playVideo(videoElement: HTMLVideoElement): void {
		if (videoElement) {
			videoElement.play()
				.then(() => {
					this.showPlayButton = false;
				})
				.catch((error) => {
					console.error('Error al reproducir video:', error);
				});
		}
	}
}
