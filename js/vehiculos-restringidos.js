// ===============================
// UNICONNECT - VEHÍCULOS RESTRINGIDOS
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
  const searchRestrictedVehicle = document.getElementById("searchRestrictedVehicle");
  const filterVehicleStatus = document.getElementById("filterVehicleStatus");
  const filterVehicleType = document.getElementById("filterVehicleType");

  if (backBtn) {
    backBtn.addEventListener("click", function() {
      window.location.href = "dashboard.html";
    });
  }

  if (searchRestrictedVehicle) {
    searchRestrictedVehicle.addEventListener("input", aplicarFiltrosVehiculosRestringidos);
  }

  if (filterVehicleStatus) {
    filterVehicleStatus.addEventListener("change", aplicarFiltrosVehiculosRestringidos);
  }

  if (filterVehicleType) {
    filterVehicleType.addEventListener("change", aplicarFiltrosVehiculosRestringidos);
  }

  cargarVehiculosRestringidos();
  cargarIncidenciasPorPlaca();
});

function aplicarFiltrosVehiculosRestringidos() {
  const busqueda = document.getElementById("searchRestrictedVehicle").value;
  const estado = document.getElementById("filterVehicleStatus").value;
  const tipo = document.getElementById("filterVehicleType").value;

  cargarVehiculosRestringidos(busqueda, estado, tipo);
  cargarIncidenciasPorPlaca(busqueda);
}

function cargarVehiculosRestringidos(busqueda = "", estadoFiltro = "", tipoFiltro = "") {
  const restrictedVehiclesTableBody = document.getElementById("restrictedVehiclesTableBody");

  if (!restrictedVehiclesTableBody) {
    return;
  }

  const usuarioActivo = JSON.parse(sessionStorage.getItem("usuarioActivo"));
  const vehiculos = JSON.parse(localStorage.getItem("vehiculos")) || [];
  const incidencias = JSON.parse(localStorage.getItem("incidenciasSeguridad")) || [];

  const textoBusqueda = busqueda.toLowerCase();

  const vehiculosFiltrados = vehiculos.filter(function(vehiculo) {
    const coincideBusqueda =
      String(vehiculo.placa || "").toLowerCase().includes(textoBusqueda) ||
      String(vehiculo.nombrePropietario || "").toLowerCase().includes(textoBusqueda) ||
      String(vehiculo.dniPropietario || "").toLowerCase().includes(textoBusqueda) ||
      String(vehiculo.areaPropietario || "").toLowerCase().includes(textoBusqueda) ||
      String(vehiculo.marca || "").toLowerCase().includes(textoBusqueda) ||
      String(vehiculo.modelo || "").toLowerCase().includes(textoBusqueda) ||
      String(vehiculo.color || "").toLowerCase().includes(textoBusqueda);

    const coincideEstado =
      estadoFiltro === "" || vehiculo.estadoVehiculo === estadoFiltro;

    const coincideTipo =
      tipoFiltro === "" || vehiculo.tipoVehiculo === tipoFiltro;

    return coincideBusqueda && coincideEstado && coincideTipo;
  });

  actualizarResumenVehiculos(vehiculos, incidencias);

  restrictedVehiclesTableBody.innerHTML = "";

  if (vehiculosFiltrados.length === 0) {
    restrictedVehiclesTableBody.innerHTML = `
      <tr>
        <td colspan="13">No se encontraron vehículos con esos filtros.</td>
      </tr>
    `;
    return;
  }

  vehiculosFiltrados.forEach(function(vehiculo) {
    const fila = document.createElement("tr");

    const fotoVehiculo = vehiculo.fotoVehiculo || generarImagenVehiculoRestringido("V");

    const claseEstado = obtenerClaseEstadoVehiculo(vehiculo.estadoVehiculo);

    const cantidadIncidencias = contarIncidenciasPorPlaca(vehiculo.placa);

    let accionHTML = "Solo consulta";

    if (usuarioActivo.rol === "Administrador") {
      accionHTML = `
        <button class="mark-read-btn small-btn" onclick="cambiarEstadoVehiculoRapido(${vehiculo.id}, 'Autorizado')">
          Autorizar
        </button>

        <button class="secondary-btn small-btn" onclick="cambiarEstadoVehiculoRapido(${vehiculo.id}, 'Pendiente')">
          Pendiente
        </button>

        <button class="delete-btn small-btn" onclick="cambiarEstadoVehiculoRapido(${vehiculo.id}, 'Restringido')">
          Restringir
        </button>
      `;
    }

    fila.innerHTML = `
      <td>
        <img src="${fotoVehiculo}" class="vehicle-photo" alt="Foto vehículo">
      </td>

      <td><strong>${vehiculo.placa || "Sin placa"}</strong></td>
      <td>${vehiculo.nombrePropietario || "Sin propietario"}</td>
      <td>${vehiculo.dniPropietario || "Sin DNI"}</td>
      <td>${vehiculo.areaPropietario || "Sin área"}</td>
      <td>${vehiculo.marca || "Sin marca"}</td>
      <td>${vehiculo.modelo || "Sin modelo"}</td>
      <td>${vehiculo.color || "Sin color"}</td>
      <td>${vehiculo.tipoVehiculo || "Sin tipo"}</td>

      <td>
        <span class="status-badge ${claseEstado}">
          ${vehiculo.estadoVehiculo || "Sin estado"}
        </span>
      </td>

      <td>
        <span class="incident-count">
          ${cantidadIncidencias}
        </span>
      </td>

      <td>${vehiculo.observacionesVehiculo || "Sin observación"}</td>
      <td>${accionHTML}</td>
    `;

    restrictedVehiclesTableBody.appendChild(fila);
  });
}

