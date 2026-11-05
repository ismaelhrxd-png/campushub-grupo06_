import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../api.config';
import { Reserva } from '../models/modelos';

@Injectable({ providedIn: 'root' })
export class ReservaService {
  private http = inject(HttpClient);
  private url = `${API_URL}/reservas`;

  listar(): Observable<Reserva[]> {
    return this.http.get<Reserva[]>(this.url);
  }

  listarPorUsuario(usuarioId: number): Observable<Reserva[]> {
    return this.http.get<Reserva[]>(this.url, { params: { usuarioId } });
  }

  crear(reserva: Reserva): Observable<Reserva> {
    return this.http.post<Reserva>(this.url, reserva);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}