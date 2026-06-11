// ===============================
// UNICONNECT - CONFIGURACIÓN
// ===============================

const configuracionInicial = {
  nombreUniversidad: "Universidad UniConnect",
  colorInstitucional: "#1e3a8a",
  notaMinima: 11,
  limiteFaltas: 4,
  areas: [
    "Administración",
    "Ingenierías",
    "Ciencias de la Salud",
    "Humanidades",
    "Ciencias Empresariales",
    "Educación",
    "Seguridad Universitaria"
  ],
  cursos: [
    {
      id: 1,
      nombre: "Programación I",
      area: "Ingenierías"
    },
    {
      id: 2,
      nombre: "Enfermería I",
      area: "Ciencias de la Salud"
    },
    {
      id: 3,
      nombre: "Matemática I",
      area: "Ingenierías"
    }
  ]
};

document.addEventListener("DOMContentLoaded", function() {
  const usuarioActivo = JSON.parse(sessionStorage.getItem("usuarioActivo"));

  if (!usuarioActivo) {
    window.location.href = "index.html";
    return;
  }

  if (usuarioActivo.rol !== "Administrador") {
    alert("Solo el administrador puede ingresar a configuración.");
    window.location.href = "dashboard.html";
    return;
  }

  const backBtn = document.getElementById("backBtn");
  const generalConfigForm = document.getElementById("generalConfigForm");
  const areaForm = document.getElementById("areaForm");
  const courseForm = document.getElementById("courseForm");

  if (backBtn) {
    backBtn.addEventListener("click", function() {
      window.location.href = "dashboard.html";
    });
  }

  crearConfiguracionInicial();

  cargarConfiguracionGeneral();
  cargarAreas();
  cargarCursos();
  cargarResumenConfiguracion();

  if (generalConfigForm) {
    generalConfigForm.addEventListener("submit", function(event) {
      event.preventDefault();
      guardarConfiguracionGeneral();
    });
  }

  if (areaForm) {
    areaForm.addEventListener("submit", function(event) {
      event.preventDefault();
      agregarArea();
    });
  }

  if (courseForm) {
    courseForm.addEventListener("submit", function(event) {
      event.preventDefault();
      agregarCurso();
    });
  }
});

function crearConfiguracionInicial() {
  if (!localStorage.getItem("configuracionSistema")) {
    localStorage.setItem("configuracionSistema", JSON.stringify(configuracionInicial));
  }
}

function obtenerConfiguracion() {
  return JSON.parse(localStorage.getItem("configuracionSistema")) || configuracionInicial;
}

function guardarConfiguracion(configuracion) {
  localStorage.setItem("configuracionSistema", JSON.stringify(configuracion));
}

function cargarConfiguracionGeneral() {
  const config = obtenerConfiguracion();

  document.getElementById("nombreUniversidad").value = config.nombreUniversidad || "";
  document.getElementById("colorInstitucional").value = config.colorInstitucional || "#1e3a8a";
  document.getElementById("notaMinimaConfig").value = config.notaMinima || 11;
  document.getElementById("limiteFaltasConfig").value = config.limiteFaltas || 4;
}

function guardarConfiguracionGeneral() {
  const config = obtenerConfiguracion();

  const nombreUniversidad = document.getElementById("nombreUniversidad").value.trim();
  const colorInstitucional = document.getElementById("colorInstitucional").value;
  const notaMinima = Number(document.getElementById("notaMinimaConfig").value);
  const limiteFaltas = Number(document.getElementById("limiteFaltasConfig").value);

  if (nombreUniversidad === "") {
    mostrarMensaje("generalConfigMessage", "El nombre de la universidad es obligatorio.", "error");
    return;
  }

  if (isNaN(notaMinima) || notaMinima < 0 || notaMinima > 20) {
    mostrarMensaje("generalConfigMessage", "La nota mínima debe estar entre 0 y 20.", "error");
    return;
  }

  if (isNaN(limiteFaltas) || limiteFaltas < 1) {
    mostrarMensaje("generalConfigMessage", "El límite de faltas debe ser mayor a 0.", "error");
    return;
  }

  config.nombreUniversidad = nombreUniversidad;
  config.colorInstitucional = colorInstitucional;
  config.notaMinima = notaMinima;
  config.limiteFaltas = limiteFaltas;

  guardarConfiguracion(config);

  mostrarMensaje("generalConfigMessage", "Configuración general guardada correctamente.", "success");

  cargarResumenConfiguracion();
}

function cargarAreas() {
  const config = obtenerConfiguracion();
  const areasList = document.getElementById("areasList");
  const areaCurso = document.getElementById("areaCurso");

  areasList.innerHTML = "";
  areaCurso.innerHTML = "";

  if (!config.areas || config.areas.length === 0) {
    areasList.innerHTML = "<p>No hay áreas registradas.</p>";
    return;
  }

  config.areas.forEach(function(area) {
    const item = document.createElement("div");
    item.className = "config-item";

    item.innerHTML = `
      <strong>${area}</strong>
      <button class="delete-btn small-btn" onclick="eliminarArea('${area}')">
        Eliminar
      </button>
    `;

    areasList.appendChild(item);

    const option = document.createElement("option");
    option.value = area;
    option.textContent = area;

    areaCurso.appendChild(option);
  });
}

