// ===============================
// UNICONNECT - REPORTES EJECUTIVOS
// ===============================

document.addEventListener("DOMContentLoaded", function() {
  const usuarioActivo = JSON.parse(sessionStorage.getItem("usuarioActivo"));

  if (!usuarioActivo) {
    window.location.href = "index.html";
    return;
  }

  if (usuarioActivo.rol !== "Administrador") {
    alert("Solo el administrador puede ingresar al módulo de reportes.");
    window.location.href = "dashboard.html";
    return;
  }

  const backBtn = document.getElementById("backBtn");
  const previewReportBtn = document.getElementById("previewReportBtn");
  const exportReportBtn = document.getElementById("exportReportBtn");
  const tipoReporte = document.getElementById("tipoReporte");
  const filtroReporte = document.getElementById("filtroReporte");

  if (backBtn) {
    backBtn.addEventListener("click", function() {
      window.location.href = "dashboard.html";
    });
  }

  if (previewReportBtn) {
    previewReportBtn.addEventListener("click", function() {
      generarVistaPrevia();
    });
  }

  if (exportReportBtn) {
    exportReportBtn.addEventListener("click", function() {
      exportarCSV();
    });
  }

  if (tipoReporte) {
    tipoReporte.addEventListener("change", function() {
      generarVistaPrevia();
    });
  }

  if (filtroReporte) {
    filtroReporte.addEventListener("input", function() {
      generarVistaPrevia();
    });
  }

  actualizarResumenGeneral();
  generarVistaPrevia();
});

function actualizarResumenGeneral() {
  const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
  const vehiculos = JSON.parse(localStorage.getItem("vehiculos")) || [];
  const asistencias = JSON.parse(localStorage.getItem("asistencias")) || [];
  const notas = JSON.parse(localStorage.getItem("notas")) || [];
  const productos = JSON.parse(localStorage.getItem("productosMarketplace")) || [];

  const alumnosRiesgo = notas.filter(function(nota) {
    return nota.estadoAcademico === "Crítico / Jalado";
  });

  document.getElementById("totalUsuarios").textContent = usuarios.length;
  document.getElementById("totalVehiculos").textContent = vehiculos.length;
  document.getElementById("totalAsistencias").textContent = asistencias.length;
  document.getElementById("totalRiesgo").textContent = alumnosRiesgo.length;
  document.getElementById("totalProductos").textContent = productos.length;
}

function generarVistaPrevia() {
  const tipo = document.getElementById("tipoReporte").value;
  const filtro = document.getElementById("filtroReporte").value.toLowerCase();

  const reporte = obtenerDatosReporte(tipo, filtro);

  pintarTabla(reporte.encabezados, reporte.filas);

  mostrarMensajeReporte("Vista previa actualizada.", "success");
}

function obtenerDatosReporte(tipo, filtro) {
  if (tipo === "usuarios") {
    return reporteUsuarios(filtro);
  }

  if (tipo === "vehiculos") {
    return reporteVehiculos(filtro);
  }

  if (tipo === "asistencias") {
    return reporteAsistencias(filtro);
  }

  if (tipo === "notas") {
    return reporteNotas(filtro, false);
  }

  if (tipo === "riesgo") {
    return reporteNotas(filtro, true);
  }

  if (tipo === "marketplace") {
    return reporteMarketplace(filtro);
  }

  return {
    encabezados: [],
    filas: []
  };
}

function reporteUsuarios(filtro) {
  const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];

  const usuariosFiltrados = usuarios.filter(function(usuario) {
    return (
      String(usuario.nombre || "").toLowerCase().includes(filtro) ||
      String(usuario.dni || "").toLowerCase().includes(filtro) ||
      String(usuario.email || "").toLowerCase().includes(filtro) ||
      String(usuario.rol || "").toLowerCase().includes(filtro) ||
      String(usuario.area || "").toLowerCase().includes(filtro) ||
      String(usuario.aula || "").toLowerCase().includes(filtro)
    );
  });

  return {
    encabezados: ["ID", "Nombre", "DNI", "Correo", "Rol", "Área", "Aula/Curso", "Estado"],
    filas: usuariosFiltrados.map(function(usuario) {
      return [
        usuario.id || "",
        usuario.nombre || "",
        usuario.dni || "",
        usuario.email || "",
        usuario.rol || "",
        usuario.area || "",
        usuario.aula || "",
        usuario.estado || ""
      ];
    })
  };
}

