import { CommonModule } from "@angular/common";
import { Component, Input, OnInit } from "@angular/core";
import { Injectable } from "@angular/core";
import { inject } from "@angular/core";
import { Storage, getDownloadURL, getStorage, ref, uploadBytes } from "@angular/fire/storage";
import {
	AbstractControl,
	FormBuilder,
	FormGroup,
	ReactiveFormsModule,
	ValidationErrors,
	Validators,
} from "@angular/forms";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import { User } from "@feature/auth/interfaces/user.interface";
import { AuthState } from "@feature/auth/state/auth.state";
import { ActionSheetController, ModalController } from "@ionic/angular";
import { IonNav, IonicModule, LoadingController } from "@ionic/angular";
import { Store } from "@ngxs/store";
import { IonDatetimeModalComponent } from "@shared/components/IonDatetimeModal/ion-datetime-modal.component";
import { ToastService } from "@shared/services/toast.service";
import { environment } from "environments/environment";
import { addIcons } from "ionicons";
import {
	arrowForward,
	calendarOutline,
	callOutline,
	camera,
	cardOutline,
	close,
	fingerPrintOutline,
	homeOutline,
	image,
	medkitOutline,
	peopleOutline,
	personOutline,
} from "ionicons/icons";
import { finalize, from, lastValueFrom, take } from "rxjs";
import { OnboardingService } from "../../services/onboarding.service";
import { LoadOnboardingData, SetStep1 } from "../../state/onboarding.actions";
import { OnboardingState } from "../../state/onboarding.state";
import { OnboardingStep2Component } from "../onboarding.step2/onboarding-step2.component";

@Injectable({
	providedIn: "root",
})
export class FirebaseStorageService {
	private storage = inject(Storage);

	async uploadAvatar(userId: string, base64Image: string): Promise<string> {
		try {
			const format = base64Image.split(";")[0].split("/")[1];
			const blob = this.dataURItoBlob(base64Image);
			const fileName = `${userId}_${Date.now()}.${format}`;
			const filePath = `avatars/${fileName}`;
			const storageInstance = getStorage();
			const fileRef = ref(storageInstance, filePath);

			try {
				const snapshot = await uploadBytes(fileRef, blob);

				const downloadURL = await getDownloadURL(fileRef);

				return downloadURL;
			} catch (uploadError) {
				return base64Image;
			}
		} catch (error) {
			return base64Image;
		}
	}

	private dataURItoBlob(dataURI: string): Blob {
		let byteString: string;
		if (dataURI.split(",")[0].indexOf("base64") >= 0) {
			byteString = atob(dataURI.split(",")[1]);
		} else {
			byteString = decodeURIComponent(dataURI.split(",")[1]);
		}

		const mimeString = dataURI.split(",")[0].split(":")[1].split(";")[0];
		const ab = new ArrayBuffer(byteString.length);
		const ia = new Uint8Array(ab);
		for (let i = 0; i < byteString.length; i++) {
			ia[i] = byteString.charCodeAt(i);
		}

		return new Blob([ab], { type: mimeString });
	}
}

@Component({
	selector: "app-step1",
	standalone: true,
	imports: [CommonModule, IonicModule, ReactiveFormsModule],
	templateUrl: "./onboarding-step1.component.html",
	styleUrls: ["./onboarding-step1.component.scss"],
})
export class OnboardingStep1Component implements OnInit {
	@Input() nav!: IonNav;
	userForm: FormGroup;
	isSubmitting = false;
	isLoading = false;

	avatarUrlPreview: string | null = null;
	private avatarFileToUpload: string | null = null;
	private currentUserId: string | null = null;

	private storageService = inject(FirebaseStorageService);
	private toastService = inject(ToastService);

