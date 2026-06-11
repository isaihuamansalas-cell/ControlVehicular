// ===============================
// UNICONNECT - AUTENTICACIÓN
// ===============================

// Usuarios iniciales de prueba
const usuariosIniciales = [
  {
    id: 1,
    nombre: "Administrador General",
    dni: "00000001",
    email: "admin@uni.edu",
    password: "123456",
    rol: "Administrador",
    area: "Administración",
    aula: "Oficina Central",
    foto: "",
    estado: "Activo"
  },
  {
    id: 2,
    nombre: "Carlos Mendoza",
    dni: "00000002",
    email: "profesor@uni.edu",
    password: "123456",
    rol: "Profesor",
    area: "Ingenierías",
    aula: "Programación I",
    foto: "",
    estado: "Activo"
  },
  {
    id: 3,
    nombre: "Lucía Torres",
    dni: "00000003",
    email: "alumno@uni.edu",
    password: "123456",
    rol: "Alumno",
    area: "Ciencias de la Salud",
    aula: "Enfermería I",
    foto: "",
    estado: "Activo"
  },
  {
    id: 4,
    nombre: "Pedro Ramos",
    dni: "00000004",
    email: "seguridad@uni.edu",
    password: "123456",
    rol: "Seguridad",
    area: "Seguridad Universitaria",
    aula: "Control Principal",
    foto: "",
    estado: "Activo"
  }
];

// Crear usuarios iniciales si no existen
if (!localStorage.getItem("usuarios")) {
  localStorage.setItem("usuarios", JSON.stringify(usuariosIniciales));
}

// Esperar a que cargue la página
document.addEventListener("DOMContentLoaded", function() {

  // ===============================
  // LOGIN
  // ===============================

  const loginForm = document.getElementById("loginForm");
  const loginMessage = document.getElementById("loginMessage");

  if (loginForm) {
    loginForm.addEventListener("submit", function(event) {
      event.preventDefault();

      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value.trim();

      const usuariosGuardados = JSON.parse(localStorage.getItem("usuarios")) || [];

      const usuarioEncontrado = usuariosGuardados.find(function(usuario) {
        return usuario.email === email && usuario.password === password;
      });

      if (usuarioEncontrado) {
        sessionStorage.setItem("usuarioActivo", JSON.stringify(usuarioEncontrado));

        loginMessage.textContent = "Inicio de sesión correcto. Bienvenido, " + usuarioEncontrado.nombre;
        loginMessage.className = "message success";

        setTimeout(function() {
          window.location.href = "dashboard.html";
        }, 800);

      } else {
        loginMessage.textContent = "Correo o contraseña incorrectos.";
        loginMessage.className = "message error";
      }
    });
  }

  // ===============================
  // DASHBOARD
  // ===============================

  const estaEnDashboard = window.location.pathname.includes("dashboard.html");

  if (estaEnDashboard) {
    const usuarioActivo = JSON.parse(sessionStorage.getItem("usuarioActivo"));

    if (!usuarioActivo) {
      window.location.href = "index.html";
      return;
    }

    cargarDashboard(usuarioActivo);
  }

  // ===============================
  // CERRAR SESIÓN
  // ===============================

  const logoutBtn = document.getElementById("logoutBtn");

  if (logoutBtn) {
    logoutBtn.addEventListener("click", function() {
      sessionStorage.removeItem("usuarioActivo");
      window.location.href = "index.html";
    });
  }
});

// ===============================
// CARGAR PANEL SEGÚN ROL
// ===============================

