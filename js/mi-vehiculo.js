// ===============================
// UNICONNECT - MI VEHÍCULO
// ===============================

document.addEventListener("DOMContentLoaded", function() {
  const usuarioActivo = JSON.parse(sessionStorage.getItem("usuarioActivo"));

  if (!usuarioActivo) {
    window.location.href = "index.html";
    return;
  }

  if (usuarioActivo.rol !== "Alumno") {
    alert("Este módulo está disponible solo para alumnos.");
    window.location.href = "dashboard.html";
    return;
  }

  const backBtn = document.getElementById("backBtn");

  if (backBtn) {
    backBtn.addEventListener("click", function() {
      window.location.href = "dashboard.html";
    });
  }

  cargarMiVehiculo(usuarioActivo);
});

function cargarMiVehiculo(usuarioActivo) {
  const vehiculos = JSON.parse(localStorage.getItem("vehiculos")) || [];

  const miVehiculo = vehiculos.find(function(vehiculo) {
    return String(vehiculo.dniPropietario) === String(usuarioActivo.dni);
  });

  const noVehicleMessage = document.getElementById("noVehicleMessage");
  const myVehicleSection = document.getElementById("myVehicleSection");

  if (!miVehiculo) {
    noVehicleMessage.classList.remove("hidden");
    myVehicleSection.classList.add("hidden");
    return;
  }

  noVehicleMessage.classList.add("hidden");
  myVehicleSection.classList.remove("hidden");

  pintarDatosVehiculo(miVehiculo);
}

function pintarDatosVehiculo(vehiculo) {
  const myVehiclePhoto = document.getElementById("myVehiclePhoto");
  const myPlatePhoto = document.getElementById("myPlatePhoto");
  const myVehicleStatus = document.getElementById("myVehicleStatus");

  myVehiclePhoto.src = vehiculo.fotoVehiculo || generarImagenVehiculoGrande("Vehículo");
  myPlatePhoto.src = vehiculo.fotoPlaca || generarImagenPlacaGrande("Placa");

  myVehicleStatus.textContent = vehiculo.estadoVehiculo || "Sin estado";
  myVehicleStatus.className = "status-badge " + obtenerClaseEstadoVehiculo(vehiculo.estadoVehiculo);

  document.getElementById("myVehiclePlate").textContent = vehiculo.placa || "Sin placa";
  document.getElementById("myVehicleOwner").textContent = vehiculo.nombrePropietario || "Sin propietario";

  document.getElementById("myVehicleBrand").textContent = vehiculo.marca || "-";
  document.getElementById("myVehicleModel").textContent = vehiculo.modelo || "-";
  document.getElementById("myVehicleColor").textContent = vehiculo.color || "-";
  document.getElementById("myVehicleType").textContent = vehiculo.tipoVehiculo || "-";
  document.getElementById("myVehicleDni").textContent = vehiculo.dniPropietario || "-";
  document.getElementById("myVehicleArea").textContent = vehiculo.areaPropietario || "-";

  document.getElementById("myVehicleObservation").textContent =
    vehiculo.observacionesVehiculo || "Sin observaciones registradas.";
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

function generarImagenVehiculoGrande(texto) {
  return "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='600' height='350'><rect width='600' height='350' fill='%23cbd5e1'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-size='40' fill='%23334155'>" + texto + "</text></svg>";
}

function generarImagenPlacaGrande(texto) {
  return "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='420' height='220'><rect width='420' height='220' fill='%23cbd5e1'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-size='36' fill='%23334155'>" + texto + "</text></svg>";
}