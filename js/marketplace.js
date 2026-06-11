// ===============================
// UNICONNECT - MARKETPLACE
// ===============================

document.addEventListener("DOMContentLoaded", function() {
  const usuarioActivo = JSON.parse(sessionStorage.getItem("usuarioActivo"));

  if (!usuarioActivo) {
    window.location.href = "index.html";
    return;
  }

  const backBtn = document.getElementById("backBtn");
  const marketForm = document.getElementById("marketForm");
  const marketFormSection = document.getElementById("marketFormSection");
  const searchMarket = document.getElementById("searchMarket");
  const filterCategory = document.getElementById("filterCategory");
  const filterStatus = document.getElementById("filterStatus");

  if (backBtn) {
    backBtn.addEventListener("click", function() {
      window.location.href = "dashboard.html";
    });
  }

  // Solo alumnos y administradores pueden publicar.
  // Profesores y seguridad solo visualizan.
  if (
    usuarioActivo.rol !== "Alumno" &&
    usuarioActivo.rol !== "Administrador"
  ) {
    if (marketFormSection) {
      marketFormSection.classList.add("hidden");
    }
  }

  if (marketForm) {
    marketForm.addEventListener("submit", function(event) {
      event.preventDefault();
      registrarProducto();
    });
  }

  if (searchMarket) {
    searchMarket.addEventListener("input", aplicarFiltrosMarketplace);
  }

  if (filterCategory) {
    filterCategory.addEventListener("change", aplicarFiltrosMarketplace);
  }

  if (filterStatus) {
    filterStatus.addEventListener("change", aplicarFiltrosMarketplace);
  }

  crearProductosIniciales();
  cargarMarketplace();
});

function registrarProducto() {
  const usuarioActivo = JSON.parse(sessionStorage.getItem("usuarioActivo"));

  const nombreProducto = document.getElementById("nombreProducto").value.trim();
  const precioProducto = Number(document.getElementById("precioProducto").value);
  const categoriaProducto = document.getElementById("categoriaProducto").value;
  const estadoTienda = document.getElementById("estadoTienda").value;
  const whatsappProducto = document.getElementById("whatsappProducto").value.trim();
  const ubicacionProducto = document.getElementById("ubicacionProducto").value.trim();
  const descripcionProducto = document.getElementById("descripcionProducto").value.trim();
  const fotoProductoInput = document.getElementById("fotoProducto");

  if (precioProducto < 0 || isNaN(precioProducto)) {
    mostrarMensajeMarket("El precio debe ser válido.", "error");
    return;
  }

  if (whatsappProducto.length < 9) {
    mostrarMensajeMarket("Ingresa un número de WhatsApp válido.", "error");
    return;
  }

  const archivoFoto = fotoProductoInput.files[0];

  if (archivoFoto) {
    const reader = new FileReader();

    reader.onload = function(event) {
      guardarProducto(
        usuarioActivo,
        nombreProducto,
        precioProducto,
        categoriaProducto,
        estadoTienda,
        whatsappProducto,
        ubicacionProducto,
        descripcionProducto,
        event.target.result
      );
    };

    reader.readAsDataURL(archivoFoto);
  } else {
    guardarProducto(
      usuarioActivo,
      nombreProducto,
      precioProducto,
      categoriaProducto,
      estadoTienda,
      whatsappProducto,
      ubicacionProducto,
      descripcionProducto,
      ""
    );
  }
}

