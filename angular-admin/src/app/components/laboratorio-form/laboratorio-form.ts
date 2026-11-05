import { Component, effect, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LaboratorioService } from '../../services/laboratorio.service';
import { Laboratorio } from '../../models/modelos';
import { nombreLaboratorioValidator } from '../../validators/nombre-laboratorio.validator';

@Component({
  selector: 'app-laboratorio-form',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './laboratorio-form.html',
})
export class LaboratorioForm {
  private fb = inject(FormBuilder);
  private service = inject(LaboratorioService);
  private router = inject(Router);

  // Si la ruta trae :id estamos editando; si no, creando
  id = input<string>();
  guardando = signal(false);
  error = signal('');

  form = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, nombreLaboratorioValidator]],
    sede: ['', [Validators.required, Validators.minLength(3)]],
    capacidad: [30, [Validators.required, Validators.min(1), Validators.max(60)]],
    equipos: [''], // texto separado por comas
    estado: ['disponible' as Laboratorio['estado'], Validators.required],
  });

  constructor() {
    effect(() => {
      const id = this.id();
      if (!id) return;
      this.service.obtener(Number(id)).subscribe({
        next: (l) => this.form.patchValue({ ...l, equipos: l.equipos.join(', ') }),
        error: () => this.error.set('No se pudo cargar el laboratorio a editar'),
      });
    });
  }

  get editando() {
    return !!this.id();
  }

  invalido(campo: 'nombre' | 'sede' | 'capacidad' | 'equipos' | 'estado') {
    const c = this.form.controls[campo];
    return c.invalid && (c.dirty || c.touched);
  }

  guardar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const lab: Laboratorio = {
      nombre: v.nombre.trim(),
      sede: v.sede.trim(),
      capacidad: Number(v.capacidad),
      equipos: v.equipos.split(',').map((e) => e.trim()).filter(Boolean),
      estado: v.estado,
    };
    this.guardando.set(true);
    const peticion = this.editando
      ? this.service.actualizar(Number(this.id()), lab)
      : this.service.crear(lab);
    peticion.subscribe({
      next: () => this.router.navigate(['/laboratorios']),
      error: () => {
        this.error.set('No se pudo guardar el laboratorio');
        this.guardando.set(false);
      },
    });
  }
}