function reporteVehiculos(filtro) {
  const vehiculos = JSON.parse(localStorage.getItem("vehiculos")) || [];

  const vehiculosFiltrados = vehiculos.filter(function(vehiculo) {
    return (
      String(vehiculo.nombrePropietario || "").toLowerCase().includes(filtro) ||
      String(vehiculo.dniPropietario || "").toLowerCase().includes(filtro) ||
      String(vehiculo.areaPropietario || "").toLowerCase().includes(filtro) ||
      String(vehiculo.placa || "").toLowerCase().includes(filtro) ||
      String(vehiculo.marca || "").toLowerCase().includes(filtro) ||
      String(vehiculo.modelo || "").toLowerCase().includes(filtro) ||
      String(vehiculo.color || "").toLowerCase().includes(filtro) ||
      String(vehiculo.estadoVehiculo || "").toLowerCase().includes(filtro)
    );
  });

  return {
    encabezados: [
      "ID",
      "Propietario",
      "DNI",
      "Área",
      "Placa",
      "Marca",
      "Modelo",
      "Color",
      "Tipo",
      "Estado",
      "Observaciones",
      "Fecha registro"
    ],
    filas: vehiculosFiltrados.map(function(vehiculo) {
      return [
        vehiculo.id || "",
        vehiculo.nombrePropietario || "",
        vehiculo.dniPropietario || "",
        vehiculo.areaPropietario || "",
        vehiculo.placa || "",
        vehiculo.marca || "",
        vehiculo.modelo || "",
        vehiculo.color || "",
        vehiculo.tipoVehiculo || "",
        vehiculo.estadoVehiculo || "",
        vehiculo.observacionesVehiculo || "",
        vehiculo.fechaRegistro || ""
      ];
    })
  };
}

function reporteAsistencias(filtro) {
  const asistencias = JSON.parse(localStorage.getItem("asistencias")) || [];

  const asistenciasFiltradas = asistencias.filter(function(asistencia) {
    return (
      String(asistencia.fecha || "").toLowerCase().includes(filtro) ||
      String(asistencia.curso || "").toLowerCase().includes(filtro) ||
      String(asistencia.nombreAlumno || "").toLowerCase().includes(filtro) ||
      String(asistencia.dniAlumno || "").toLowerCase().includes(filtro) ||
      String(asistencia.areaAlumno || "").toLowerCase().includes(filtro) ||
      String(asistencia.estado || "").toLowerCase().includes(filtro) ||
      String(asistencia.profesor || "").toLowerCase().includes(filtro)
    );
  });

  return {
    encabezados: [
      "ID",
      "Fecha",
      "Curso",
      "Alumno",
      "DNI",
      "Área",
      "Estado",
      "Profesor",
      "Observación",
      "Fecha registro"
    ],
    filas: asistenciasFiltradas.map(function(asistencia) {
      return [
        asistencia.id || "",
        asistencia.fecha || "",
        asistencia.curso || "",
        asistencia.nombreAlumno || "",
        asistencia.dniAlumno || "",
        asistencia.areaAlumno || "",
        asistencia.estado || "",
        asistencia.profesor || "",
        asistencia.observacion || "",
        asistencia.fechaRegistro || ""
      ];
    })
  };
}

function reporteNotas(filtro, soloRiesgo) {
  const notas = JSON.parse(localStorage.getItem("notas")) || [];

  let notasFiltradas = notas.filter(function(nota) {
    return (
      String(nota.nombreAlumno || "").toLowerCase().includes(filtro) ||
      String(nota.dniAlumno || "").toLowerCase().includes(filtro) ||
      String(nota.areaAlumno || "").toLowerCase().includes(filtro) ||
      String(nota.curso || "").toLowerCase().includes(filtro) ||
      String(nota.estadoAcademico || "").toLowerCase().includes(filtro) ||
      String(nota.profesor || "").toLowerCase().includes(filtro)
    );
  });

  if (soloRiesgo) {
    notasFiltradas = notasFiltradas.filter(function(nota) {
      return nota.estadoAcademico === "Crítico / Jalado";
    });
  }

  return {
    encabezados: [
      "ID",
      "Alumno",
      "DNI",
      "Área",
      "Curso",
      "Nota 1",
      "Nota 2",
      "Nota 3",
      "Promedio",
      "Nota mínima",
      "Faltas",
      "Estado académico",
      "Profesor",
      "Observación",
      "Fecha registro"
    ],
    filas: notasFiltradas.map(function(nota) {
      return [
        nota.id || "",
        nota.nombreAlumno || "",
        nota.dniAlumno || "",
        nota.areaAlumno || "",
        nota.curso || "",
        nota.nota1 || "",
        nota.nota2 || "",
        nota.nota3 || "",
        nota.promedio || "",
        nota.notaMinima || "",
        nota.faltas || "",
        nota.estadoAcademico || "",
        nota.profesor || "",
        nota.observacion || "",
        nota.fechaRegistro || ""
      ];
    })
  };
}