function guardarProducto(
  usuarioActivo,
  nombreProducto,
  precioProducto,
  categoriaProducto,
  estadoTienda,
  whatsappProducto,
  ubicacionProducto,
  descripcionProducto,
  fotoProducto
) {
  let productos = JSON.parse(localStorage.getItem("productosMarketplace")) || [];

  const nuevoProducto = {
    id: Date.now(),
    nombreProducto: nombreProducto,
    precioProducto: precioProducto,
    categoriaProducto: categoriaProducto,
    estadoTienda: estadoTienda,
    whatsappProducto: whatsappProducto,
    ubicacionProducto: ubicacionProducto,
    descripcionProducto: descripcionProducto,
    fotoProducto: fotoProducto,
    vendedorId: usuarioActivo.id,
    vendedorNombre: usuarioActivo.nombre,
    vendedorRol: usuarioActivo.rol,
    vendedorArea: usuarioActivo.area,
    fechaPublicacion: new Date().toLocaleString()
  };

  productos.unshift(nuevoProducto);

  localStorage.setItem("productosMarketplace", JSON.stringify(productos));

  document.getElementById("marketForm").reset();

  mostrarMensajeMarket("Producto publicado correctamente.", "success");

  cargarMarketplace();
}

function crearProductosIniciales() {
  const productosExistentes = JSON.parse(localStorage.getItem("productosMarketplace")) || [];

  if (productosExistentes.length > 0) {
    return;
  }

  const productosIniciales = [
    {
      id: 1,
      nombreProducto: "Brownies caseros",
      precioProducto: 5,
      categoriaProducto: "Postres",
      estadoTienda: "Abierto",
      whatsappProducto: "51999999999",
      ubicacionProducto: "Pabellón B",
      descripcionProducto: "Brownies de chocolate, disponibles durante el recreo.",
      fotoProducto: "",
      vendedorId: 3,
      vendedorNombre: "Lucía Torres",
      vendedorRol: "Alumno",
      vendedorArea: "Ciencias de la Salud",
      fechaPublicacion: new Date().toLocaleString()
    },
    {
      id: 2,
      nombreProducto: "Impresiones y copias",
      precioProducto: 0.3,
      categoriaProducto: "Impresiones",
      estadoTienda: "Cerrado",
      whatsappProducto: "51988888888",
      ubicacionProducto: "Biblioteca central",
      descripcionProducto: "Servicio de impresión de trabajos, fichas y separatas.",
      fotoProducto: "",
      vendedorId: 3,
      vendedorNombre: "Lucía Torres",
      vendedorRol: "Alumno",
      vendedorArea: "Ciencias de la Salud",
      fechaPublicacion: new Date().toLocaleString()
    }
  ];

  localStorage.setItem("productosMarketplace", JSON.stringify(productosIniciales));
}

function aplicarFiltrosMarketplace() {
  const searchMarket = document.getElementById("searchMarket").value;
  const filterCategory = document.getElementById("filterCategory").value;
  const filterStatus = document.getElementById("filterStatus").value;

  cargarMarketplace(searchMarket, filterCategory, filterStatus);
}

