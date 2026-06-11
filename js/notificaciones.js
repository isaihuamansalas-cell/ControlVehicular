// ===============================
// UNICONNECT - NOTIFICACIONES
// ===============================

document.addEventListener("DOMContentLoaded", function() {
  const usuarioActivo = JSON.parse(sessionStorage.getItem("usuarioActivo"));

  if (!usuarioActivo) {
    window.location.href = "index.html";
    return;
  }

  const backBtn = document.getElementById("backBtn");
  const notificationForm = document.getElementById("notificationForm");
  const notificationFormSection = document.getElementById("notificationFormSection");
  const searchNotification = document.getElementById("searchNotification");
  const nivelNotificacion = document.getElementById("nivelNotificacion");

  if (backBtn) {
    backBtn.addEventListener("click", function() {
      window.location.href = "dashboard.html";
    });
  }

  configurarPermisos(usuarioActivo);

  if (notificationForm) {
    notificationForm.addEventListener("submit", function(event) {
      event.preventDefault();
      registrarNotificacion();
    });
  }

  if (searchNotification) {
    searchNotification.addEventListener("input", function() {
      cargarNotificaciones(searchNotification.value);
    });
  }

  if (nivelNotificacion) {
    nivelNotificacion.addEventListener("change", function() {
      ajustarCamposPorNivel();
    });
  }

  crearNotificacionesIniciales();
  ajustarCamposPorNivel();
  cargarNotificaciones();
});

function configurarPermisos(usuarioActivo) {
  const notificationFormSection = document.getElementById("notificationFormSection");
  const nivelNotificacion = document.getElementById("nivelNotificacion");

  // Alumno y Seguridad solo leen comunicados
  if (
    usuarioActivo.rol === "Alumno" ||
    usuarioActivo.rol === "Seguridad"
  ) {
    if (notificationFormSection) {
      notificationFormSection.classList.add("hidden");
    }
  }

  // Profesor no puede emitir comunicados globales
  if (usuarioActivo.rol === "Profesor" && nivelNotificacion) {
    const opcionGlobal = nivelNotificacion.querySelector('option[value="Global"]');

    if (opcionGlobal) {
      opcionGlobal.remove();
    }

    nivelNotificacion.value = "Curso";
  }
}

function crearNotificacionesIniciales() {
  const notificacionesExistentes = JSON.parse(localStorage.getItem("notificaciones")) || [];

  if (notificacionesExistentes.length > 0) {
    return;
  }

  const notificacionesIniciales = [
    {
      id: 1,
      titulo: "Bienvenido a UniConnect",
      mensaje: "Este es el sistema de comunicados internos de la universidad.",
      nivel: "Global",
      area: "",
      curso: "",
      prioridad: "Normal",
      emisor: "Sistema",
      rolEmisor: "Administrador",
      fecha: new Date().toLocaleString(),
      leidosPor: []
    },
    {
      id: 2,
      titulo: "Uso obligatorio del fotocheck",
      mensaje: "Se recuerda a toda la comunidad universitaria portar su identificación dentro del campus.",
      nivel: "Global",
      area: "",
      curso: "",
      prioridad: "Importante",
      emisor: "Administración",
      rolEmisor: "Administrador",
      fecha: new Date().toLocaleString(),
      leidosPor: []
    }
  ];

  localStorage.setItem("notificaciones", JSON.stringify(notificacionesIniciales));
}

function ajustarCamposPorNivel() {
  const nivel = document.getElementById("nivelNotificacion");
  const area = document.getElementById("areaNotificacion");
  const curso = document.getElementById("cursoNotificacion");

  if (!nivel || !area || !curso) {
    return;
  }

  if (nivel.value === "Global") {
    area.value = "";
    curso.value = "";
    area.disabled = true;
    curso.disabled = true;
  }

  if (nivel.value === "Área") {
    area.disabled = false;
    curso.value = "";
    curso.disabled = true;
  }

  if (nivel.value === "Curso") {
    area.disabled = false;
    curso.disabled = false;
  }
}

