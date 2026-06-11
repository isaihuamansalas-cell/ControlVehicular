// ===============================
// UNICONNECT - INCIDENCIAS
// ===============================

document.addEventListener("DOMContentLoaded", function() {
  const usuarioActivo = JSON.parse(sessionStorage.getItem("usuarioActivo"));

  if (!usuarioActivo) {
    window.location.href = "index.html";
    return;
  }

  if (usuarioActivo.rol !== "Administrador" && usuarioActivo.rol !== "Seguridad") {
    alert("No tienes permiso para ingresar a este módulo.");
    window.location.href = "dashboard.html";
    return;
  }

  const backBtn = document.getElementById("backBtn");
  const incidentForm = document.getElementById("incidentForm");
  const searchIncident = document.getElementById("searchIncident");
  const filterIncidentStatus = document.getElementById("filterIncidentStatus");
  const filterIncidentPriority = document.getElementById("filterIncidentPriority");
  const placaIncidencia = document.getElementById("placaIncidencia");
  const dniIncidencia = document.getElementById("dniIncidencia");

  if (backBtn) {
    backBtn.addEventListener("click", function() {
      window.location.href = "dashboard.html";
    });
  }

  configurarFechaIncidencia();

  if (incidentForm) {
    incidentForm.addEventListener("submit", function(event) {
      event.preventDefault();
      registrarIncidencia();
    });
  }

  if (searchIncident) {
    searchIncident.addEventListener("input", aplicarFiltrosIncidencias);
  }

  if (filterIncidentStatus) {
    filterIncidentStatus.addEventListener("change", aplicarFiltrosIncidencias);
  }

  if (filterIncidentPriority) {
    filterIncidentPriority.addEventListener("change", aplicarFiltrosIncidencias);
  }

  if (placaIncidencia) {
    placaIncidencia.addEventListener("blur", function() {
      autocompletarPorPlaca();
    });
  }

  if (dniIncidencia) {
    dniIncidencia.addEventListener("blur", function() {
      autocompletarPorDni();
    });
  }

  cargarIncidencias();
});

function configurarFechaIncidencia() {
  const fechaIncidencia = document.getElementById("fechaIncidencia");

  if (!fechaIncidencia) {
    return;
  }

  const hoy = new Date();
  fechaIncidencia.value = hoy.toISOString().split("T")[0];
}

function autocompletarPorPlaca() {
  const placa = document.getElementById("placaIncidencia").value.trim().toUpperCase();

  if (placa === "") {
    return;
  }

  const vehiculos = JSON.parse(localStorage.getItem("vehiculos")) || [];

  const vehiculo = vehiculos.find(function(item) {
    return String(item.placa || "").toUpperCase() === placa;
  });

  if (vehiculo) {
    document.getElementById("dniIncidencia").value = vehiculo.dniPropietario || "";
    document.getElementById("personaIncidencia").value = vehiculo.nombrePropietario || "";
  }
}

function autocompletarPorDni() {
  const dni = document.getElementById("dniIncidencia").value.trim();

  if (dni.length !== 8) {
    return;
  }

  const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];

  const usuario = usuarios.find(function(item) {
    return String(item.dni || "") === dni;
  });

  if (usuario) {
    document.getElementById("personaIncidencia").value = usuario.nombre || "";
  }
}