function cargarMarketplace(busqueda = "", categoria = "", estado = "") {
  const marketGrid = document.getElementById("marketGrid");

  if (!marketGrid) {
    return;
  }

  const usuarioActivo = JSON.parse(sessionStorage.getItem("usuarioActivo"));
  const productos = JSON.parse(localStorage.getItem("productosMarketplace")) || [];

  const textoBusqueda = busqueda.toLowerCase();

  const productosFiltrados = productos.filter(function(producto) {
    const coincideBusqueda =
      String(producto.nombreProducto || "").toLowerCase().includes(textoBusqueda) ||
      String(producto.descripcionProducto || "").toLowerCase().includes(textoBusqueda) ||
      String(producto.vendedorNombre || "").toLowerCase().includes(textoBusqueda) ||
      String(producto.vendedorArea || "").toLowerCase().includes(textoBusqueda) ||
      String(producto.ubicacionProducto || "").toLowerCase().includes(textoBusqueda);

    const coincideCategoria =
      categoria === "" || producto.categoriaProducto === categoria;

    const coincideEstado =
      estado === "" || producto.estadoTienda === estado;

    return coincideBusqueda && coincideCategoria && coincideEstado;
  });

  marketGrid.innerHTML = "";

  if (productosFiltrados.length === 0) {
    marketGrid.innerHTML = `
      <div class="notification-card">
        <h3>No hay productos disponibles</h3>
        <p>No se encontraron productos o servicios con esos filtros.</p>
      </div>
    `;
    return;
  }

  productosFiltrados.forEach(function(producto) {
    const card = document.createElement("div");
    card.className = "product-card";

    const imagenProducto = producto.fotoProducto || generarImagenProductoPlaceholder();

    const estadoClase =
      producto.estadoTienda === "Abierto" ? "store-open" : "store-closed";

    const whatsappLink = crearLinkWhatsApp(producto.whatsappProducto, producto.nombreProducto);

    let accionesHTML = "";

    const esDueño =
      usuarioActivo && String(usuarioActivo.id) === String(producto.vendedorId);

    const esAdmin =
      usuarioActivo && usuarioActivo.rol === "Administrador";

    if (esDueño || esAdmin) {
      accionesHTML = `
        <div class="product-actions">
          <button class="secondary-btn small-btn" onclick="cambiarEstadoProducto(${producto.id})">
            Cambiar estado
          </button>

          <button class="delete-btn small-btn" onclick="eliminarProducto(${producto.id})">
            Eliminar
          </button>
        </div>
      `;
    }

    card.innerHTML = `
      <img src="${imagenProducto}" class="product-img" alt="Producto">

      <div class="product-content">
        <h3>${producto.nombreProducto}</h3>

        <div class="product-price">
          S/ ${Number(producto.precioProducto).toFixed(2)}
        </div>

        <p class="product-description">
          ${producto.descripcionProducto}
        </p>

        <div class="product-meta">
          <span class="market-badge">${producto.categoriaProducto}</span>
          <span class="market-badge ${estadoClase}">${producto.estadoTienda}</span>
          <span class="market-badge">${producto.vendedorArea}</span>
        </div>

        <p class="product-description">
          <strong>Vendedor:</strong> ${producto.vendedorNombre}<br>
          <strong>Ubicación:</strong> ${producto.ubicacionProducto}
        </p>

        <a href="${whatsappLink}" target="_blank" class="whatsapp-btn">
          Contactar por WhatsApp
        </a>

        ${accionesHTML}
      </div>
    `;

    marketGrid.appendChild(card);
  });
}

function crearLinkWhatsApp(numero, producto) {
  let numeroLimpio = String(numero || "").replace(/\D/g, "");

  const mensaje = encodeURIComponent(
    "Hola, vi tu producto en UniConnect: " + producto + ". ¿Está disponible?"
  );

  return "https://wa.me/" + numeroLimpio + "?text=" + mensaje;
}

function cambiarEstadoProducto(id) {
  let productos = JSON.parse(localStorage.getItem("productosMarketplace")) || [];

  productos = productos.map(function(producto) {
    if (producto.id === id) {
      producto.estadoTienda =
        producto.estadoTienda === "Abierto" ? "Cerrado" : "Abierto";
    }

    return producto;
  });

  localStorage.setItem("productosMarketplace", JSON.stringify(productos));

  cargarMarketplace();

  mostrarMensajeMarket("Estado actualizado correctamente.", "success");
}

function eliminarProducto(id) {
  const confirmar = confirm("¿Seguro que deseas eliminar este producto?");

  if (!confirmar) {
    return;
  }

  let productos = JSON.parse(localStorage.getItem("productosMarketplace")) || [];

  productos = productos.filter(function(producto) {
    return producto.id !== id;
  });

  localStorage.setItem("productosMarketplace", JSON.stringify(productos));

  cargarMarketplace();

  mostrarMensajeMarket("Producto eliminado correctamente.", "success");
}

function generarImagenProductoPlaceholder() {
  return "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='250'><rect width='400' height='250' fill='%23cbd5e1'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-size='28' fill='%23334155'>Producto</text></svg>";
}

function mostrarMensajeMarket(texto, tipo) {
  const marketMessage = document.getElementById("marketMessage");

  if (!marketMessage) {
    alert(texto);
    return;
  }

  marketMessage.textContent = texto;
  marketMessage.className = "message " + tipo;

  setTimeout(function() {
    marketMessage.textContent = "";
    marketMessage.className = "message";
  }, 3000);
}