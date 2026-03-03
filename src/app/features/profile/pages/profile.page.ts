import { AsyncPipe, CommonModule, NgIf } from "@angular/common";
import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { Router } from '@angular/router';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import { Platform } from '@ionic/angular';
import { UserRole } from '@feature/auth/interfaces/user.interface';
import { Logout, UpdateUser } from '@feature/auth/state/auth.actions';
import { AuthState } from '@feature/auth/state/auth.state';
import { User } from "@feature/profile/interfaces/user.interface";
import {
	ActionSheetController,
	IonButton,
	IonContent,
	IonSpinner,
	LoadingController
} from "@ionic/angular/standalone";
import { Select, Store } from "@ngxs/store";
import { AppHeaderComponent } from "@shared/components/app-header/app-header.component";
import { FirebaseStorageService } from "@shared/services/firebase-storage.service";
import { ToastService } from "@shared/services/toast.service";
import { Observable, switchMap, tap, firstValueFrom, take } from "rxjs";
import { ProfileImageNameComponent } from "../components/profile-image-name-info/profile-image-name-info.component";
import { ProfilePersonalInfoComponent } from "../components/profile-personal-info/profile-personal-info.component";
import { ProfilePlanInfoComponent } from "../components/profile-plan-info/profile-plan-info.component";
import { Plan } from "../interfaces/plan.interface";
import { UserService } from "../services/user.service";
import { LoadPlan, LoadUser } from "../state/user.actions";
import { UserState } from "../state/user.state";

@Component({
	selector: "app-profile",
	templateUrl: "./profile.page.html",
	styleUrls: ["./profile.page.scss"],
	imports: [
		IonContent,
		AsyncPipe,
		ProfileImageNameComponent,
		ProfilePersonalInfoComponent,
		ProfilePlanInfoComponent,
		CommonModule,
		IonSpinner,
		IonButton,
		AppHeaderComponent,
	],
	standalone: true,
})
export class ProfilePage implements OnInit {
	@Select(UserState.getUser) user$!: Observable<User | null>;
	@Select(UserState.getPlan) plan$!: Observable<Plan | null>;
	@Select(UserState.isLoading) loading$!: Observable<boolean>;

	age: number | null = null;
	id: string | null = null;
	isNative = Capacitor.isNativePlatform();

	constructor(
		private store: Store,
		private router: Router,
		private firebaseStorage: FirebaseStorageService,
		private userService: UserService,
		private toastService: ToastService,
		private loadingCtrl: LoadingController,
		private actionSheetCtrl: ActionSheetController,
		private platform: Platform,
		private cdr: ChangeDetectorRef
	) { }

	ngOnInit(): void {
		const authUser = this.store.selectSnapshot(AuthState.getUser);
		this.id = authUser?._id || null;
		if (this.id) {
			this.store.dispatch(new LoadUser(this.id));
			this.user$.pipe().subscribe((user) => {
				if (user) {
					const savedAvatar = localStorage.getItem(`avatar_url_${this.id}`);

					const userInfo = {
						_id: (user.userInfo as any)._id || '',
						...user.userInfo,
						historyofPathologicalLesions: String(user.userInfo.historyofPathologicalLesions),
						cardiacHistory: String(user.userInfo.cardiacHistory),
						respiratoryHistory: String(user.userInfo.respiratoryHistory),
						surgicalHistory: String(user.userInfo.surgicalHistory),
						avatarUrl: savedAvatar || user.userInfo.avatarUrl
					};

					const mappedUser = {
						...user,
						role: (user.role as keyof typeof UserRole) in UserRole ? UserRole[user.role as keyof typeof UserRole] : UserRole.USER,
						userInfo
					};
					this.store.dispatch(new UpdateUser(mappedUser));
				}
			});
		}
		this.user$.subscribe((user) => {
			if (user?.userInfo?.dateBirthday) {
				this.age = this.calculateAge(new Date(user.userInfo.dateBirthday));
			}
			if (user?.planId) {
				this.store.dispatch(new LoadPlan(user.planId));
			}
		});
	}

	calculateAge(birthday: Date): number {
		const today = new Date();
		let age = today.getFullYear() - birthday.getFullYear();
		const m = today.getMonth() - birthday.getMonth();
		if (m < 0 || (m === 0 && today.getDate() < birthday.getDate())) {
			age--;
		}
		return age;
	}

	formatDate(dateString: string): string {
		if (!dateString) return "";

		const date = new Date(dateString);
		const options: Intl.DateTimeFormatOptions = {
			year: "numeric",
			month: "long",
			day: "numeric",
		};
		return date.toLocaleDateString("es-ES", options);
	}

	logout(): void {
		this.store.dispatch(new Logout()).pipe(
			tap(() => {
				this.router.navigate(['/login']);
			})
		).subscribe();
	}

	/**
	 * Maneja el evento de clic en la imagen de perfil para cambiarla
	 */
	async onProfileImageClick(): Promise<void> {
		if (this.isNative) {
			// En dispositivo nativo, mostrar opciones para cámara o galería
			await this.showImageSourceOptions();
		} else {
			// En navegador, usar input de archivo
			this.selectImageFromBrowser();
		}
	}

	/**
	 * Muestra el action sheet con opciones para seleccionar imagen
	 */
	private async showImageSourceOptions(): Promise<void> {
		const actionSheet = await this.actionSheetCtrl.create({
			header: 'Cambiar imagen de perfil',
			buttons: [
				{
					text: 'Tomar foto',
					icon: 'camera',
					handler: () => {
						this.captureImage(CameraSource.Camera);
					},
				},
				{
					text: 'Seleccionar de galería',
					icon: 'image',
					handler: () => {
						this.captureImage(CameraSource.Photos);
					},
				},
				{
					text: 'Cancelar',
					icon: 'close',
					role: 'cancel',
				},
			],
		});

		await actionSheet.present();
	}