function registrarNotificacion() {
  const usuarioActivo = JSON.parse(sessionStorage.getItem("usuarioActivo"));

  const titulo = document.getElementById("tituloNotificacion").value.trim();
  const prioridad = document.getElementById("prioridadNotificacion").value;
  const nivel = document.getElementById("nivelNotificacion").value;
  const area = document.getElementById("areaNotificacion").value;
  const curso = document.getElementById("cursoNotificacion").value.trim();
  const mensaje = document.getElementById("mensajeNotificacion").value.trim();

  if (usuarioActivo.rol !== "Administrador" && usuarioActivo.rol !== "Profesor") {
    mostrarMensajeNotificacion("No tienes permiso para crear comunicados.", "error");
    return;
  }

  if (usuarioActivo.rol === "Profesor" && nivel === "Global") {
    mostrarMensajeNotificacion("El profesor no puede crear comunicados globales.", "error");
    return;
  }

  if (nivel === "Área" && area === "") {
    mostrarMensajeNotificacion("Selecciona un área académica.", "error");
    return;
  }

  if (nivel === "Curso" && curso === "") {
    mostrarMensajeNotificacion("Escribe el curso o aula del comunicado.", "error");
    return;
  }

  let notificaciones = JSON.parse(localStorage.getItem("notificaciones")) || [];

  const nuevaNotificacion = {
    id: Date.now(),
    titulo: titulo,
    mensaje: mensaje,
    nivel: nivel,
    area: area,
    curso: curso,
    prioridad: prioridad,
    emisor: usuarioActivo.nombre,
    rolEmisor: usuarioActivo.rol,
    fecha: new Date().toLocaleString(),
    leidosPor: []
  };

  notificaciones.unshift(nuevaNotificacion);

  localStorage.setItem("notificaciones", JSON.stringify(notificaciones));

  document.getElementById("notificationForm").reset();

  ajustarCamposPorNivel();

  mostrarMensajeNotificacion("Comunicado publicado correctamente.", "success");

  cargarNotificaciones();
}

function cargarNotificaciones(filtro = "") {
  const notificationsList = document.getElementById("notificationsList");

  if (!notificationsList) {
    return;
  }

  const usuarioActivo = JSON.parse(sessionStorage.getItem("usuarioActivo"));
  const notificaciones = JSON.parse(localStorage.getItem("notificaciones")) || [];
  const textoFiltro = filtro.toLowerCase();

  const notificacionesVisibles = notificaciones.filter(function(notificacion) {
    return puedeVerNotificacion(usuarioActivo, notificacion);
  });

  const notificacionesFiltradas = notificacionesVisibles.filter(function(notificacion) {
    return (
      String(notificacion.titulo || "").toLowerCase().includes(textoFiltro) ||
      String(notificacion.mensaje || "").toLowerCase().includes(textoFiltro) ||
      String(notificacion.nivel || "").toLowerCase().includes(textoFiltro) ||
      String(notificacion.area || "").toLowerCase().includes(textoFiltro) ||
      String(notificacion.curso || "").toLowerCase().includes(textoFiltro) ||
      String(notificacion.prioridad || "").toLowerCase().includes(textoFiltro) ||
      String(notificacion.emisor || "").toLowerCase().includes(textoFiltro)
    );
  });

  actualizarResumen(notificacionesVisibles, usuarioActivo);

  notificationsList.innerHTML = "";

  if (notificacionesFiltradas.length === 0) {
    notificationsList.innerHTML = `
      <div class="notification-card">
        <h3>No hay comunicados disponibles</h3>
        <p>No se encontraron notificaciones para tu usuario.</p>
      </div>
    `;
    return;
  }

  notificacionesFiltradas.forEach(function(notificacion) {
    const card = document.createElement("div");

    const estaLeida = estaNotificacionLeida(notificacion, usuarioActivo.id);

    card.className = estaLeida ? "notification-card" : "notification-card unread";

    const nivelClase = obtenerClaseNivel(notificacion.nivel);
    const prioridadClase = obtenerClasePrioridad(notificacion.prioridad);

    let accionHTML = "";

    if (!estaLeida) {
      accionHTML += `
        <button class="mark-read-btn" onclick="marcarComoLeida(${notificacion.id})">
          Marcar como leída
        </button>
      `;
    }

    if (usuarioActivo.rol === "Administrador") {
      accionHTML += `
        <button class="delete-btn" onclick="eliminarNotificacion(${notificacion.id})">
          Eliminar
        </button>
      `;
    }

    card.innerHTML = `
      <div class="notification-meta">
        <span class="notification-badge ${nivelClase}">${notificacion.nivel}</span>
        <span class="notification-badge ${prioridadClase}">${notificacion.prioridad}</span>
        <span class="notification-badge read-status">${estaLeida ? "Leído" : "No leído"}</span>
      </div>

      <h3>${notificacion.titulo}</h3>

      <p>${notificacion.mensaje}</p>

      <div class="notification-meta">
        <span class="notification-badge read-status">Emisor: ${notificacion.emisor}</span>
        <span class="notification-badge read-status">Fecha: ${notificacion.fecha}</span>
        ${notificacion.area ? `<span class="notification-badge read-status">Área: ${notificacion.area}</span>` : ""}
        ${notificacion.curso ? `<span class="notification-badge read-status">Curso: ${notificacion.curso}</span>` : ""}
      </div>

      <div class="notification-actions">
        ${accionHTML || "Sin acciones disponibles"}
      </div>
    `;

    notificationsList.appendChild(card);
  });
}