function registrarIncidencia() {
  const usuarioActivo = JSON.parse(sessionStorage.getItem("usuarioActivo"));

  const fecha = document.getElementById("fechaIncidencia").value;
  const tipo = document.getElementById("tipoIncidencia").value;
  const placa = document.getElementById("placaIncidencia").value.trim().toUpperCase();
  const dni = document.getElementById("dniIncidencia").value.trim();
  const persona = document.getElementById("personaIncidencia").value.trim();
  const ubicacion = document.getElementById("ubicacionIncidencia").value.trim();
  const prioridad = document.getElementById("prioridadIncidencia").value;
  const estado = document.getElementById("estadoIncidencia").value;
  const descripcion = document.getElementById("descripcionIncidencia").value.trim();

  if (tipo === "" || ubicacion === "" || descripcion === "") {
    mostrarMensajeIncidencia("Completa los campos obligatorios.", "error");
    return;
  }

  if (dni !== "" && dni.length !== 8) {
    mostrarMensajeIncidencia("El DNI debe tener 8 dígitos si lo vas a registrar.", "error");
    return;
  }

  let incidencias = JSON.parse(localStorage.getItem("incidenciasSeguridad")) || [];

  const nuevaIncidencia = {
    id: Date.now(),
    fecha: fecha,
    tipo: tipo,
    placa: placa,
    dni: dni,
    persona: persona,
    ubicacion: ubicacion,
    prioridad: prioridad,
    estado: estado,
    descripcion: descripcion,
    registradoPorId: usuarioActivo.id,
    registradoPorNombre: usuarioActivo.nombre,
    registradoPorRol: usuarioActivo.rol,
    fechaRegistro: new Date().toLocaleString(),
    fechaActualizacion: ""
  };

  incidencias.unshift(nuevaIncidencia);

  localStorage.setItem("incidenciasSeguridad", JSON.stringify(incidencias));

  document.getElementById("incidentForm").reset();

  configurarFechaIncidencia();

  mostrarMensajeIncidencia("Incidencia registrada correctamente.", "success");

  cargarIncidencias();
}

function aplicarFiltrosIncidencias() {
  const busqueda = document.getElementById("searchIncident").value;
  const estado = document.getElementById("filterIncidentStatus").value;
  const prioridad = document.getElementById("filterIncidentPriority").value;

  cargarIncidencias(busqueda, estado, prioridad);
}

function cargarIncidencias(busqueda = "", estadoFiltro = "", prioridadFiltro = "") {
  const incidentsTableBody = document.getElementById("incidentsTableBody");

  if (!incidentsTableBody) {
    return;
  }

  const usuarioActivo = JSON.parse(sessionStorage.getItem("usuarioActivo"));
  const incidencias = JSON.parse(localStorage.getItem("incidenciasSeguridad")) || [];
  const textoBusqueda = busqueda.toLowerCase();

  const incidenciasFiltradas = incidencias.filter(function(incidencia) {
    const coincideBusqueda =
      String(incidencia.fecha || "").toLowerCase().includes(textoBusqueda) ||
      String(incidencia.tipo || "").toLowerCase().includes(textoBusqueda) ||
      String(incidencia.placa || "").toLowerCase().includes(textoBusqueda) ||
      String(incidencia.dni || "").toLowerCase().includes(textoBusqueda) ||
      String(incidencia.persona || "").toLowerCase().includes(textoBusqueda) ||
      String(incidencia.ubicacion || "").toLowerCase().includes(textoBusqueda) ||
      String(incidencia.descripcion || "").toLowerCase().includes(textoBusqueda) ||
      String(incidencia.registradoPorNombre || "").toLowerCase().includes(textoBusqueda);

    const coincideEstado =
      estadoFiltro === "" || incidencia.estado === estadoFiltro;

    const coincidePrioridad =
      prioridadFiltro === "" || incidencia.prioridad === prioridadFiltro;

    return coincideBusqueda && coincideEstado && coincidePrioridad;
  });

  actualizarResumenIncidencias(incidencias);

  incidentsTableBody.innerHTML = "";

  if (incidenciasFiltradas.length === 0) {
    incidentsTableBody.innerHTML = `
      <tr>
        <td colspan="11">No se encontraron incidencias registradas.</td>
      </tr>
    `;
    return;
  }

  incidenciasFiltradas.forEach(function(incidencia) {
    const fila = document.createElement("tr");

    const claseEstado = obtenerClaseEstadoIncidencia(incidencia.estado);
    const clasePrioridad = obtenerClasePrioridadIncidencia(incidencia.prioridad);

    let accionHTML = `
      <button class="secondary-btn small-btn" onclick="cambiarEstadoIncidencia(${incidencia.id})">
        Cambiar estado
      </button>
    `;

    if (usuarioActivo.rol === "Administrador") {
      accionHTML += `
        <button class="delete-btn small-btn" onclick="eliminarIncidencia(${incidencia.id})">
          Eliminar
        </button>
      `;
    }

    fila.innerHTML = `
      <td>${incidencia.fecha || "-"}</td>
      <td>${incidencia.tipo || "-"}</td>
      <td><strong>${incidencia.placa || "No aplica"}</strong></td>
      <td>${incidencia.dni || "No aplica"}</td>
      <td>${incidencia.persona || "No aplica"}</td>
      <td>${incidencia.ubicacion || "-"}</td>
      <td>
        <span class="priority-badge ${clasePrioridad}">
          ${incidencia.prioridad}
        </span>
      </td>
      <td>
        <span class="incident-status ${claseEstado}">
          ${incidencia.estado}
        </span>
      </td>
      <td>${incidencia.registradoPorNombre || "-"}</td>
      <td class="description-cell">${incidencia.descripcion || "-"}</td>
      <td>${accionHTML}</td>
    `;

    incidentsTableBody.appendChild(fila);
  });
}

