import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../api.config';
import { Laboratorio } from '../models/modelos';

@Injectable({ providedIn: 'root' })
export class LaboratorioService {
  private http = inject(HttpClient);
  private url = `${API_URL}/laboratorios`;

  listar(sede?: string, q?: string): Observable<Laboratorio[]> {
    let params = new HttpParams();
    if (sede) params = params.set('sede', sede);
    if (q) params = params.set('q', q);
    return this.http.get<Laboratorio[]>(this.url, { params });
  }

  obtener(id: number): Observable<Laboratorio> {
    return this.http.get<Laboratorio>(`${this.url}/${id}`);
  }

  crear(lab: Laboratorio): Observable<Laboratorio> {
    return this.http.post<Laboratorio>(this.url, lab);
  }

  actualizar(id: number, lab: Laboratorio): Observable<Laboratorio> {
    return this.http.put<Laboratorio>(`${this.url}/${id}`, lab);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}