function cargarDashboard(usuario) {
  const welcomeTitle = document.getElementById("welcomeTitle");
  const userInfo = document.getElementById("userInfo");
  const roleTitle = document.getElementById("roleTitle");
  const menuOptions = document.getElementById("menuOptions");

  if (!welcomeTitle || !userInfo || !roleTitle || !menuOptions) {
    return;
  }

  welcomeTitle.textContent = "Bienvenido, " + usuario.nombre;

  userInfo.textContent =
    "Rol: " + usuario.rol +
    " | Área: " + usuario.area +
    " | Aula/Curso: " + (usuario.aula || "No asignado") +
    " | Correo: " + usuario.email;

  roleTitle.textContent = "Panel de " + usuario.rol;

  const opciones = obtenerOpcionesPorRol(usuario);

  menuOptions.innerHTML = "";

  opciones.forEach(function(opcion) {
    const card = document.createElement("div");
    card.className = opcion.disponible ? "menu-card" : "menu-card disabled-card";

    card.innerHTML = `
      <div class="card-status">
        <span>${opcion.icono}</span>
        <small>${opcion.disponible ? "Disponible" : "En desarrollo"}</small>
      </div>

      <h3>${opcion.titulo}</h3>
      <p>${opcion.descripcion}</p>
    `;

    if (opcion.disponible && opcion.enlace) {
      card.addEventListener("click", function() {
        window.location.href = opcion.enlace;
      });
    }

    if (!opcion.disponible) {
      card.addEventListener("click", function() {
        alert("Este módulo todavía está en desarrollo.");
      });
    }

    menuOptions.appendChild(card);
  });
}
function obtenerOpcionesPorRol(usuario) {
  if (usuario.rol === "Administrador") {
    return [
      {
        titulo: "Gestión de usuarios",
        descripcion: "Registrar, editar, buscar y eliminar usuarios del sistema.",
        enlace: "usuarios.html",
        icono: "👥",
        disponible: true
      },
      {
        titulo: "Control vehicular",
        descripcion: "Registrar y administrar vehículos vinculados a usuarios.",
        enlace: "vehiculos.html",
        icono: "🚗",
        disponible: true
      },
      {
        titulo: "Asistencia digital",
        descripcion: "Consultar y gestionar registros de asistencia con firma.",
        enlace: "asistencia.html",
        icono: "✍️",
        disponible: true
      },
      {
        titulo: "Notas y rendimiento",
        descripcion: "Consultar notas, promedios y semáforo académico.",
        enlace: "notas.html",
        icono: "📊",
        disponible: true
      },
      {
        titulo: "Notificaciones",
        descripcion: "Crear comunicados globales, por área o por curso.",
        enlace: "notificaciones.html",
        icono: "🔔",
        disponible: true
      },
      {
        titulo: "Marketplace",
        descripcion: "Supervisar productos y emprendimientos universitarios.",
        enlace: "marketplace.html",
        icono: "🛒",
        disponible: true
      },
      {
        titulo: "Reportes generales",
        descripcion: "Generar reportes ejecutivos y exportar archivos CSV.",
        enlace: "reportes.html",
        icono: "📁",
        disponible: true
      },
      {
        titulo: "Configuración del sistema",
        descripcion: "Ajustes generales, áreas académicas y parámetros del sistema.",
        enlace: "",
        icono: "⚙️",
        disponible: false
      }
    ];
  }

  if (usuario.rol === "Profesor") {
    return [
      {
        titulo: "Asistencia digital",
        descripcion: "Registrar asistencia diaria con firma digital de alumnos.",
        enlace: "asistencia.html",
        icono: "✍️",
        disponible: true
      },
      {
        titulo: "Notas y rendimiento",
        descripcion: "Registrar notas, revisar promedios y generar fichas.",
        enlace: "notas.html",
        icono: "📊",
        disponible: true
      },
      {
        titulo: "Comunicados del curso",
        descripcion: "Enviar mensajes a los alumnos inscritos en un curso.",
        enlace: "notificaciones.html",
        icono: "🔔",
        disponible: true
      },
      {
        titulo: "Marketplace",
        descripcion: "Consultar productos y servicios disponibles en el campus.",
        enlace: "marketplace.html",
        icono: "🛒",
        disponible: true
      },
      {
        titulo: "Mis cursos",
        descripcion: "Ver cursos asignados y estudiantes inscritos.",
        enlace: "",
        icono: "📚",
        disponible: false
      }
    ];
  }

  if (usuario.rol === "Alumno") {
    return [
      {
        titulo: "Mi rendimiento",
        descripcion: "Ver notas, asistencias, faltas y estado académico.",
        enlace: "notas.html",
        icono: "📊",
        disponible: true
      },
      {
        titulo: "Mi asistencia",
        descripcion: "Consultar mis registros de asistencia y firma digital.",
        enlace: "asistencia.html",
        icono: "✍️",
        disponible: true
      },
      {
        titulo: "Notificaciones",
        descripcion: "Ver comunicados globales, por área y por curso.",
        enlace: "notificaciones.html",
        icono: "🔔",
        disponible: true
      },
      {
        titulo: "Marketplace",
        descripcion: "Publicar productos o ver emprendimientos universitarios.",
        enlace: "marketplace.html",
        icono: "🛒",
        disponible: true
      },
      {
        titulo: "Mi perfil",
        descripcion: "Consultar y actualizar mis datos personales.",
        enlace: "perfil.html",
        icono: "👤",
        disponible: true
      },
      {
        titulo: "Mi vehículo",
        descripcion: "Consultar el estado de mi vehículo registrado.",
        enlace: "mi-vehiculo.html",
        icono: "🚗",
        disponible: true
      },
      {
  titulo: "Solicitar registro vehicular",
  descripcion: "Enviar una solicitud para registrar mi vehículo en el campus.",
  enlace: "solicitud-vehiculo.html",
  icono: "📝",
  disponible: true
},
    ];
  }

  if (usuario.rol === "Seguridad") {
    return [
      {
        titulo: "Buscar vehículo",
        descripcion: "Consultar vehículos por placa, DNI, nombre o área.",
        enlace: "vehiculos.html",
        icono: "🚗",
        disponible: true
      },
      {
        titulo: "Notificaciones",
        descripcion: "Ver alertas institucionales y comunicados importantes.",
        enlace: "notificaciones.html",
        icono: "🔔",
        disponible: true
      },
      {
        titulo: "Marketplace",
        descripcion: "Consultar productos y servicios disponibles en campus.",
        enlace: "marketplace.html",
        icono: "🛒",
        disponible: true
      },
      {
        titulo: "Registrar incidencia",
        descripcion: "Reportar sucesos de seguridad o ingreso vehicular.",
        enlace: "",
        icono: "⚠️",
        disponible: false
      },
      {
        titulo: "Vehículos restringidos",
        descripcion: "Ver lista rápida de vehículos no autorizados.",
        enlace: "",
        icono: "⛔",
        disponible: false
      }
    ];
  }

  return [];
}

  welcomeTitle.textContent = "Bienvenido, " + usuario.nombre;

  userInfo.textContent =
    "Rol: " + usuario.rol +
    " | Área: " + usuario.area +
    " | Correo: " + usuario.email;

  roleTitle.textContent = "Panel de " + usuario.rol;

  let opciones = [];

  if (usuario.rol === "Administrador") {
    opciones = [
      {
        titulo: "Gestión de usuarios",
        descripcion: "Registrar, editar y eliminar alumnos, profesores y personal.",
        enlace: "usuarios.html"
      },
      {
        titulo: "Control vehicular",
        descripcion: "Administrar vehículos registrados dentro del campus.",
        enlace: "vehiculos.html"
      },
      {
        titulo: "Reportes generales",
        descripcion: "Generar reportes de alumnos, vehículos y rendimiento.",
        enlace: "reportes.html"
      },
      {
  titulo: "Marketplace",
  descripcion: "Supervisar emprendimientos publicados por estudiantes.",
  enlace: "marketplace.html"
},
      {
        titulo: "Comunicados globales",
        descripcion: "Enviar avisos importantes a toda la universidad.",
        enlace: "notificaciones.html"
      }
    ];
  }

  if (usuario.rol === "Profesor") {
    opciones = [
      {
        titulo: "Asistencia digital",
        descripcion: "Registrar asistencia diaria con firma digital.",
        enlace: "asistencia.html"
      },
      {
        titulo: "Notas y rendimiento",
        descripcion: "Registrar notas y revisar el semáforo académico.",
        enlace: "notas.html"
      },
      {
        titulo: "Comunicados del curso",
        descripcion: "Enviar mensajes a los alumnos inscritos.",
        enlace: "notificaciones.html"
      },
      {
  titulo: "Marketplace",
  descripcion: "Ver productos y servicios disponibles en el campus.",
  enlace: "marketplace.html"
},
      {
        titulo: "Ficha de recuperación",
        descripcion: "Generar fichas para alumnos en riesgo académico.",
        enlace: "#"
      }
    ];
  }

  if (usuario.rol === "Alumno") {
    opciones = [
      
      {
        
        titulo: "Mi perfil",
        descripcion: "Consultar y actualizar datos personales.",
        enlace: "#"
      },
      {
  titulo: "Notificaciones",
  descripcion: "Ver comunicados globales, de área y de curso.",
  enlace: "notificaciones.html"
},

      {
        titulo: "Mi rendimiento",
        descripcion: "Ver notas, asistencia y estado académico.",
        enlace: "notas.html"
      },
      {
        titulo: "Firmar asistencia",
        descripcion: "Validar presencia en clase mediante firma digital.",
        enlace: "asistencia.html"
      },
      {
        titulo: "Marketplace",
        descripcion: "Publicar o ver emprendimientos universitarios.",
        enlace: "marketplace.html"
      }
    ];
  }

  if (usuario.rol === "Seguridad") {
    opciones = [
      {
        titulo: "Buscar vehículo",
        descripcion: "Consultar vehículos por placa, DNI o nombre.",
        enlace: "vehiculos.html"
      },
      {
        titulo: "Ver propietarios",
        descripcion: "Validar datos del usuario y fotografía registrada.",
        enlace: "#"
      },
      {
        titulo: "Registrar incidencia",
        descripcion: "Agregar observaciones de ingreso o seguridad.",
        enlace: "#"
      },
      {
  titulo: "Marketplace",
  descripcion: "Ver productos y servicios disponibles en el campus.",
  enlace: "marketplace.html"
},
      {
        titulo: "Vehículos restringidos",
        descripcion: "Consultar vehículos no autorizados.",
        enlace: "#"
      }
    ];
  }



  menuOptions.innerHTML = "";

  opciones.forEach(function(opcion) {
    const card = document.createElement("div");
    card.className = "menu-card";

    card.innerHTML = `
      <h3>${opcion.titulo}</h3>
      <p>${opcion.descripcion}</p>
    `;

    if (opcion.enlace && opcion.enlace !== "#") {
      card.addEventListener("click", function() {
        window.location.href = opcion.enlace;
      });
    }

    menuOptions.appendChild(card);
  });

