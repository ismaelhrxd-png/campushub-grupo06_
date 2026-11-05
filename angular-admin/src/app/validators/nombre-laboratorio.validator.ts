import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { esNombreLaboratorio } from '../../core/validadores.js';

// Validador propio basado en una expresión regular de core-js: "Lab A-301".
export const nombreLaboratorioValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const valor = String(control.value ?? '').trim();
  if (valor === '') return null; // de lo vacío se encarga Validators.required
  return esNombreLaboratorio(valor) ? null : { nombreLaboratorio: { recibido: valor } };
};
