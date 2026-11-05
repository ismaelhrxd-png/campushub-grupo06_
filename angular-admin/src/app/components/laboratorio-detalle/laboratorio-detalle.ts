import { Component, effect, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LaboratorioService } from '../../services/laboratorio.service';
import { Laboratorio } from '../../models/modelos';

@Component({
  selector: 'app-laboratorio-detalle',
  imports: [RouterLink],
  templateUrl: './laboratorio-detalle.html',
})
export class LaboratorioDetalle {
  private service = inject(LaboratorioService);

  // :id de la ruta (withComponentInputBinding)
  id = input.required<string>();
  lab = signal<Laboratorio | null>(null);
  error = signal('');

  constructor() {
    effect(() => {
      this.error.set('');
      this.service.obtener(Number(this.id())).subscribe({
        next: (l) => this.lab.set(l),
        error: (e) => this.error.set(e.status === 404 ? 'El laboratorio no existe' : 'No se pudo cargar el laboratorio'),
      });
    });
  }
}
