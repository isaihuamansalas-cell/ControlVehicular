// ===============================
// UNICONNECT - NOTAS Y RENDIMIENTO
// ===============================

document.addEventListener("DOMContentLoaded", function() {
  const usuarioActivo = JSON.parse(sessionStorage.getItem("usuarioActivo"));

  if (!usuarioActivo) {
    window.location.href = "index.html";
    return;
  }

  if (
    usuarioActivo.rol !== "Profesor" &&
    usuarioActivo.rol !== "Alumno" &&
    usuarioActivo.rol !== "Administrador"
  ) {
    alert("No tienes permiso para ingresar a este módulo.");
    window.location.href = "dashboard.html";
    return;
  }

  const backBtn = document.getElementById("backBtn");
  const gradesForm = document.getElementById("gradesForm");
  const gradesFormSection = document.getElementById("gradesFormSection");
  const dniAlumnoNota = document.getElementById("dniAlumnoNota");
  const searchGrades = document.getElementById("searchGrades");
  llenarSelectCursos("cursoNota", "Seleccione un curso");
cargarNotaMinimaConfigurada();

  if (backBtn) {
    backBtn.addEventListener("click", function() {
      window.location.href = "dashboard.html";
    });
  }

  // El alumno solo puede ver sus notas, no registrar.
  if (usuarioActivo.rol === "Alumno" && gradesFormSection) {
    gradesFormSection.classList.add("hidden");
  }

  if (gradesForm) {
    gradesForm.addEventListener("submit", function(event) {
      event.preventDefault();
      registrarNotas();
    });
  }

  if (dniAlumnoNota) {
    dniAlumnoNota.addEventListener("blur", function() {
      autocompletarAlumnoNota();
    });
  }

  if (searchGrades) {
    searchGrades.addEventListener("input", function() {
      cargarNotas(searchGrades.value);
    });
  }

  cargarNotas();
});

function autocompletarAlumnoNota() {
  const dni = document.getElementById("dniAlumnoNota").value.trim();

  if (dni.length !== 8) {
    return;
  }

  const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];

  const alumno = usuarios.find(function(usuario) {
    return String(usuario.dni) === dni && usuario.rol === "Alumno";
  });

  if (alumno) {
    document.getElementById("nombreAlumnoNota").value = alumno.nombre || "";
    document.getElementById("areaAlumnoNota").value = alumno.area || "";
  } else {
    mostrarMensajeNotas("No existe un alumno registrado con ese DNI.", "error");
  }
}

function registrarNotas() {
  const dniAlumno = document.getElementById("dniAlumnoNota").value.trim();
  const nombreAlumno = document.getElementById("nombreAlumnoNota").value.trim();
  const areaAlumno = document.getElementById("areaAlumnoNota").value.trim();
  const curso = document.getElementById("cursoNota").value.trim();

  const nota1 = Number(document.getElementById("nota1").value);
  const nota2 = Number(document.getElementById("nota2").value);
  const nota3 = Number(document.getElementById("nota3").value);
  const notaMinima = Number(document.getElementById("notaMinima").value);

  const observacion = document.getElementById("observacionNota").value.trim();

  if (dniAlumno.length !== 8) {
    mostrarMensajeNotas("El DNI debe tener 8 dígitos.", "error");
    return;
  }

  if (!validarNota(nota1) || !validarNota(nota2) || !validarNota(nota3)) {
    mostrarMensajeNotas("Las notas deben estar entre 0 y 20.", "error");
    return;
  }

  if (!validarNota(notaMinima)) {
    mostrarMensajeNotas("La nota mínima debe estar entre 0 y 20.", "error");
    return;
  }

  const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];

  const alumnoExiste = usuarios.some(function(usuario) {
    return String(usuario.dni) === dniAlumno && usuario.rol === "Alumno";
  });

  if (!alumnoExiste) {
    mostrarMensajeNotas("Primero debes registrar al alumno en Gestión de usuarios.", "error");
    return;
  }

  const promedio = calcularPromedio(nota1, nota2, nota3);
  const faltas = contarFaltasAlumno(dniAlumno, curso);
  const estadoAcademico = calcularEstadoAcademico(promedio, notaMinima, faltas);

  guardarNotas(
    dniAlumno,
    nombreAlumno,
    areaAlumno,
    curso,
    nota1,
    nota2,
    nota3,
    promedio,
    notaMinima,
    faltas,
    estadoAcademico,
    observacion
  );
}

