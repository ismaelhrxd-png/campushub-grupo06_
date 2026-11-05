import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { forkJoin } from 'rxjs';
import { ReservaService } from '../../services/reserva.service';
import { LaboratorioService } from '../../services/laboratorio.service';
import { EstadoReserva, Laboratorio, Reserva } from '../../models/modelos';
import { EstadoReservaPipe } from '../../pipes/estado-reserva.pipe';
import { reservasPorEstado } from '../../../core/estadisticas.js';

@Component({
  selector: 'app-reserva-lista',
  imports: [NgClass, EstadoReservaPipe],
  templateUrl: './reserva-lista.html',
})
export class ReservaLista implements OnInit {
  private reservaService = inject(ReservaService);
  private labService = inject(LaboratorioService);

  reservas = signal<Reserva[]>([]);
  laboratorios = signal<Laboratorio[]>([]);
  filtro = signal<EstadoReserva | ''>('');
  cargando = signal(true);
  error = signal('');

  // Totales por estado calculados con reduce (core-js)
  totales = computed(() => reservasPorEstado(this.reservas()));
  visibles = computed(() =>
    this.reservas().filter((r) => !this.filtro() || r.estado === this.filtro())
  );

  ngOnInit() {
    forkJoin({ reservas: this.reservaService.listar(), labs: this.labService.listar() }).subscribe({
      next: ({ reservas, labs }) => {
        this.reservas.set(reservas);
        this.laboratorios.set(labs);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar las reservas (¿está corriendo el API?)');
        this.cargando.set(false);
      },
    });
  }

  nombreLab(id: number) {
    return this.laboratorios().find((l) => l.id === id)?.nombre ?? `Lab #${id} (eliminado)`;
  }

  claseEstado(estado: EstadoReserva) {
    return {
      'text-bg-warning': estado === 'pendiente',
      'text-bg-success': estado === 'aprobada',
      'text-bg-danger': estado === 'rechazada',
    };
  }
}
