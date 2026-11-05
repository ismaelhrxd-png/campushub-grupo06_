import { Pipe, PipeTransform } from '@angular/core';
import { EstadoReserva } from '../models/modelos';

// Pipe personalizado: convierte el estado en un texto con icono.
// Uso: {{ reserva.estado | estadoReserva }}  ->  "⏳ Pendiente"
@Pipe({ name: 'estadoReserva' })
export class EstadoReservaPipe implements PipeTransform {
  private textos: Record<EstadoReserva, string> = {
    pendiente: '⏳ Pendiente',
    aprobada: '✅ Aprobada',
    rechazada: '❌ Rechazada',
  };

  transform(estado: EstadoReserva): string {
    return this.textos[estado] ?? estado;
  }
}
