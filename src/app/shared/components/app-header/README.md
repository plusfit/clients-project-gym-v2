# App Header Component

Este componente proporciona un header consistente para todas las páginas de la aplicación.

## Características

- Estilo consistente con fondo negro
- Botón de retroceso opcional
- Título personalizable
- Estilos optimizados para diferentes tamaños de pantalla
- Compatible con el modo oscuro y de alto contraste

## Uso

### 1. Importar el componente

En tu archivo de componente (`.ts`), importa el `AppHeaderComponent`:

```typescript
import { AppHeaderComponent } from "@shared/components/app-header/app-header.component";

@Component({
  // ...
  imports: [
    // ... otros imports
    AppHeaderComponent,
  ],
})
export class TuComponente {
  // ...
}
```

### 2. Usar el componente en la plantilla

En tu archivo HTML, añade el componente al principio:

```html
<app-header title="Título de la Página" defaultHref="/ruta-de-regreso" [showBackButton]="true"> </app-header>

<ion-content>
  <!-- Contenido de tu página -->
</ion-content>
```

## Propiedades

| Propiedad        | Tipo    | Valor por defecto | Descripción                                                |
| ---------------- | ------- | ----------------- | ---------------------------------------------------------- |
| `title`          | string  | `''`              | Título a mostrar en el header                              |
| `defaultHref`    | string  | `/tabs/home`      | Ruta a la que navegar al hacer clic en el botón de regreso |
| `showBackButton` | boolean | `true`            | Indica si se debe mostrar el botón de regreso              |
| `color`          | string  | `'dark'`          | Color del toolbar (utiliza los colores de Ionic)           |

## Ejemplos

### Página con botón de regreso

```html
<app-header title="Detalles del Ejercicio" defaultHref="/cliente/rutinas"> </app-header>
```

### Página principal sin botón de regreso

```html
<app-header title="Inicio" [showBackButton]="false"> </app-header>
```

### Página con color personalizado

```html
<app-header title="Mi Perfil" color="primary"> </app-header>
```