	/**
	 * Captura imagen desde cámara o galería (dispositivos nativos)
	 */
	private async captureImage(source: CameraSource): Promise<void> {
		const loading = await this.loadingCtrl.create({
			message: 'Procesando imagen...',
			spinner: 'circles',
		});
		await loading.present();

		try {
			const image = await Camera.getPhoto({
				quality: 80,
				allowEditing: false,
				resultType: CameraResultType.DataUrl,
				source: source,
				width: 600,
				correctOrientation: true,
			});

			loading.dismiss();

			if (image?.dataUrl) {
				if (!image.dataUrl.includes('data:image/')) {
					this.toastService.showWarning('Formato de imagen no válido. Use JPG, PNG o GIF.');
					return;
				}

				await this.uploadNewAvatar(image.dataUrl);
			} else {
				this.toastService.showError('No se pudo obtener la imagen. Intente nuevamente.');
			}
		} catch (error) {
			loading.dismiss();
			console.error('Error capturing image:', error);

			if (error instanceof Error && !error.message.includes('cancelled')) {
				this.toastService.showError('Error al capturar la imagen. Intente nuevamente.');
			}
		}
	}

	/**
	 * Selecciona imagen desde el navegador usando input[type=file]
	 */
	private selectImageFromBrowser(): void {
		const input = document.createElement('input');
		input.type = 'file';
		input.accept = 'image/*';
		input.style.display = 'none';

		input.onchange = (event) => {
			const target = event.target as HTMLInputElement;
			if (target.files && target.files.length > 0) {
				this.handleFileSelection(target.files[0]);
			}
			document.body.removeChild(input);
		};

		document.body.appendChild(input);
		setTimeout(() => {
			input.click();
		}, 0);
	}

	/**
	 * Maneja la selección de archivo desde el navegador
	 */
	private handleFileSelection(file: File): void {
		if (!file.type.match('image.*')) {
			this.toastService.showWarning('El archivo seleccionado no es una imagen válida');
			return;
		}

		const reader = new FileReader();
		reader.onload = (e: any) => {
			const dataUrl = e.target.result;
			this.uploadNewAvatar(dataUrl);
		};

		reader.onerror = () => {
			this.toastService.showError('Error al leer el archivo seleccionado');
		};

		reader.readAsDataURL(file);
	}

	/**
	 * Sube el nuevo avatar y actualiza el perfil del usuario
	 */
	private async uploadNewAvatar(base64Image: string): Promise<void> {
		if (!this.id) {
			this.toastService.showError('No se pudo obtener el ID de usuario');
			return;
		}

		const loading = await this.loadingCtrl.create({
			message: 'Subiendo imagen...',
			spinner: 'circular',
			cssClass: 'custom-loading',
		});
		await loading.present();

		try {
			// Obtener la URL actual del avatar para eliminarla después
			const currentUser = await firstValueFrom(this.user$.pipe(take(1)));
			const oldAvatarUrl = currentUser?.userInfo?.avatarUrl;

			// Subir nueva imagen a Firebase Storage
			const newAvatarUrl = await this.firebaseStorage.uploadAvatar(this.id, base64Image);

			if (!newAvatarUrl || newAvatarUrl === base64Image) {
				await loading.dismiss();
				this.toastService.showError('Error al subir la imagen. Intente nuevamente.');
				return;
			}

			// Actualizar el mensaje del loading cerrándolo y abriendo otro
			await loading.dismiss();
			const loadingUpdate = await this.loadingCtrl.create({
				message: 'Actualizando perfil...',
				spinner: 'circular',
				cssClass: 'custom-loading',
			});
			await loadingUpdate.present();

			try {
				// Actualizar el avatar en el backend
				const updatedUser = await firstValueFrom(this.userService.updateAvatar(this.id, newAvatarUrl));

				if (updatedUser) {
					// Recargar el usuario completo desde el backend para asegurar sincronización
					this.store.dispatch(new LoadUser(this.id));

					// Actualizar localStorage
					localStorage.setItem(`avatar_url_${this.id}`, newAvatarUrl);

					// Eliminar la imagen anterior solo si es una URL de Firebase Storage
					if (oldAvatarUrl && oldAvatarUrl !== newAvatarUrl) {
						// Eliminar en segundo plano, no esperamos el resultado
						this.firebaseStorage.deleteAvatarByUrl(oldAvatarUrl).then(
							(deleted) => {
								if (deleted) {
									console.log('Imagen anterior eliminada correctamente');
								}
							}
						).catch(err => {
							console.error('Error al eliminar imagen anterior:', err);
						});
					}

					await loadingUpdate.dismiss();
					this.toastService.showSuccess('Imagen de perfil actualizada correctamente');
					this.cdr.detectChanges();
				} else {
					await loadingUpdate.dismiss();
					this.toastService.showError('Error al actualizar el perfil');
				}
			} catch (updateError) {
				await loadingUpdate.dismiss();
				console.error('Error actualizando perfil:', updateError);
				this.toastService.showError('Error al actualizar el perfil en el servidor');
			}
		} catch (error) {
			console.error('Error uploading avatar:', error);
			await loading.dismiss();
			this.toastService.showError('Error al subir la imagen a Firebase');
		}
	}
}
