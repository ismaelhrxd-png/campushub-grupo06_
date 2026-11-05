import { Routes } from '@angular/router';
import { LaboratorioLista } from './components/laboratorio-lista/laboratorio-lista';
import { LaboratorioForm } from './components/laboratorio-form/laboratorio-form';
import { LaboratorioDetalle } from './components/laboratorio-detalle/laboratorio-detalle';
import { ReservaLista } from './components/reserva-lista/reserva-lista';

export const routes: Routes = [
  { path: '', redirectTo: 'laboratorios', pathMatch: 'full' },
  { path: 'laboratorios', component: LaboratorioLista },
  // 'nuevo' va antes que ':id' para que no se confunda con un id
  { path: 'laboratorios/nuevo', component: LaboratorioForm },
  { path: 'laboratorios/:id/editar', component: LaboratorioForm },
  { path: 'laboratorios/:id', component: LaboratorioDetalle },
  { path: 'reservas', component: ReservaLista },
  { path: '**', redirectTo: 'laboratorios' },
];