function reporteMarketplace(filtro) {
  const productos = JSON.parse(localStorage.getItem("productosMarketplace")) || [];

  const productosFiltrados = productos.filter(function(producto) {
    return (
      String(producto.nombreProducto || "").toLowerCase().includes(filtro) ||
      String(producto.categoriaProducto || "").toLowerCase().includes(filtro) ||
      String(producto.estadoTienda || "").toLowerCase().includes(filtro) ||
      String(producto.vendedorNombre || "").toLowerCase().includes(filtro) ||
      String(producto.vendedorArea || "").toLowerCase().includes(filtro) ||
      String(producto.ubicacionProducto || "").toLowerCase().includes(filtro)
    );
  });

  return {
    encabezados: [
      "ID",
      "Producto",
      "Precio",
      "Categoría",
      "Estado tienda",
      "Vendedor",
      "Área vendedor",
      "WhatsApp",
      "Ubicación",
      "Descripción",
      "Fecha publicación"
    ],
    filas: productosFiltrados.map(function(producto) {
      return [
        producto.id || "",
        producto.nombreProducto || "",
        producto.precioProducto || "",
        producto.categoriaProducto || "",
        producto.estadoTienda || "",
        producto.vendedorNombre || "",
        producto.vendedorArea || "",
        producto.whatsappProducto || "",
        producto.ubicacionProducto || "",
        producto.descripcionProducto || "",
        producto.fechaPublicacion || ""
      ];
    })
  };
}

function pintarTabla(encabezados, filas) {
  const reportTableHead = document.getElementById("reportTableHead");
  const reportTableBody = document.getElementById("reportTableBody");

  reportTableHead.innerHTML = "";
  reportTableBody.innerHTML = "";

  if (encabezados.length === 0) {
    reportTableBody.innerHTML = `
      <tr>
        <td>No hay datos para mostrar.</td>
      </tr>
    `;
    return;
  }

  const filaEncabezado = document.createElement("tr");

  encabezados.forEach(function(encabezado) {
    const th = document.createElement("th");
    th.textContent = encabezado;
    filaEncabezado.appendChild(th);
  });

  reportTableHead.appendChild(filaEncabezado);

  if (filas.length === 0) {
    const filaVacia = document.createElement("tr");
    const celda = document.createElement("td");

    celda.colSpan = encabezados.length;
    celda.textContent = "No se encontraron datos para este reporte.";

    filaVacia.appendChild(celda);
    reportTableBody.appendChild(filaVacia);
    return;
  }

  filas.forEach(function(fila) {
    const tr = document.createElement("tr");

    fila.forEach(function(valor) {
      const td = document.createElement("td");
      td.textContent = valor;
      tr.appendChild(td);
    });

    reportTableBody.appendChild(tr);
  });
}

function exportarCSV() {
  const tipo = document.getElementById("tipoReporte").value;
  const filtro = document.getElementById("filtroReporte").value.toLowerCase();

  const reporte = obtenerDatosReporte(tipo, filtro);

  if (reporte.filas.length === 0) {
    mostrarMensajeReporte("No hay datos para exportar.", "error");
    return;
  }

  const csv = convertirAFormatoCSV(reporte.encabezados, reporte.filas);

  descargarArchivoCSV(csv, "reporte_" + tipo + ".csv");

  mostrarMensajeReporte("Reporte exportado correctamente.", "success");
}

function convertirAFormatoCSV(encabezados, filas) {
  let contenido = "";

  contenido += encabezados.map(escaparCSV).join(",") + "\n";

  filas.forEach(function(fila) {
    contenido += fila.map(escaparCSV).join(",") + "\n";
  });

  return contenido;
}

function escaparCSV(valor) {
  const texto = String(valor || "");

  const textoEscapado = texto.replace(/"/g, '""');

  return '"' + textoEscapado + '"';
}

function descargarArchivoCSV(contenido, nombreArchivo) {
  const BOM = "\uFEFF";
  const blob = new Blob([BOM + contenido], {
    type: "text/csv;charset=utf-8;"
  });

  const url = URL.createObjectURL(blob);

  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = nombreArchivo;

  document.body.appendChild(enlace);
  enlace.click();
  document.body.removeChild(enlace);

  URL.revokeObjectURL(url);
}

function mostrarMensajeReporte(texto, tipo) {
  const reportMessage = document.getElementById("reportMessage");

  if (!reportMessage) {
    return;
  }

  reportMessage.textContent = texto;
  reportMessage.className = "message " + tipo;

  setTimeout(function() {
    reportMessage.textContent = "";
    reportMessage.className = "message";
  }, 2500);
}