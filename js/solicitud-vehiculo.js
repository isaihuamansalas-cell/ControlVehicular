// ===============================
// UNICONNECT - SOLICITUD VEHICULAR
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
  const vehicleRequestForm = document.getElementById("vehicleRequestForm");

  if (backBtn) {
    backBtn.addEventListener("click", function() {
      window.location.href = "dashboard.html";
    });
  }

  cargarDatosAlumno(usuarioActivo);
  cargarMisSolicitudes(usuarioActivo);

  if (vehicleRequestForm) {
    vehicleRequestForm.addEventListener("submit", function(event) {
      event.preventDefault();
      registrarSolicitudVehicular();
    });
  }
});

function cargarDatosAlumno(usuario) {
  document.getElementById("studentName").textContent = usuario.nombre || "-";
  document.getElementById("studentDni").textContent = usuario.dni || "-";
  document.getElementById("studentArea").textContent = usuario.area || "-";
  document.getElementById("studentEmail").textContent = usuario.email || "-";
}

function registrarSolicitudVehicular() {
  const usuarioActivo = JSON.parse(sessionStorage.getItem("usuarioActivo"));

  const placa = document.getElementById("placaSolicitud").value.trim().toUpperCase();
  const tipo = document.getElementById("tipoSolicitud").value;
  const marca = document.getElementById("marcaSolicitud").value.trim();
  const modelo = document.getElementById("modeloSolicitud").value.trim();
  const color = document.getElementById("colorSolicitud").value.trim();
  const observacion = document.getElementById("observacionSolicitud").value.trim();

  const fotoVehiculoInput = document.getElementById("fotoVehiculoSolicitud");
  const fotoPlacaInput = document.getElementById("fotoPlacaSolicitud");

  if (placa === "" || tipo === "" || marca === "" || modelo === "" || color === "") {
    mostrarMensajeSolicitud("Completa los campos obligatorios.", "error");
    return;
  }

  const vehiculos = JSON.parse(localStorage.getItem("vehiculos")) || [];

  const placaYaRegistrada = vehiculos.some(function(vehiculo) {
    return String(vehiculo.placa || "").toUpperCase() === placa;
  });

  if (placaYaRegistrada) {
    mostrarMensajeSolicitud("Esta placa ya se encuentra registrada en el sistema.", "error");
    return;
  }

  const solicitudes = JSON.parse(localStorage.getItem("solicitudesVehiculo")) || [];

  const solicitudPendiente = solicitudes.some(function(solicitud) {
    return (
      String(solicitud.placa || "").toUpperCase() === placa &&
      solicitud.estadoSolicitud === "Pendiente"
    );
  });

  if (solicitudPendiente) {
    mostrarMensajeSolicitud("Ya existe una solicitud pendiente para esta placa.", "error");
    return;
  }

  const archivoVehiculo = fotoVehiculoInput.files[0];
  const archivoPlaca = fotoPlacaInput.files[0];

  convertirImagenesSolicitud(archivoVehiculo, archivoPlaca, function(fotoVehiculo, fotoPlaca) {
    guardarSolicitudVehicular(
      usuarioActivo,
      placa,
      tipo,
      marca,
      modelo,
      color,
      observacion,
      fotoVehiculo,
      fotoPlaca
    );
  });
}

function convertirImagenesSolicitud(archivoVehiculo, archivoPlaca, callback) {
  let fotoVehiculo = "";
  let fotoPlaca = "";

  if (!archivoVehiculo && !archivoPlaca) {
    callback(fotoVehiculo, fotoPlaca);
    return;
  }

  if (archivoVehiculo) {
    const readerVehiculo = new FileReader();

    readerVehiculo.onload = function(event) {
      fotoVehiculo = event.target.result;

      if (archivoPlaca) {
        leerFotoPlaca();
      } else {
        callback(fotoVehiculo, fotoPlaca);
      }
    };

    readerVehiculo.readAsDataURL(archivoVehiculo);
  } else {
    leerFotoPlaca();
  }

  function leerFotoPlaca() {
    const readerPlaca = new FileReader();

    readerPlaca.onload = function(event) {
      fotoPlaca = event.target.result;
      callback(fotoVehiculo, fotoPlaca);
    };

    readerPlaca.readAsDataURL(archivoPlaca);
  }
}

