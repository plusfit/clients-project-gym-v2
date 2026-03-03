import { Injectable } from '@angular/core';
import {
    deleteObject,
    getDownloadURL,
    getStorage,
    ref,
    uploadBytes,
} from '@angular/fire/storage';

@Injectable({
    providedIn: 'root',
})
export class FirebaseStorageService {
    /**
     * Sube una imagen de avatar a Firebase Storage
     * @param userId ID del usuario
     * @param base64Image Imagen en formato base64 o dataURL
     * @returns URL de descarga de la imagen subida
     */
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

    /**
     * Elimina una imagen de Firebase Storage basándose en su URL
     * @param imageUrl URL de la imagen a eliminar
     * @returns true si se eliminó correctamente, false en caso contrario
     */
    async deleteAvatarByUrl(imageUrl: string): Promise<boolean> {
        try {
            // Verificar si es una URL de Firebase Storage
            if (!imageUrl || !imageUrl.includes('firebasestorage.googleapis.com')) {
                console.log('No es una URL de Firebase Storage, no se eliminará');
                return false;
            }

            const storageInstance = getStorage();

            // Extraer la ruta del archivo desde la URL
            // URL típica: https://firebasestorage.googleapis.com/v0/b/bucket/o/avatars%2Ffilename.jpg?alt=media...
            const urlParts = imageUrl.split('/o/')[1]?.split('?')[0];
            if (!urlParts) {
                console.error('No se pudo extraer la ruta del archivo de la URL');
                return false;
            }

            // Decodificar el nombre del archivo
            const filePath = decodeURIComponent(urlParts);
            const fileRef = ref(storageInstance, filePath);

            await deleteObject(fileRef);
            console.log('Imagen eliminada correctamente de Firebase Storage');
            return true;
        } catch (error: any) {
            // Si el error es que el archivo no existe, lo consideramos como "éxito"
            if (error?.code === 'storage/object-not-found') {
                console.log('La imagen no existe en Firebase Storage');
                return true;
            }
            console.error('Error eliminando imagen de Storage:', error);
            return false;
        }
    }

    /**
     * Convierte una cadena DataURI en un Blob
     * @param dataURI DataURI de la imagen
     * @returns Blob de la imagen
     */
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
