import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Injectable } from '@angular/core';
import { inject } from '@angular/core';
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytes,
} from '@angular/fire/storage';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  Camera,
  CameraResultType,
  CameraSource,
  PermissionStatus,
} from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import { User } from '@feature/auth/interfaces/user.interface';
import { AuthState } from '@feature/auth/state/auth.state';
import {
  ActionSheetController,
  IonAvatar,
  IonButton,
  IonButtons,
  IonContent,
  IonFooter,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonNav,
  IonSelect,
  IonSelectOption,
  IonText,
  IonToolbar,
  LoadingController,
  ModalController,
  Platform,
} from '@ionic/angular/standalone';
import { Store } from '@ngxs/store';
import { IonDatetimeModalComponent } from '@shared/components/IonDatetimeModal/ion-datetime-modal.component';
import { ToastService } from '@shared/services/toast.service';
import { addIcons } from 'ionicons';
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
} from 'ionicons/icons';
import { finalize, take } from 'rxjs';
import { LoadOnboardingData, SetStep1 } from '../../state/onboarding.actions';
import { OnboardingState } from '../../state/onboarding.state';
import { OnboardingStep2Component } from '../onboarding.step2/onboarding-step2.component';

@Injectable({
  providedIn: 'root',
})
export class FirebaseStorageService {
  async uploadAvatar(userId: string, base64Image: string): Promise<string> {
    try {
      const format = base64Image.split(';')[0].split('/')[1];
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
        console.error('Error uploading image:', uploadError);
        return base64Image;
      }
    } catch (error) {
      console.error('Error processing image for upload:', error);
      return base64Image;
    }
  }

  private dataURItoBlob(dataURI: string): Blob {
    let byteString: string;
    if (dataURI.split(',')[0].indexOf('base64') >= 0) {
      byteString = atob(dataURI.split(',')[1]);
    } else {
      byteString = decodeURIComponent(dataURI.split(',')[1]);
    }

    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }

    return new Blob([ab], { type: mimeString });
  }
}

@Component({
  selector: 'app-step1',
  standalone: true,
  providers: [ActionSheetController],
  imports: [
    IonButtons,
    IonAvatar,
    CommonModule,
    ReactiveFormsModule,
    IonList,
    IonItem,
    IonInput,
    IonText,
    IonButton,
    IonIcon,
    IonLabel,
    IonSelect,
    IonSelectOption,
    IonFooter,
    IonToolbar,
    IonButtons,
    IonContent,
    OnboardingStep2Component,
  ],
  templateUrl: './onboarding-step1.component.html',
  styleUrls: ['./onboarding-step1.component.scss'],
})
export class OnboardingStep1Component implements OnInit {
  @Input() nav!: IonNav;
  @ViewChild('fileInput') fileInput!: ElementRef;

  userForm: FormGroup;
  isSubmitting = false;
  isLoading = false;
  hasPermissions = false;
  isNative = false;

  avatarUrlPreview: string | null = null;
  private avatarFileToUpload: string | null = null;
  private currentUserId: string | null = null;

  private storageService = inject(FirebaseStorageService);
  private toastService = inject(ToastService);
  private cdr = inject(ChangeDetectorRef);
  private platform = inject(Platform);