function cargarIncidenciasPorPlaca(busqueda = "") {
  const plateIncidentsTableBody = document.getElementById("plateIncidentsTableBody");

  if (!plateIncidentsTableBody) {
    return;
  }

  const incidencias = JSON.parse(localStorage.getItem("incidenciasSeguridad")) || [];
  const textoBusqueda = busqueda.toLowerCase();

  const incidenciasConPlaca = incidencias.filter(function(incidencia) {
    const tienePlaca = String(incidencia.placa || "").trim() !== "";

    const coincideBusqueda =
      String(incidencia.placa || "").toLowerCase().includes(textoBusqueda) ||
      String(incidencia.tipo || "").toLowerCase().includes(textoBusqueda) ||
      String(incidencia.persona || "").toLowerCase().includes(textoBusqueda) ||
      String(incidencia.dni || "").toLowerCase().includes(textoBusqueda) ||
      String(incidencia.ubicacion || "").toLowerCase().includes(textoBusqueda) ||
      String(incidencia.descripcion || "").toLowerCase().includes(textoBusqueda);

    return tienePlaca && coincideBusqueda;
  });

  plateIncidentsTableBody.innerHTML = "";

  if (incidenciasConPlaca.length === 0) {
    plateIncidentsTableBody.innerHTML = `
      <tr>
        <td colspan="8">No hay incidencias asociadas a placas.</td>
      </tr>
    `;
    return;
  }

  incidenciasConPlaca.forEach(function(incidencia) {
    const fila = document.createElement("tr");

    const clasePrioridad = obtenerClasePrioridadVehiculo(incidencia.prioridad);
    const claseEstado = obtenerClaseEstadoIncidenciaVehiculo(incidencia.estado);

    fila.innerHTML = `
      <td>${incidencia.fecha || "-"}</td>
      <td><strong>${incidencia.placa || "-"}</strong></td>
      <td>${incidencia.tipo || "-"}</td>

      <td>
        <span class="priority-badge ${clasePrioridad}">
          ${incidencia.prioridad || "-"}
        </span>
      </td>

      <td>
        <span class="incident-status ${claseEstado}">
          ${incidencia.estado || "-"}
        </span>
      </td>

      <td>${incidencia.ubicacion || "-"}</td>
      <td>${incidencia.registradoPorNombre || "-"}</td>
      <td class="description-cell">${incidencia.descripcion || "-"}</td>
    `;

    plateIncidentsTableBody.appendChild(fila);
  });
}

function actualizarResumenVehiculos(vehiculos, incidencias) {
  const totalRestringidos = document.getElementById("totalRestringidos");
  const totalPendientes = document.getElementById("totalPendientes");
  const totalAutorizados = document.getElementById("totalAutorizados");
  const totalIncidenciasPlaca = document.getElementById("totalIncidenciasPlaca");

  if (!totalRestringidos || !totalPendientes || !totalAutorizados || !totalIncidenciasPlaca) {
    return;
  }

  totalRestringidos.textContent = vehiculos.filter(function(vehiculo) {
    return vehiculo.estadoVehiculo === "Restringido";
  }).length;

  totalPendientes.textContent = vehiculos.filter(function(vehiculo) {
    return vehiculo.estadoVehiculo === "Pendiente";
  }).length;

  totalAutorizados.textContent = vehiculos.filter(function(vehiculo) {
    return vehiculo.estadoVehiculo === "Autorizado";
  }).length;

  totalIncidenciasPlaca.textContent = incidencias.filter(function(incidencia) {
    return String(incidencia.placa || "").trim() !== "";
  }).length;
}

function contarIncidenciasPorPlaca(placa) {
  const incidencias = JSON.parse(localStorage.getItem("incidenciasSeguridad")) || [];

  const total = incidencias.filter(function(incidencia) {
    return String(incidencia.placa || "").toUpperCase() === String(placa || "").toUpperCase();
  });

  return total.length;
}

function cambiarEstadoVehiculoRapido(id, nuevoEstado) {
  const confirmar = confirm("¿Deseas cambiar el estado del vehículo a " + nuevoEstado + "?");

  if (!confirmar) {
    return;
  }

  let vehiculos = JSON.parse(localStorage.getItem("vehiculos")) || [];

  vehiculos = vehiculos.map(function(vehiculo) {
    if (vehiculo.id === id) {
      vehiculo.estadoVehiculo = nuevoEstado;

      if (nuevoEstado === "Autorizado") {
        vehiculo.observacionesVehiculo = "Vehículo autorizado desde el módulo de alertas.";
      }

      if (nuevoEstado === "Pendiente") {
        vehiculo.observacionesVehiculo = "Vehículo marcado como pendiente de revisión.";
      }

      if (nuevoEstado === "Restringido") {
        vehiculo.observacionesVehiculo = "Vehículo restringido por administración.";
      }
    }

    return vehiculo;
  });

  localStorage.setItem("vehiculos", JSON.stringify(vehiculos));

  cargarVehiculosRestringidos();
  cargarIncidenciasPorPlaca();

  alert("Estado actualizado correctamente.");
}

function obtenerClaseEstadoVehiculo(estado) {
  if (estado === "Autorizado") {
    return "status-autorizado";
  }

  if (estado === "Pendiente") {
    return "status-pendiente";
  }

  if (estado === "Restringido") {
    return "status-restringido";
  }

  return "";
}

function obtenerClasePrioridadVehiculo(prioridad) {
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

function obtenerClaseEstadoIncidenciaVehiculo(estado) {
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

function generarImagenVehiculoRestringido(texto) {
  return "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='70' height='50'><rect width='70' height='50' fill='%23cbd5e1'/><text x='50%' y='55%' dominant-baseline='middle' text-anchor='middle' font-size='20' fill='%23334155'>" + texto + "</text></svg>";
}