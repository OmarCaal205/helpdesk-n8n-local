const estadoConexion = document.getElementById("estadoConexion");
const btnActualizar = document.getElementById("btnActualizar");

const totalTickets = document.getElementById("totalTickets");
const ticketsNuevos = document.getElementById("ticketsNuevos");
const ticketsAltos = document.getElementById("ticketsAltos");
const ticketsCriticos = document.getElementById("ticketsCriticos");

const tablaTickets = document.getElementById("tablaTickets");
const tablaAudit = document.getElementById("tablaAudit");
const tablaErrores = document.getElementById("tablaErrores");

function formatearFecha(fecha) {
  if (!fecha) return "Sin fecha";
  return new Date(fecha).toLocaleString("es-GT", {
    timeZone: "America/Guatemala"
  });
}

function limpiarTexto(texto) {
  return texto || "No especificado";
}

function badgePrioridad(prioridad) {
  const p = String(prioridad || "").toLowerCase();

  let clase = "media";

  if (p.includes("crítica") || p.includes("critica")) clase = "critica";
  else if (p.includes("alta")) clase = "alta";
  else if (p.includes("baja")) clase = "baja";

  return `<span class="badge ${clase}">${prioridad || "Media"}</span>`;
}

async function cargarResumen() {
  const res = await fetch("/api/resumen");
  const data = await res.json();

  totalTickets.textContent = data.total_tickets ?? 0;
  ticketsNuevos.textContent = data.tickets_nuevos ?? 0;
  ticketsAltos.textContent = data.tickets_altos ?? 0;
  ticketsCriticos.textContent = data.tickets_criticos ?? 0;
}

async function cargarTickets() {
  const res = await fetch("/api/tickets");
  const tickets = await res.json();

  if (!tickets.length) {
    tablaTickets.innerHTML = `
      <tr>
        <td colspan="8" class="empty">No hay tickets registrados.</td>
      </tr>
    `;
    return;
  }

  tablaTickets.innerHTML = tickets.map(ticket => `
    <tr>
      <td>${limpiarTexto(ticket.codigo_ticket)}</td>
      <td>${limpiarTexto(ticket.nombre)}</td>
      <td>${limpiarTexto(ticket.departamento)}</td>
      <td>${limpiarTexto(ticket.categoria)}</td>
      <td>${badgePrioridad(ticket.prioridad)}</td>
      <td>${limpiarTexto(ticket.estado)}</td>
      <td>${limpiarTexto(ticket.tecnico_asignado)}</td>
      <td>${formatearFecha(ticket.fecha_creacion)}</td>
    </tr>
  `).join("");
}

async function cargarAudit() {
  const res = await fetch("/api/audit");
  const audit = await res.json();

  if (!audit.length) {
    tablaAudit.innerHTML = `
      <tr>
        <td colspan="4" class="empty">No hay registros de auditoría.</td>
      </tr>
    `;
    return;
  }

  tablaAudit.innerHTML = audit.map(item => `
    <tr>
      <td>${limpiarTexto(item.accion)}</td>
      <td>${limpiarTexto(item.workflow)}</td>
      <td>${limpiarTexto(item.detalle)}</td>
      <td>${formatearFecha(item.fecha)}</td>
    </tr>
  `).join("");
}

async function cargarErrores() {
  const res = await fetch("/api/errores");
  const errores = await res.json();

  if (!errores.length) {
    tablaErrores.innerHTML = `
      <tr>
        <td colspan="4" class="empty">No hay errores registrados.</td>
      </tr>
    `;
    return;
  }

  tablaErrores.innerHTML = errores.map(error => `
    <tr>
      <td>${limpiarTexto(error.workflow)}</td>
      <td>${limpiarTexto(error.nodo)}</td>
      <td>${limpiarTexto(error.mensaje_error)}</td>
      <td>${formatearFecha(error.fecha)}</td>
    </tr>
  `).join("");
}

async function verificarConexion() {
  try {
    const res = await fetch("/api/health");
    const data = await res.json();

    if (data.ok) {
      estadoConexion.classList.remove("error");
      estadoConexion.textContent = "Conectado correctamente a PostgreSQL";
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    estadoConexion.classList.add("error");
    estadoConexion.textContent = "Error de conexión con PostgreSQL";
  }
}

async function cargarDashboard() {
  try {
    await verificarConexion();
    await cargarResumen();
    await cargarTickets();
    await cargarAudit();
    await cargarErrores();
  } catch (error) {
    estadoConexion.classList.add("error");
    estadoConexion.textContent = `Error cargando dashboard: ${error.message}`;
  }
}

btnActualizar.addEventListener("click", cargarDashboard);

cargarDashboard();