function validarNota(nota) {
  return !isNaN(nota) && nota >= 0 && nota <= 20;
}

function calcularPromedio(nota1, nota2, nota3) {
  const promedio = (nota1 + nota2 + nota3) / 3;
  return Number(promedio.toFixed(2));
}

function contarFaltasAlumno(dniAlumno, curso) {
  const asistencias = JSON.parse(localStorage.getItem("asistencias")) || [];

  const faltas = asistencias.filter(function(asistencia) {
    return (
      String(asistencia.dniAlumno) === String(dniAlumno) &&
      String(asistencia.curso || "").toLowerCase() === String(curso || "").toLowerCase() &&
      asistencia.estado === "Falta"
    );
  });

  return faltas.length;
}

function calcularEstadoAcademico(promedio, notaMinima, faltas) {
  const limiteFaltas = obtenerLimiteFaltasSistema();

  const faltasAdvertencia = limiteFaltas - 1;

  if (promedio < notaMinima || faltas >= limiteFaltas) {
    return "Crítico / Jalado";
  }

  if ((promedio >= notaMinima && promedio <= 13) || faltas === faltasAdvertencia) {
    return "Advertencia";
  }

  return "Aprobado";
}

function guardarNotas(
  dniAlumno,
  nombreAlumno,
  areaAlumno,
  curso,
  nota1,
  nota2,
  nota3,
  promedio,
  notaMinima,
  faltas,
  estadoAcademico,
  observacion
) {
  const usuarioActivo = JSON.parse(sessionStorage.getItem("usuarioActivo"));
  let notas = JSON.parse(localStorage.getItem("notas")) || [];

  const registroNota = {
    id: Date.now(),
    dniAlumno: dniAlumno,
    nombreAlumno: nombreAlumno,
    areaAlumno: areaAlumno,
    curso: curso,
    nota1: nota1,
    nota2: nota2,
    nota3: nota3,
    promedio: promedio,
    notaMinima: notaMinima,
    faltas: faltas,
    estadoAcademico: estadoAcademico,
    observacion: observacion,
    profesor: usuarioActivo.nombre,
    fechaRegistro: new Date().toLocaleString()
  };

  notas.push(registroNota);

  localStorage.setItem("notas", JSON.stringify(notas));

  document.getElementById("gradesForm").reset();

  document.getElementById("notaMinima").value = obtenerNotaMinimaSistema();

  mostrarMensajeNotas("Notas registradas correctamente.", "success");

  cargarNotas();
}