  constructor(
    private fb: FormBuilder,
    private modalCtrl: ModalController,
    private actionSheetCtrl: ActionSheetController,
    private store: Store,
    private loadingCtrl: LoadingController,
  ) {
    addIcons({
      'person-outline': personOutline,
      'home-outline': homeOutline,
      'call-outline': callOutline,
      'medkit-outline': medkitOutline,
      'calendar-outline': calendarOutline,
      'people-outline': peopleOutline,
      'card-outline': cardOutline,
      'arrow-forward': arrowForward,
      camera,
      'finger-print-outline': fingerPrintOutline,
      image,
      close,
    });

    this.userForm = this.fb.group({
      fullName: ['', Validators.required],
      address: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern(/^09\d{7}$/)]],
      mutual: ['', Validators.required],
      dateOfBirth: ['', Validators.required],
      sex: ['', Validators.required],
      ci: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
      avatarUrl: [null],
    });
  }

  async ngOnInit() {
    console.log('ngOnInit');
    this.isLoading = true;
    const loading = await this.loadingCtrl.create({
      message: 'Cargando información...',
      spinner: 'circles',
      cssClass: 'loading-content',
    });
    await loading.present();

    // Check if running on native device or browser
    this.isNative = Capacitor.isNativePlatform();

    try {
      if (this.isNative) {
        const permissionStatus = await Camera.checkPermissions();
        this.hasPermissions = this.checkCameraPermissions(permissionStatus);
        if (!this.hasPermissions) {
          this.toastService.showWarning(
            'Se necesitan permisos de cámara para la foto de perfil',
          );
        }
      }
    } catch (error) {
      console.error('Error checking camera permissions:', error);
      this.toastService.showWarning(
        'No se pudieron verificar los permisos de cámara',
      );
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
              if (step1Data) {
                this.userForm.patchValue(step1Data);
                if (step1Data.avatarUrl) {
                  this.avatarUrlPreview = step1Data.avatarUrl;
                }

                this.store
                  .select(OnboardingState.getCurrentStep)
                  .pipe(take(1))
                  .subscribe((currentStep) => {
                    if (currentStep > 1) {
                      this.goToNextStep(currentStep, step1Data);
                    }
                  });
              }
            });
        },
        error: (error) => {
          console.error('Error loading onboarding data:', error);
        },
      });
  }

  private checkCameraPermissions(status: PermissionStatus): boolean {
    return status.camera === 'granted' && status.photos === 'granted';
  }

  private obtenerUserID() {
    try {
      const userId = localStorage.getItem('userId');
      if (userId) {
        this.currentUserId = userId;
        this.cargarImagenTemporal();
      } else {
        console.warn('No se encontró userId en localStorage');
        this.store
          .select(AuthState.getUser)
          .pipe(take(1))
          .subscribe((user: User | null) => {
            if (user?._id) {
              this.currentUserId = user._id;
              this.cargarImagenTemporal();
            } else {
              this.toastService.showError(
                'No se pudo obtener el ID de usuario',
              );
            }
          });
      }
    } catch (error) {
      console.error('Error obteniendo ID de usuario:', error);
      this.toastService.showError('Error al obtener el ID de usuario');
    }
  }

  private cargarImagenTemporal() {
    if (this.currentUserId) {
      const tempAvatar = localStorage.getItem(
        `temp_avatar_${this.currentUserId}`,
      );
      if (tempAvatar) {
        this.avatarUrlPreview = tempAvatar;
        this.cdr.detectChanges();
      }
    }
  }

  async selectAvatarImage() {
    if (this.isNative) {
      if (!this.hasPermissions) {
        await this.requestCameraPermissions();
      }

      const actionSheet = await this.actionSheetCtrl.create({
        header: 'Seleccionar imagen de perfil',
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
    } else {
      // Browser fallback - use file input for gallery
      this.selectImageWithFileInput();
    }
  }

  selectImageWithFileInput() {
    // First try to use the ViewChild reference if available
    if (this.fileInput?.nativeElement) {
      this.fileInput.nativeElement.click();
      return;
    }

    // Fallback method - dynamically create input
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.style.display = 'none';

    input.onchange = (event) => {
      const target = event.target as HTMLInputElement;
      if (target.files && target.files.length > 0) {
        this.handleFileBrowserSelection(target.files[0]);
      }
      // Remove the element after use to prevent memory leaks
      document.body.removeChild(input);
    };

    // Add to body and trigger click
    document.body.appendChild(input);

    // Use setTimeout to ensure the element is added to the DOM before clicking
    setTimeout(() => {
      input.click();
    }, 0);
  }

  handleFileInputChange(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      this.handleFileBrowserSelection(target.files[0]);
    }
  }

  handleFileBrowserSelection(file: File) {
    if (!file.type.match('image.*')) {
      this.toastService.showWarning(
        'El archivo seleccionado no es una imagen válida',
      );
      return;
    }

    const reader = new FileReader();
    reader.onload = (e: any) => {
      const dataUrl = e.target.result;
      this.avatarUrlPreview = dataUrl;
      this.avatarFileToUpload = dataUrl;
      this.cdr.detectChanges();

      this.toastService.showSuccess('Imagen seleccionada correctamente');

      if (this.currentUserId) {
        localStorage.setItem(`temp_avatar_${this.currentUserId}`, dataUrl);
      }
    };

    reader.onerror = () => {
      this.toastService.showError('Error al leer el archivo seleccionado');
    };

    reader.readAsDataURL(file);
  }

  async requestCameraPermissions() {
    try {
      const permissionStatus = await Camera.requestPermissions();
      this.hasPermissions = this.checkCameraPermissions(permissionStatus);

      if (!this.hasPermissions) {
        this.toastService.showWarning(
          'Es necesario otorgar permisos para usar la cámara o acceder a las fotos',
        );
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error requesting camera permissions:', error);
      this.toastService.showError(
        'No se pudieron solicitar los permisos de cámara',
      );
      return false;
    }
  }

  async captureImage(source: CameraSource) {
    const loading = await this.loadingCtrl.create({
      message:
        source === CameraSource.Camera
          ? 'Abriendo cámara...'
          : 'Abriendo galería...',
      spinner: 'circles',
      cssClass: 'loading-content',
      duration: 5000,
    });

    await loading.present();

    try {
      const permissionStatus = await Camera.checkPermissions();
      const needsPermissions =
        (source === CameraSource.Camera &&
          permissionStatus.camera !== 'granted') ||
        (source === CameraSource.Photos &&
          permissionStatus.photos !== 'granted');

      if (needsPermissions) {
        loading.dismiss();
        const granted = await this.requestCameraPermissions();
        if (!granted) {
          return;
        }
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
        if (!image.dataUrl.includes('data:image/')) {
          this.toastService.showWarning(
            'Formato de imagen no válido. Use JPG, PNG o GIF.',
          );
          return;
        }

        this.avatarUrlPreview = image.dataUrl;
        this.avatarFileToUpload = image.dataUrl;
        this.cdr.detectChanges();

        this.toastService.showSuccess('Imagen seleccionada correctamente');

        if (this.currentUserId) {
          localStorage.setItem(
            `temp_avatar_${this.currentUserId}`,
            image.dataUrl,
          );
        }
      } else {
        this.toastService.showError(
          'No se pudo obtener la imagen. Intente nuevamente.',
        );
      }
    } catch (error) {
      loading.dismiss();
      console.error('Error capturing image:', error);
      this.toastService.showError(
        error instanceof Error
          ? error.message
          : 'No se pudo seleccionar la imagen. Intente nuevamente.',
      );
    }
  }

  setDateOfBirth(event: any) {
    const date = event.detail.value;
    this.userForm.get('dateOfBirth')?.setValue(date);
  }

  async nextStep() {
    if (this.userForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      const loading = await this.loadingCtrl.create({
        message: 'Guardando información...',
        spinner: 'circles',
        cssClass: 'loading-content',
      });
      await loading.present();

      const step1Data = { ...this.userForm.value };
      let finalAvatarUrl: string | null = this.avatarUrlPreview;

      if (this.avatarFileToUpload && this.currentUserId) {
        try {
          loading.message = 'Subiendo imagen...';
          finalAvatarUrl = await this.storageService.uploadAvatar(
            this.currentUserId,
            this.avatarFileToUpload,
          );
          loading.message = 'Guardando información...';

          if (finalAvatarUrl) {
            localStorage.setItem(
              `avatar_url_${this.currentUserId}`,
              finalAvatarUrl,
            );
          }
        } catch (error) {
          console.error('Error uploading avatar:', error);
          const prevData = this.store.selectSnapshot(OnboardingState.getStep1);
          finalAvatarUrl = prevData?.avatarUrl || null;

          this.toastService.showWarning(
            'No se pudo subir la imagen. Se usará la foto anterior.',
          );
        }
      }

      step1Data.avatarUrl = finalAvatarUrl;

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
            this.nav.push(OnboardingStep2Component, {
              step1Data,
              nav: this.nav,
            });
          },
          error: (error) => {
            console.error('Error setting step 1 data:', error);
            this.nav.push(OnboardingStep2Component, {
              step1Data,
              nav: this.nav,
            });
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
    const today = new Date().toISOString().split('T')[0];
    const modal = await this.modalCtrl.create({
      component: IonDatetimeModalComponent,
      breakpoints: [0, 0.4],
      initialBreakpoint: 0.6,
      componentProps: {
        value: this.userForm.get('dateOfBirth')?.value,
        max: today,
      },
      cssClass: 'datepicker-sheet',
    });

    modal.onWillDismiss().then((data) => {
      const selected = data.data;
      if (selected) {
        this.userForm.get('dateOfBirth')?.setValue(selected);
      }
    });
    await modal.present();
  }
}