	constructor(
		private fb: FormBuilder,
		private modalCtrl: ModalController,
		private actionSheetCtrl: ActionSheetController,
		private store: Store,
		private onboardingService: OnboardingService,
		private loadingCtrl: LoadingController
	) {
		addIcons({
			"person-outline": personOutline,
			"home-outline": homeOutline,
			"call-outline": callOutline,
			"medkit-outline": medkitOutline,
			"calendar-outline": calendarOutline,
			"people-outline": peopleOutline,
			"card-outline": cardOutline,
			"arrow-forward": arrowForward,
			camera,
			"finger-print-outline": fingerPrintOutline,
			image,
			close,
		});

		this.userForm = this.fb.group({
			fullName: ["", Validators.required],
			address: ["", Validators.required],
			phone: ["", [Validators.required, Validators.pattern(/^09\d{7}$/)]],
			mutual: ["", Validators.required],
			dateOfBirth: ["", Validators.required],
			sex: ["", Validators.required],
			ci: ["", [Validators.required, Validators.pattern(/^\d{8}$/)]],
			avatarUrl: [null],
		});
	}

	async ngOnInit() {
		this.isLoading = true;
		const loading = await this.loadingCtrl.create({
			message: "Cargando información...",
			spinner: "circles",
			cssClass: "loading-content",
		});
		await loading.present();

		try {
			await Camera.checkPermissions();
			console.log("Permisos de cámara verificados");
		} catch (error) {
			console.error("Error al verificar permisos de cámara:", error);
		}

		this.obtenerUserID();

		this.store
			.dispatch(new LoadOnboardingData())
			.pipe(
				finalize(() => {
					this.isLoading = false;
					loading.dismiss();
				}),
			)
			.subscribe({
				next: () => {
					this.store
						.select(OnboardingState.getStep1)
						.pipe(take(1))
						.subscribe((step1Data) => {
							console.log("Datos Step1 recibidos:", step1Data);
							if (step1Data) {
								this.userForm.patchValue(step1Data);
								if (step1Data.avatarUrl) {
									this.avatarUrlPreview = step1Data.avatarUrl;
								}
								console.log("Formulario después de patchValue:", this.userForm.value);

								this.store
									.select(OnboardingState.getCurrentStep)
									.pipe(take(1))
									.subscribe((currentStep) => {
										console.log("Current step:", currentStep);
										if (currentStep > 1) {
											this.goToNextStep(currentStep, step1Data);
										}
									});
							}
						});
				},
				error: (error) => {
					console.error("Error al cargar datos de onboarding:", error);
				},
			});
	}

	private obtenerUserID() {
		try {
			const userId = localStorage.getItem("userId");
			if (userId) {
				this.currentUserId = userId;
				console.log("User ID obtenido:", this.currentUserId);
				this.cargarImagenTemporal();
			} else {
				console.warn("No se encontró userId en localStorage");
				this.store.select(AuthState.getUser).pipe(take(1)).subscribe((user: User | null) => {
					if (user?._id) {
						this.currentUserId = user._id;
						this.cargarImagenTemporal();
					} else {
						this.toastService.showError("No se pudo obtener el ID de usuario");
					}
				});
			}
		} catch (error) {
			this.toastService.showError("Error al obtener el ID de usuario");
		}
	}

	private cargarImagenTemporal() {
		if (this.currentUserId) {
			const tempAvatar = localStorage.getItem(`temp_avatar_${this.currentUserId}`);
			if (tempAvatar) {
				this.avatarUrlPreview = tempAvatar;
			}
		}
	}

	async selectAvatarImage() {
		const actionSheet = await this.actionSheetCtrl.create({
			header: "Seleccionar imagen de perfil",
			buttons: [
				{
					text: "Tomar foto",
					icon: "camera",
					handler: () => {
						this.captureImage(CameraSource.Camera);
					},
				},
				{
					text: "Seleccionar de galería",
					icon: "image",
					handler: () => {
						this.captureImage(CameraSource.Photos);
					},
				},
				{
					text: "Cancelar",
					icon: "close",
					role: "cancel",
				},
			],
		});

		await actionSheet.present();
	}