function agregarArea() {
  const nombreAreaInput = document.getElementById("nombreArea");
  const nuevaArea = nombreAreaInput.value.trim();

  if (nuevaArea === "") {
    mostrarMensaje("areaMessage", "Escribe el nombre del área.", "error");
    return;
  }

  const config = obtenerConfiguracion();

  const existeArea = config.areas.some(function(area) {
    return area.toLowerCase() === nuevaArea.toLowerCase();
  });

  if (existeArea) {
    mostrarMensaje("areaMessage", "Esa área ya existe.", "error");
    return;
  }

  config.areas.push(nuevaArea);

  guardarConfiguracion(config);

  nombreAreaInput.value = "";

  cargarAreas();
  cargarResumenConfiguracion();

  mostrarMensaje("areaMessage", "Área agregada correctamente.", "success");
}

function eliminarArea(nombreArea) {
  const confirmar = confirm("¿Seguro que deseas eliminar esta área? Los cursos de esta área también se eliminarán.");

  if (!confirmar) {
    return;
  }

  const config = obtenerConfiguracion();

  config.areas = config.areas.filter(function(area) {
    return area !== nombreArea;
  });

  config.cursos = config.cursos.filter(function(curso) {
    return curso.area !== nombreArea;
  });

  guardarConfiguracion(config);

  cargarAreas();
  cargarCursos();
  cargarResumenConfiguracion();

  mostrarMensaje("areaMessage", "Área eliminada correctamente.", "success");
}

function cargarCursos() {
  const config = obtenerConfiguracion();
  const coursesTableBody = document.getElementById("coursesTableBody");

  coursesTableBody.innerHTML = "";

  if (!config.cursos || config.cursos.length === 0) {
    coursesTableBody.innerHTML = `
      <tr>
        <td colspan="3">No hay cursos registrados.</td>
      </tr>
    `;
    return;
  }

  config.cursos.forEach(function(curso) {
    const fila = document.createElement("tr");

    fila.innerHTML = `
      <td>${curso.nombre}</td>
      <td>${curso.area}</td>
      <td>
        <button class="delete-btn small-btn" onclick="eliminarCurso(${curso.id})">
          Eliminar
        </button>
      </td>
    `;

    coursesTableBody.appendChild(fila);
  });
}

function agregarCurso() {
  const nombreCursoInput = document.getElementById("nombreCurso");
  const areaCurso = document.getElementById("areaCurso").value;

  const nombreCurso = nombreCursoInput.value.trim();

  if (nombreCurso === "" || areaCurso === "") {
    mostrarMensaje("courseMessage", "Completa el nombre del curso y el área.", "error");
    return;
  }

  const config = obtenerConfiguracion();

  const existeCurso = config.cursos.some(function(curso) {
    return (
      curso.nombre.toLowerCase() === nombreCurso.toLowerCase() &&
      curso.area === areaCurso
    );
  });

  if (existeCurso) {
    mostrarMensaje("courseMessage", "Ese curso ya existe en esa área.", "error");
    return;
  }

  const nuevoCurso = {
    id: Date.now(),
    nombre: nombreCurso,
    area: areaCurso
  };

  config.cursos.push(nuevoCurso);

  guardarConfiguracion(config);

  nombreCursoInput.value = "";

  cargarCursos();
  cargarResumenConfiguracion();

  mostrarMensaje("courseMessage", "Curso agregado correctamente.", "success");
}

function eliminarCurso(idCurso) {
  const confirmar = confirm("¿Seguro que deseas eliminar este curso?");

  if (!confirmar) {
    return;
  }

  const config = obtenerConfiguracion();

  config.cursos = config.cursos.filter(function(curso) {
    return curso.id !== idCurso;
  });

  guardarConfiguracion(config);

  cargarCursos();
  cargarResumenConfiguracion();

  mostrarMensaje("courseMessage", "Curso eliminado correctamente.", "success");
}

function cargarResumenConfiguracion() {
  const config = obtenerConfiguracion();

  document.getElementById("previewUniversity").textContent = config.nombreUniversidad || "-";
  document.getElementById("previewGrade").textContent = config.notaMinima;
  document.getElementById("previewAbsences").textContent = config.limiteFaltas;
  document.getElementById("previewAreas").textContent = config.areas.length;
  document.getElementById("previewCourses").textContent = config.cursos.length;
}

function mostrarMensaje(idElemento, texto, tipo) {
  const elemento = document.getElementById(idElemento);

  if (!elemento) {
    alert(texto);
    return;
  }

  elemento.textContent = texto;
  elemento.className = "message " + tipo;

  setTimeout(function() {
    elemento.textContent = "";
    elemento.className = "message";
  }, 3000);
}