function actualizarResumenIncidencias(incidencias) {
  const totalIncidencias = document.getElementById("totalIncidencias");
  const totalAbiertas = document.getElementById("totalAbiertas");
  const totalRevision = document.getElementById("totalRevision");
  const totalCerradas = document.getElementById("totalCerradas");

  if (!totalIncidencias || !totalAbiertas || !totalRevision || !totalCerradas) {
    return;
  }

  totalIncidencias.textContent = incidencias.length;

  totalAbiertas.textContent = incidencias.filter(function(item) {
    return item.estado === "Abierta";
  }).length;

  totalRevision.textContent = incidencias.filter(function(item) {
    return item.estado === "En revisión";
  }).length;

  totalCerradas.textContent = incidencias.filter(function(item) {
    return item.estado === "Cerrada";
  }).length;
}

function cambiarEstadoIncidencia(id) {
  let incidencias = JSON.parse(localStorage.getItem("incidenciasSeguridad")) || [];

  incidencias = incidencias.map(function(incidencia) {
    if (incidencia.id === id) {
      if (incidencia.estado === "Abierta") {
        incidencia.estado = "En revisión";
      } else if (incidencia.estado === "En revisión") {
        incidencia.estado = "Cerrada";
      } else {
        incidencia.estado = "Abierta";
      }

      incidencia.fechaActualizacion = new Date().toLocaleString();
    }

    return incidencia;
  });

  localStorage.setItem("incidenciasSeguridad", JSON.stringify(incidencias));

  cargarIncidencias();

  mostrarMensajeIncidencia("Estado de incidencia actualizado.", "success");
}

function eliminarIncidencia(id) {
  const confirmar = confirm("¿Seguro que deseas eliminar esta incidencia?");

  if (!confirmar) {
    return;
  }

  let incidencias = JSON.parse(localStorage.getItem("incidenciasSeguridad")) || [];

  incidencias = incidencias.filter(function(incidencia) {
    return incidencia.id !== id;
  });

  localStorage.setItem("incidenciasSeguridad", JSON.stringify(incidencias));

  cargarIncidencias();

  mostrarMensajeIncidencia("Incidencia eliminada correctamente.", "success");
}

function obtenerClaseEstadoIncidencia(estado) {
  if (estado === "Abierta") {
    return "incident-open";
  }

  if (estado === "En revisión") {
    return "incident-review";
  }

  if (estado === "Cerrada") {
    return "incident-closed";
  }

  return "";
}

function obtenerClasePrioridadIncidencia(prioridad) {
  if (prioridad === "Normal") {
    return "priority-normal";
  }

  if (prioridad === "Importante") {
    return "priority-important";
  }

  if (prioridad === "Urgente") {
    return "priority-urgent";
  }

  return "";
}

function mostrarMensajeIncidencia(texto, tipo) {
  const incidentMessage = document.getElementById("incidentMessage");

  if (!incidentMessage) {
    alert(texto);
    return;
  }

  incidentMessage.textContent = texto;
  incidentMessage.className = "message " + tipo;

  setTimeout(function() {
    incidentMessage.textContent = "";
    incidentMessage.className = "message";
  }, 3000);
}