function guardarSolicitudVehicular(
  usuario,
  placa,
  tipo,
  marca,
  modelo,
  color,
  observacion,
  fotoVehiculo,
  fotoPlaca
) {
  let solicitudes = JSON.parse(localStorage.getItem("solicitudesVehiculo")) || [];

  const nuevaSolicitud = {
    id: Date.now(),
    alumnoId: usuario.id,
    nombreAlumno: usuario.nombre,
    dniAlumno: usuario.dni,
    areaAlumno: usuario.area,
    emailAlumno: usuario.email,
    placa: placa,
    tipo: tipo,
    marca: marca,
    modelo: modelo,
    color: color,
    observacion: observacion,
    fotoVehiculo: fotoVehiculo,
    fotoPlaca: fotoPlaca,
    estadoSolicitud: "Pendiente",
    motivoRechazo: "",
    fechaSolicitud: new Date().toLocaleString(),
    fechaRevision: ""
  };

  solicitudes.unshift(nuevaSolicitud);

  localStorage.setItem("solicitudesVehiculo", JSON.stringify(solicitudes));

  document.getElementById("vehicleRequestForm").reset();

  mostrarMensajeSolicitud("Solicitud enviada correctamente. Estado: Pendiente.", "success");

  cargarMisSolicitudes(usuario);
}

function cargarMisSolicitudes(usuario) {
  const myRequestsTableBody = document.getElementById("myRequestsTableBody");

  if (!myRequestsTableBody) {
    return;
  }

  const solicitudes = JSON.parse(localStorage.getItem("solicitudesVehiculo")) || [];

  const misSolicitudes = solicitudes.filter(function(solicitud) {
    return String(solicitud.dniAlumno) === String(usuario.dni);
  });

  myRequestsTableBody.innerHTML = "";

  if (misSolicitudes.length === 0) {
    myRequestsTableBody.innerHTML = `
      <tr>
        <td colspan="7">Todavía no tienes solicitudes vehiculares.</td>
      </tr>
    `;
    return;
  }

  misSolicitudes.forEach(function(solicitud) {
    const fila = document.createElement("tr");

    const claseEstado = obtenerClaseSolicitud(solicitud.estadoSolicitud);

    fila.innerHTML = `
      <td>${solicitud.fechaSolicitud || "-"}</td>
      <td><strong>${solicitud.placa || "-"}</strong></td>
      <td>${solicitud.marca || "-"}</td>
      <td>${solicitud.modelo || "-"}</td>
      <td>${solicitud.tipo || "-"}</td>
      <td>
        <span class="status-badge ${claseEstado}">
          ${solicitud.estadoSolicitud}
        </span>
      </td>
      <td>
        ${
          solicitud.estadoSolicitud === "Rechazada"
            ? solicitud.motivoRechazo || "Sin motivo registrado"
            : solicitud.observacion || "Sin observación"
        }
      </td>
    `;

    myRequestsTableBody.appendChild(fila);
  });
}

function obtenerClaseSolicitud(estado) {
  if (estado === "Aprobada") {
    return "status-autorizado";
  }

  if (estado === "Pendiente") {
    return "status-pendiente";
  }

  if (estado === "Rechazada") {
    return "status-restringido";
  }

  return "";
}

function mostrarMensajeSolicitud(texto, tipo) {
  const requestMessage = document.getElementById("requestMessage");

  if (!requestMessage) {
    alert(texto);
    return;
  }

  requestMessage.textContent = texto;
  requestMessage.className = "message " + tipo;

  setTimeout(function() {
    requestMessage.textContent = "";
    requestMessage.className = "message";
  }, 3000);
}