function puedeVerNotificacion(usuario, notificacion) {
  if (!usuario || !notificacion) {
    return false;
  }

  // Los comunicados globales los ven todos
  if (notificacion.nivel === "Global") {
    return true;
  }

  // Los comunicados por área los ven usuarios de esa área
  if (notificacion.nivel === "Área") {
    return String(usuario.area || "") === String(notificacion.area || "");
  }

  // Los comunicados por curso los ven usuarios cuya aula/curso coincida
  // También los ve quien lo emitió, para poder revisarlo.
  if (notificacion.nivel === "Curso") {
    return (
      String(usuario.aula || "").toLowerCase() === String(notificacion.curso || "").toLowerCase() ||
      String(usuario.nombre || "") === String(notificacion.emisor || "")
    );
  }

  return false;
}

function estaNotificacionLeida(notificacion, usuarioId) {
  if (!notificacion.leidosPor) {
    notificacion.leidosPor = [];
  }

  return notificacion.leidosPor.includes(usuarioId);
}

function marcarComoLeida(id) {
  const usuarioActivo = JSON.parse(sessionStorage.getItem("usuarioActivo"));
  let notificaciones = JSON.parse(localStorage.getItem("notificaciones")) || [];

  notificaciones = notificaciones.map(function(notificacion) {
    if (notificacion.id === id) {
      if (!notificacion.leidosPor) {
        notificacion.leidosPor = [];
      }

      if (!notificacion.leidosPor.includes(usuarioActivo.id)) {
        notificacion.leidosPor.push(usuarioActivo.id);
      }
    }

    return notificacion;
  });

  localStorage.setItem("notificaciones", JSON.stringify(notificaciones));

  cargarNotificaciones();
}

function eliminarNotificacion(id) {
  const confirmar = confirm("¿Seguro que deseas eliminar este comunicado?");

  if (!confirmar) {
    return;
  }

  let notificaciones = JSON.parse(localStorage.getItem("notificaciones")) || [];

  notificaciones = notificaciones.filter(function(notificacion) {
    return notificacion.id !== id;
  });

  localStorage.setItem("notificaciones", JSON.stringify(notificaciones));

  cargarNotificaciones();

  mostrarMensajeNotificacion("Comunicado eliminado correctamente.", "success");
}

function actualizarResumen(notificaciones, usuarioActivo) {
  const totalNotifications = document.getElementById("totalNotifications");
  const unreadNotifications = document.getElementById("unreadNotifications");
  const urgentNotifications = document.getElementById("urgentNotifications");

  if (!totalNotifications || !unreadNotifications || !urgentNotifications) {
    return;
  }

  const total = notificaciones.length;

  const noLeidas = notificaciones.filter(function(notificacion) {
    return !estaNotificacionLeida(notificacion, usuarioActivo.id);
  }).length;

  const urgentes = notificaciones.filter(function(notificacion) {
    return notificacion.prioridad === "Urgente";
  }).length;

  totalNotifications.textContent = total;
  unreadNotifications.textContent = noLeidas;
  urgentNotifications.textContent = urgentes;
}

function obtenerClaseNivel(nivel) {
  if (nivel === "Global") {
    return "badge-global";
  }

  if (nivel === "Área") {
    return "badge-area";
  }

  if (nivel === "Curso") {
    return "badge-curso";
  }

  return "";
}

function obtenerClasePrioridad(prioridad) {
  if (prioridad === "Normal") {
    return "priority-normal";
  }

  if (prioridad === "Importante") {
    return "priority-importante";
  }

  if (prioridad === "Urgente") {
    return "priority-urgente";
  }

  return "";
}

function mostrarMensajeNotificacion(texto, tipo) {
  const notificationMessage = document.getElementById("notificationMessage");

  if (!notificationMessage) {
    alert(texto);
    return;
  }

  notificationMessage.textContent = texto;
  notificationMessage.className = "message " + tipo;

  setTimeout(function() {
    notificationMessage.textContent = "";
    notificationMessage.className = "message";
  }, 3000);
}