// ===============================
// CIERRE AUTOMÁTICO POR INACTIVIDAD
// ===============================

document.addEventListener("DOMContentLoaded", function() {
  iniciarCierrePorInactividad();
});

function iniciarCierrePorInactividad() {
  const usuarioActivo = JSON.parse(sessionStorage.getItem("usuarioActivo"));

  // Si no hay usuario activo, no se activa el temporizador
  if (!usuarioActivo) {
    return;
  }

  // No activar en la pantalla de login
  const estaEnLogin = window.location.pathname.includes("index.html");

  if (estaEnLogin) {
    return;
  }

  const tiempoLimite = 5 * 60 * 1000; 
  let temporizador;

  const eventosActividad = [
    "mousemove",
    "mousedown",
    "keydown",
    "touchstart",
    "scroll",
    "click"
  ];

  function reiniciarTemporizador() {
    clearTimeout(temporizador);

    temporizador = setTimeout(function() {
      cerrarSesionPorInactividad();
    }, tiempoLimite);
  }

  eventosActividad.forEach(function(evento) {
    document.addEventListener(evento, reiniciarTemporizador);
  });

  reiniciarTemporizador();
}

function cerrarSesionPorInactividad() {
  sessionStorage.removeItem("usuarioActivo");

  alert("Tu sesión se cerró automáticamente por 5 minutos de inactividad.");

  window.location.href = "index.html";
}