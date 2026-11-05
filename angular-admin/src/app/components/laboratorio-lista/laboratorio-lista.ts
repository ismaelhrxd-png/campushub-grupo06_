import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LaboratorioService } from '../../services/laboratorio.service';
import { Laboratorio } from '../../models/modelos';
import { ResaltarDirective } from '../../directives/resaltar.directive';
import { sedesUnicas } from '../../../core/estadisticas.js';

@Component({
  selector: 'app-laboratorio-lista',
  imports: [RouterLink, ResaltarDirective],
  templateUrl: './laboratorio-lista.html',
})
export class LaboratorioLista implements OnInit {
  private service = inject(LaboratorioService);

  laboratorios = signal<Laboratorio[]>([]);
  cargando = signal(true);
  error = signal('');
  sede = signal('');
  texto = signal('');
  // Las sedes salen de core-js (Set): se calculan sobre la lista completa
  private todos = signal<Laboratorio[]>([]);
  sedes = computed<string[]>(() => sedesUnicas(this.todos()));

  ngOnInit() {
    this.cargar();
  }

  cargar() {
    this.cargando.set(true);
    this.error.set('');
    this.service.listar(this.sede(), this.texto()).subscribe({
      next: (datos) => {
        this.laboratorios.set(datos);
        if (!this.sede() && !this.texto()) this.todos.set(datos);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudo conectar con el API (¿está corriendo npm run api en el puerto 3000?)');
        this.cargando.set(false);
      },
    });
  }

  cambiarSede(valor: string) {
    this.sede.set(valor);
    this.cargar();
  }

  buscar(valor: string) {
    this.texto.set(valor.trim());
    this.cargar();
  }

  eliminar(lab: Laboratorio) {
    if (!confirm(`¿Eliminar "${lab.nombre}"?`)) return;
    this.service.eliminar(lab.id!).subscribe({
      next: () => {
        // Se refresca sin recargar la página
        this.todos.update((l) => l.filter((x) => x.id !== lab.id));
        this.laboratorios.update((l) => l.filter((x) => x.id !== lab.id));
      },
      error: () => this.error.set(`No se pudo eliminar "${lab.nombre}"`),
    });
  }
}
