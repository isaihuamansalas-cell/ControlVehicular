// ===============================
// UNICONNECT - AYUDANTE DE CONFIGURACIÓN
// ===============================

const UC_CONFIG_DEFAULT = {
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

function asegurarConfiguracionSistema() {
  const configGuardada = localStorage.getItem("configuracionSistema");

  if (!configGuardada) {
    localStorage.setItem("configuracionSistema", JSON.stringify(UC_CONFIG_DEFAULT));
    return;
  }

  const config = JSON.parse(configGuardada);

  if (!config.areas) {
    config.areas = UC_CONFIG_DEFAULT.areas;
  }

  if (!config.cursos) {
    config.cursos = UC_CONFIG_DEFAULT.cursos;
  }

  if (!config.notaMinima) {
    config.notaMinima = UC_CONFIG_DEFAULT.notaMinima;
  }

  if (!config.limiteFaltas) {
    config.limiteFaltas = UC_CONFIG_DEFAULT.limiteFaltas;
  }

  if (!config.nombreUniversidad) {
    config.nombreUniversidad = UC_CONFIG_DEFAULT.nombreUniversidad;
  }

  localStorage.setItem("configuracionSistema", JSON.stringify(config));
}

function obtenerConfiguracionSistema() {
  asegurarConfiguracionSistema();

  return JSON.parse(localStorage.getItem("configuracionSistema"));
}

function obtenerAreasSistema() {
  const config = obtenerConfiguracionSistema();

  return config.areas || [];
}

function obtenerCursosSistema() {
  const config = obtenerConfiguracionSistema();

  return config.cursos || [];
}

function obtenerNotaMinimaSistema() {
  const config = obtenerConfiguracionSistema();

  return Number(config.notaMinima || 11);
}

function obtenerLimiteFaltasSistema() {
  const config = obtenerConfiguracionSistema();

  return Number(config.limiteFaltas || 4);
}

function llenarSelectAreas(idSelect, textoInicial = "Seleccione un área", valorSeleccionado = "") {
  const select = document.getElementById(idSelect);

  if (!select) {
    return;
  }

  const areas = obtenerAreasSistema();

  select.innerHTML = "";

  const optionInicial = document.createElement("option");
  optionInicial.value = "";
  optionInicial.textContent = textoInicial;
  select.appendChild(optionInicial);

  areas.forEach(function(area) {
    const option = document.createElement("option");
    option.value = area;
    option.textContent = area;

    if (area === valorSeleccionado) {
      option.selected = true;
    }

    select.appendChild(option);
  });
}

function llenarSelectCursos(idSelect, textoInicial = "Seleccione un curso", valorSeleccionado = "") {
  const select = document.getElementById(idSelect);

  if (!select) {
    return;
  }

  const cursos = obtenerCursosSistema();

  select.innerHTML = "";

  const optionInicial = document.createElement("option");
  optionInicial.value = "";
  optionInicial.textContent = textoInicial;
  select.appendChild(optionInicial);

  cursos.forEach(function(curso) {
    const option = document.createElement("option");
    option.value = curso.nombre;
    option.textContent = curso.nombre + " - " + curso.area;

    if (curso.nombre === valorSeleccionado) {
      option.selected = true;
    }

    select.appendChild(option);
  });
}

function llenarSelectCursosPorArea(idSelect, area, textoInicial = "Seleccione un curso", valorSeleccionado = "") {
  const select = document.getElementById(idSelect);

  if (!select) {
    return;
  }

  const cursos = obtenerCursosSistema();

  const cursosFiltrados = cursos.filter(function(curso) {
    return area === "" || curso.area === area;
  });

  select.innerHTML = "";

  const optionInicial = document.createElement("option");
  optionInicial.value = "";
  optionInicial.textContent = textoInicial;
  select.appendChild(optionInicial);

  cursosFiltrados.forEach(function(curso) {
    const option = document.createElement("option");
    option.value = curso.nombre;
    option.textContent = curso.nombre + " - " + curso.area;

    if (curso.nombre === valorSeleccionado) {
      option.selected = true;
    }

    select.appendChild(option);
  });
}

document.addEventListener("DOMContentLoaded", function() {
  asegurarConfiguracionSistema();
});