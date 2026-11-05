// core-js/core.test.js  →  node --test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  esCorreoUTP,
  esCodigoAlumno,
  esHora,
  esFecha,
  esNombreLaboratorio,
  validarReserva,
  validarLaboratorio,
} from './validadores.js';
import { Reserva, buscarCruce } from './modelos.js';
import {
  reservasPorEstado,
  ocupacionPorLaboratorio,
  sedesUnicas,
  rankingLaboratorios,
  generadorCodigos,
} from './estadisticas.js';

const reserva = (extra = {}) =>
  new Reserva({ id: 1, laboratorioId: 1, fecha: '2026-11-20', horaInicio: '08:00', horaFin: '10:00', ...extra });

test('correo institucional: acepta @utp.edu.pe y rechaza otros dominios', () => {
  assert.equal(esCorreoUTP('u20231234@utp.edu.pe'), true);
  assert.equal(esCorreoUTP('ana@gmail.com'), false);
});

test('código de alumno: U + 8 dígitos', () => {
  assert.equal(esCodigoAlumno('U20231234'), true);
  assert.equal(esCodigoAlumno('U2023123'), false);
  assert.equal(esCodigoAlumno('20231234'), false);
});

test('hora HH:mm y fecha AAAA-MM-DD', () => {
  assert.equal(esHora('08:30'), true);
  assert.equal(esHora('24:00'), false);
  assert.equal(esFecha('2026-11-20'), true);
  assert.equal(esFecha('2026-02-30'), false);
});

test('validarReserva: horaFin debe ser mayor que horaInicio, con mensaje', () => {
  const errores = validarReserva({
    laboratorioId: 1, usuarioId: 3, fecha: '2026-11-20',
    horaInicio: '10:00', horaFin: '09:00', motivo: 'Práctica',
  });
  assert.equal(errores.length, 1);
  assert.match(errores[0], /09:00/);
});

test('validarLaboratorio: capacidad entre 1 y 60', () => {
  const base = { nombre: 'Lab A', sede: 'Lima Centro', equipos: [], estado: 'disponible' };
  assert.equal(validarLaboratorio({ ...base, capacidad: 30 }).length, 0);
  assert.equal(validarLaboratorio({ ...base, capacidad: 0 }).length, 1);
  assert.equal(validarLaboratorio({ ...base, capacidad: 61 }).length, 1);
});

test('Reserva.duracionHoras calcula la duración', () => {
  assert.equal(reserva({ horaInicio: '08:00', horaFin: '10:30' }).duracionHoras(), 2.5);
});

test('reservas contiguas no se cruzan', () => {
  const a = reserva({ horaInicio: '08:00', horaFin: '10:00' });
  const b = reserva({ id: 2, horaInicio: '10:00', horaFin: '11:00' });
  assert.equal(a.seCruzaCon(b), false);
});

test('reservas solapadas del mismo laboratorio se cruzan; en otro laboratorio no', () => {
  const a = reserva({ horaInicio: '08:00', horaFin: '10:00' });
  assert.equal(a.seCruzaCon(reserva({ id: 2, horaInicio: '09:00', horaFin: '11:00' })), true);
  assert.equal(a.seCruzaCon(reserva({ id: 3, laboratorioId: 2, horaInicio: '09:00', horaFin: '11:00' })), false);
});

test('buscarCruce ignora reservas rechazadas', () => {
  const nueva = reserva({ id: 9, horaInicio: '09:00', horaFin: '11:00' });
  const rechazada = { ...reserva({ id: 2 }), estado: 'rechazada' };
  const aprobada = { ...reserva({ id: 3 }), estado: 'aprobada' };
  assert.equal(buscarCruce(nueva, [rechazada]), undefined);
  assert.equal(buscarCruce(nueva, [rechazada, aprobada]).id, 3);
});

test('reservasPorEstado con reduce devuelve los tres estados', () => {
  const lista = [{ estado: 'pendiente' }, { estado: 'aprobada' }, { estado: 'aprobada' }];
  assert.deepEqual(reservasPorEstado(lista), { pendiente: 1, aprobada: 2, rechazada: 0 });
});

test('ocupación (Map), sedes únicas (Set) y ranking (sort + spread)', () => {
  const rs = [
    reserva({ id: 1, laboratorioId: 1, estado: 'aprobada' }),
    reserva({ id: 2, laboratorioId: 1, estado: 'aprobada', horaInicio: '10:00', horaFin: '11:00' }),
    reserva({ id: 3, laboratorioId: 2, estado: 'pendiente' }),
  ];
  const ocupacion = ocupacionPorLaboratorio(rs, (r) => r.duracionHoras());
  assert.equal(ocupacion.get(1), 3);
  assert.equal(ocupacion.has(2), false);
  assert.deepEqual(sedesUnicas([{ sede: 'Lima Sur' }, { sede: 'Lima Sur' }, { sede: 'Lima Centro' }]), ['Lima Sur', 'Lima Centro']);
  assert.deepEqual(rankingLaboratorios(rs)[0], { laboratorioId: 1, total: 2 });
});

test('generadorCodigos usa closure y padStart', () => {
  const siguiente = generadorCodigos();
  assert.equal(siguiente(), 'RES-0001');
  assert.equal(siguiente(), 'RES-0002');
  assert.equal(generadorCodigos()(), 'RES-0001'); // cada generador tiene su propio contador
});

test('nombre de laboratorio: formato "Lab A-301"', () => {
  assert.equal(esNombreLaboratorio('Lab A-301'), true);
  assert.equal(esNombreLaboratorio('Lab a-301'), false);
  assert.equal(esNombreLaboratorio('Laboratorio 301'), false);
});
