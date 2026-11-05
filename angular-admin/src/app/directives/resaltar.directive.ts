import { Directive, input } from '@angular/core';

// Directiva de atributo personalizada: resalta el elemento cuando la condición es true.
// Uso: <tr [appResaltar]="lab.estado === 'mantenimiento'">
@Directive({
  selector: '[appResaltar]',
  host: {
    '[style.background-color]': 'appResaltar() ? color() : null',
    '[style.font-style]': 'appResaltar() ? "italic" : null',
  },
})
export class ResaltarDirective {
  appResaltar = input<boolean>(false);
  color = input<string>('#fff3cd');
}
