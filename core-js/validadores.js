// core-js/validadores.js
// Validadores con expresiones regulares (Unidad 1, S3).
// Se reutilizan en Angular, React, Vue, Next y, desde el avance 5, en Express.

export const esCorreoUTP = (correo) =>
  /^[a-z0-9._%+-]+@utp\.edu\.pe$/i.test(correo);

// Código de alumno: la letra U seguida de 8 dígitos (ej. U20231234)
export const esCodigoAlumno = (codigo) => /^U\d{8}$/.test(codigo);

// Código de administrador: la letra A seguida de 8 dígitos (ej. A00000001)
export const esCodigoAdmin = (codigo) => /^A\d{8}$/.test(codigo);

// Nombre de laboratorio: "Lab" + letra de pabellón + guion + 3 dígitos (ej. Lab A-301)
export const esNombreLaboratorio = (nombre) => /^Lab [A-Z]-\d{3}$/.test(nombre);

// Hora HH:mm en formato de 24 horas
export const esHora = (hora) => /^([01]\d|2[0-3]):[0-5]\d$/.test(hora);

// Fecha AAAA-MM-DD (también comprueba que el día exista en el calendario)
export const esFecha = (fecha) => {
  if (!/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.test(fecha)) return false;
  const [anio, mes, dia] = fecha.split('-').map(Number);
  const d = new Date(Date.UTC(anio, mes - 1, dia));
  return d.getUTCFullYear() === anio && d.getUTCMonth() === mes - 1 && d.getUTCDate() === dia;
};

const aMinutos = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

// Cada validar* devuelve un arreglo de mensajes de error (vacío = válido).
// Los mensajes usan template literals.

export const validarUsuario = ({ nombre, correo, codigo, rol, password } = {}) => {
  const errores = [];
  if (!nombre || String(nombre).trim().length < 3) {
    errores.push(`El nombre es obligatorio (mínimo 3 caracteres), recibido: "${nombre ?? ''}"`);
  }
  if (!esCorreoUTP(correo)) {
    errores.push(`El correo "${correo ?? ''}" no es institucional (debe terminar en @utp.edu.pe)`);
  }
  if (rol !== 'estudiante' && rol !== 'admin') {
    errores.push(`El rol "${rol ?? ''}" no es válido (estudiante | admin)`);
  } else if (rol === 'estudiante' && !esCodigoAlumno(codigo)) {
    errores.push(`El código "${codigo ?? ''}" no es válido (U + 8 dígitos, ej. U20231234)`);
  } else if (rol === 'admin' && !esCodigoAdmin(codigo)) {
    errores.push(`El código "${codigo ?? ''}" no es válido para admin (A + 8 dígitos)`);
  }
  if (!password || String(password).length < 6) {
    errores.push('La contraseña debe tener al menos 6 caracteres');
  }
  return errores;
};

export const validarLaboratorio = ({ nombre, sede, capacidad, equipos, estado } = {}) => {
  const errores = [];
  if (!nombre || String(nombre).trim() === '') errores.push('El nombre del laboratorio es obligatorio');
  if (!sede || String(sede).trim() === '') errores.push('La sede es obligatoria');
  const cap = Number(capacidad);
  if (!Number.isInteger(cap) || cap < 1 || cap > 60) {
    errores.push(`La capacidad debe ser un entero entre 1 y 60, recibido: ${capacidad}`);
  }
  if (!Array.isArray(equipos) || !equipos.every((e) => typeof e === 'string')) {
    errores.push('Los equipos deben ser un arreglo de cadenas');
  }
  if (estado !== 'disponible' && estado !== 'mantenimiento') {
    errores.push(`El estado "${estado ?? ''}" no es válido (disponible | mantenimiento)`);
  }
  return errores;
};

export const validarReserva = ({ laboratorioId, usuarioId, fecha, horaInicio, horaFin, motivo } = {}) => {
  const errores = [];
  if (laboratorioId == null) errores.push('El laboratorio es obligatorio');
  if (usuarioId == null) errores.push('El usuario es obligatorio');
  if (!esFecha(fecha)) errores.push(`La fecha "${fecha ?? ''}" no es válida (formato AAAA-MM-DD)`);
  const horaInicioOk = esHora(horaInicio);
  const horaFinOk = esHora(horaFin);
  if (!horaInicioOk) errores.push(`La hora de inicio "${horaInicio ?? ''}" no es válida (formato HH:mm)`);
  if (!horaFinOk) errores.push(`La hora de fin "${horaFin ?? ''}" no es válida (formato HH:mm)`);
  if (horaInicioOk && horaFinOk && aMinutos(horaFin) <= aMinutos(horaInicio)) {
    errores.push(`La hora de fin (${horaFin}) debe ser mayor que la de inicio (${horaInicio})`);
  }
  if (!motivo || String(motivo).trim().length < 3) {
    errores.push('El motivo es obligatorio (mínimo 3 caracteres)');
  }
  return errores;
};