	async captureImage(source: CameraSource) {
		const loading = await this.loadingCtrl.create({
			message: source === CameraSource.Camera ? "Abriendo cámara..." : "Abriendo galería...",
			spinner: "circles",
			duration: 5000,
		});

		await loading.present();

		try {
			const permissionStatus = await Camera.checkPermissions();
			console.log("Estado de permisos:", permissionStatus);

			if (permissionStatus.camera !== "granted" && source === CameraSource.Camera) {
				await Camera.requestPermissions();
			}

			if (permissionStatus.photos !== "granted" && source === CameraSource.Photos) {
				await Camera.requestPermissions();
			}

			const image = await Camera.getPhoto({
				quality: 90,
				allowEditing: true,
				resultType: CameraResultType.DataUrl,
				source: source,
				width: 600,
				correctOrientation: true,
			});

			loading.dismiss();

			if (image?.dataUrl) {
				if (!image.dataUrl.includes("data:image/")) {
					this.toastService.showWarning("Formato de imagen no válido. Use JPG, PNG o GIF.");
					return;
				}

				this.avatarUrlPreview = image.dataUrl;
				this.avatarFileToUpload = image.dataUrl;

				this.toastService.showSuccess("Imagen seleccionada correctamente");

				if (this.currentUserId) {
					localStorage.setItem(`temp_avatar_${this.currentUserId}`, image.dataUrl);
				}
			} else {
				this.toastService.showError("No se pudo obtener la imagen. Intente nuevamente.");
			}
		} catch (error) {
			loading.dismiss();
			this.toastService.showError(
				error instanceof Error ? error.message : "No se pudo seleccionar la imagen. Intente nuevamente.",
			);
		}
	}

	setDateOfBirth(event: any) {
		const date = event.detail.value;
		this.userForm.get("dateOfBirth")?.setValue(date);
	}

	async nextStep() {
		if (this.userForm.valid && !this.isSubmitting) {
			this.isSubmitting = true;
			const loading = await this.loadingCtrl.create({
				message: "Guardando información...",
				spinner: "circles",
			});
			await loading.present();

			const step1Data = { ...this.userForm.value };
			let finalAvatarUrl: string | null = this.avatarUrlPreview;

			if (this.avatarFileToUpload && this.currentUserId) {
				try {
					finalAvatarUrl = await this.storageService.uploadAvatar(this.currentUserId, this.avatarFileToUpload);

					if (finalAvatarUrl) {
						localStorage.setItem(`avatar_url_${this.currentUserId}`, finalAvatarUrl);
					}
				} catch (error) {
					console.error("Error al subir imagen:", error);
					const prevData = this.store.selectSnapshot(OnboardingState.getStep1);
					finalAvatarUrl = prevData?.avatarUrl || null;

					this.toastService.showWarning("No se pudo subir la imagen. Se usará la foto anterior.");
				}
			}

			step1Data.avatarUrl = finalAvatarUrl;
			console.log("Datos finales a enviar al backend:", step1Data);

			this.store
				.dispatch(new SetStep1(step1Data))
				.pipe(
					finalize(() => {
						this.isSubmitting = false;
						loading.dismiss();
					}),
				)
				.subscribe({
					next: () => {
						this.nav.push(OnboardingStep2Component, { step1Data, nav: this.nav });
					},
					error: (error) => {
						console.error("Error en el paso 1 del onboarding:", error);
						this.nav.push(OnboardingStep2Component, { step1Data, nav: this.nav });
					},
				});
		} else {
			this.userForm.markAllAsTouched();
		}
	}

	private goToNextStep(currentStep: number, step1Data: any) {
		if (currentStep >= 2) {
			this.nav.push(OnboardingStep2Component, { step1Data, nav: this.nav });
		}
	}

	isInvalid(controlName: string): boolean {
		const control = this.userForm.get(controlName);
		return (control?.invalid && control?.touched) || false;
	}

	async openBirthdateModal() {
		const today = new Date().toISOString().split("T")[0];
		const modal = await this.modalCtrl.create({
			component: IonDatetimeModalComponent,
			breakpoints: [0, 0.4],
			initialBreakpoint: 0.6,
			componentProps: {
				value: this.userForm.get("dateOfBirth")?.value,
				max: today,
			},
			cssClass: "datepicker-sheet",
		});

		modal.onWillDismiss().then((data) => {
			const selected = data.data;
			if (selected) {
				this.userForm.get("dateOfBirth")?.setValue(selected);
			}
		});
		await modal.present();
	}
}