function cargarNotas(filtro = "") {
  const gradesTableBody = document.getElementById("gradesTableBody");

  if (!gradesTableBody) {
    return;
  }

  const usuarioActivo = JSON.parse(sessionStorage.getItem("usuarioActivo"));
  const notas = JSON.parse(localStorage.getItem("notas")) || [];
  const textoFiltro = filtro.toLowerCase();

  let notasVisibles = notas;

  if (usuarioActivo && usuarioActivo.rol === "Alumno") {
    notasVisibles = notas.filter(function(nota) {
      return String(nota.dniAlumno) === String(usuarioActivo.dni);
    });
  }

  const notasFiltradas = notasVisibles.filter(function(nota) {
    return (
      String(nota.nombreAlumno || "").toLowerCase().includes(textoFiltro) ||
      String(nota.dniAlumno || "").toLowerCase().includes(textoFiltro) ||
      String(nota.areaAlumno || "").toLowerCase().includes(textoFiltro) ||
      String(nota.curso || "").toLowerCase().includes(textoFiltro) ||
      String(nota.estadoAcademico || "").toLowerCase().includes(textoFiltro)
    );
  });

  gradesTableBody.innerHTML = "";

  if (notasFiltradas.length === 0) {
    gradesTableBody.innerHTML = `
      <tr>
        <td colspan="12">No se encontraron registros académicos.</td>
      </tr>
    `;
    return;
  }

  notasFiltradas.forEach(function(nota) {
    const fila = document.createElement("tr");

    const claseEstado = obtenerClaseEstadoAcademico(nota.estadoAcademico);

    let accionHTML = "Solo lectura";

    if (
      usuarioActivo &&
      (usuarioActivo.rol === "Profesor" || usuarioActivo.rol === "Administrador")
    ) {
      accionHTML = `
        <button class="delete-btn" onclick="eliminarNota(${nota.id})">
          Eliminar
        </button>
      `;
    }

    if (
      usuarioActivo &&
      (usuarioActivo.rol === "Profesor" || usuarioActivo.rol === "Administrador") &&
      nota.estadoAcademico === "Crítico / Jalado"
    ) {
      accionHTML = `
        <button class="recovery-btn" onclick="generarFichaRecuperacion(${nota.id})">
          Ficha
        </button>
        <button class="delete-btn" onclick="eliminarNota(${nota.id})">
          Eliminar
        </button>
      `;
    }

    fila.innerHTML = `
      <td>${nota.nombreAlumno || "Sin alumno"}</td>
      <td>${nota.dniAlumno || "Sin DNI"}</td>
      <td>${nota.areaAlumno || "Sin área"}</td>
      <td>${nota.curso || "Sin curso"}</td>
      <td>${nota.nota1}</td>
      <td>${nota.nota2}</td>
      <td>${nota.nota3}</td>
      <td><span class="grade-average">${nota.promedio}</span></td>
      <td>${nota.faltas}</td>
      <td>
        <span class="academic-badge ${claseEstado}">
          ${nota.estadoAcademico}
        </span>
      </td>
      <td>${nota.observacion || "Sin observación"}</td>
      <td>${accionHTML}</td>
    `;

    gradesTableBody.appendChild(fila);
  });
}

function eliminarNota(id) {
  const confirmar = confirm("¿Seguro que deseas eliminar este registro de notas?");

  if (!confirmar) {
    return;
  }

  let notas = JSON.parse(localStorage.getItem("notas")) || [];

  notas = notas.filter(function(nota) {
    return nota.id !== id;
  });

  localStorage.setItem("notas", JSON.stringify(notas));

  cargarNotas();

  mostrarMensajeNotas("Registro eliminado correctamente.", "success");
}

function generarFichaRecuperacion(id) {
  const notas = JSON.parse(localStorage.getItem("notas")) || [];

  const nota = notas.find(function(item) {
    return item.id === id;
  });

  if (!nota) {
    alert("No se encontró el registro académico.");
    return;
  }

  const contenidoFicha =
    "FICHA DE EXAMEN DE RECUPERACIÓN\n\n" +
    "Alumno: " + nota.nombreAlumno + "\n" +
    "DNI: " + nota.dniAlumno + "\n" +
    "Área: " + nota.areaAlumno + "\n" +
    "Curso: " + nota.curso + "\n" +
    "Promedio actual: " + nota.promedio + "\n" +
    "Faltas registradas: " + nota.faltas + "\n" +
    "Estado: " + nota.estadoAcademico + "\n" +
    "Docente: " + nota.profesor + "\n" +
    "Observación: " + (nota.observacion || "Sin observación") + "\n\n" +
    "Motivo: Alumno en estado crítico o jalado. Requiere evaluación de recuperación.";

  alert(contenidoFicha);
}

function obtenerClaseEstadoAcademico(estado) {
  if (estado === "Aprobado") {
    return "academic-aprobado";
  }

  if (estado === "Advertencia") {
    return "academic-advertencia";
  }

  if (estado === "Crítico / Jalado") {
    return "academic-critico";
  }

  return "";
}

function mostrarMensajeNotas(texto, tipo) {
  const gradesMessage = document.getElementById("gradesMessage");

  if (!gradesMessage) {
    alert(texto);
    return;
  }

  gradesMessage.textContent = texto;
  gradesMessage.className = "message " + tipo;

  setTimeout(function() {
    gradesMessage.textContent = "";
    gradesMessage.className = "message";
  }, 3000);
}
function cargarNotaMinimaConfigurada() {
  const notaMinimaInput = document.getElementById("notaMinima");

  if (!notaMinimaInput) {
    return;
  }

  notaMinimaInput.value = obtenerNotaMinimaSistema();
}