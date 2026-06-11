// ===============================
// UNICONNECT - PERFIL DEL USUARIO
// ===============================

document.addEventListener("DOMContentLoaded", function() {
  const usuarioActivo = JSON.parse(sessionStorage.getItem("usuarioActivo"));

  if (!usuarioActivo) {
    window.location.href = "index.html";
    return;
  }

  const backBtn = document.getElementById("backBtn");
  const profileForm = document.getElementById("profileForm");
  const passwordForm = document.getElementById("passwordForm");
  const fotoPerfil = document.getElementById("fotoPerfil");

  if (backBtn) {
    backBtn.addEventListener("click", function() {
      window.location.href = "dashboard.html";
    });
  }

  cargarDatosPerfil(usuarioActivo);

  if (profileForm) {
    profileForm.addEventListener("submit", function(event) {
      event.preventDefault();
      actualizarPerfil();
    });
  }

  if (passwordForm) {
    passwordForm.addEventListener("submit", function(event) {
      event.preventDefault();
      cambiarPassword();
    });
  }

  if (fotoPerfil) {
    fotoPerfil.addEventListener("change", function() {
      previsualizarNuevaFoto();
    });
  }
});

function cargarDatosPerfil(usuario) {
  document.getElementById("profileName").textContent = usuario.nombre || "Sin nombre";
  document.getElementById("profileRole").textContent = usuario.rol || "Sin rol";
  document.getElementById("profileArea").textContent = usuario.area || "Sin área";
  document.getElementById("profileEmail").textContent = usuario.email || "Sin correo";

  document.getElementById("nombrePerfil").value = usuario.nombre || "";
  document.getElementById("dniPerfil").value = usuario.dni || "";
  document.getElementById("emailPerfil").value = usuario.email || "";
  document.getElementById("rolPerfil").value = usuario.rol || "";
  document.getElementById("areaPerfil").value = usuario.area || "";
  document.getElementById("aulaPerfil").value = usuario.aula || "";

  const foto = usuario.foto || generarFotoPerfilPlaceholder();

  document.getElementById("profilePhotoPreview").src = foto;
}

function previsualizarNuevaFoto() {
  const fotoInput = document.getElementById("fotoPerfil");
  const archivo = fotoInput.files[0];

  if (!archivo) {
    return;
  }

  const reader = new FileReader();

  reader.onload = function(event) {
    document.getElementById("profilePhotoPreview").src = event.target.result;
  };

  reader.readAsDataURL(archivo);
}

function actualizarPerfil() {
  const usuarioActivo = JSON.parse(sessionStorage.getItem("usuarioActivo"));

  const nombre = document.getElementById("nombrePerfil").value.trim();
  const email = document.getElementById("emailPerfil").value.trim();
  const area = document.getElementById("areaPerfil").value;
  const aula = document.getElementById("aulaPerfil").value.trim();
  const fotoInput = document.getElementById("fotoPerfil");

  if (nombre === "" || email === "" || area === "") {
    mostrarMensajePerfil("Completa los campos obligatorios.", "error");
    return;
  }

  let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];

  const emailExiste = usuarios.some(function(usuario) {
    return (
      String(usuario.email).toLowerCase() === email.toLowerCase() &&
      String(usuario.id) !== String(usuarioActivo.id)
    );
  });

  if (emailExiste) {
    mostrarMensajePerfil("Ese correo ya pertenece a otro usuario.", "error");
    return;
  }

  const archivoFoto = fotoInput.files[0];

  if (archivoFoto) {
    const reader = new FileReader();

    reader.onload = function(event) {
      guardarCambiosPerfil(nombre, email, area, aula, event.target.result);
    };

    reader.readAsDataURL(archivoFoto);
  } else {
    guardarCambiosPerfil(nombre, email, area, aula, usuarioActivo.foto || "");
  }
}

function guardarCambiosPerfil(nombre, email, area, aula, foto) {
  let usuarioActivo = JSON.parse(sessionStorage.getItem("usuarioActivo"));
  let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];

  usuarios = usuarios.map(function(usuario) {
    if (String(usuario.id) === String(usuarioActivo.id)) {
      usuario.nombre = nombre;
      usuario.email = email;
      usuario.area = area;
      usuario.aula = aula;
      usuario.foto = foto;
    }

    return usuario;
  });

  usuarioActivo.nombre = nombre;
  usuarioActivo.email = email;
  usuarioActivo.area = area;
  usuarioActivo.aula = aula;
  usuarioActivo.foto = foto;

  localStorage.setItem("usuarios", JSON.stringify(usuarios));
  sessionStorage.setItem("usuarioActivo", JSON.stringify(usuarioActivo));

  cargarDatosPerfil(usuarioActivo);

  document.getElementById("fotoPerfil").value = "";

  mostrarMensajePerfil("Perfil actualizado correctamente.", "success");
}

function cambiarPassword() {
  const usuarioActivo = JSON.parse(sessionStorage.getItem("usuarioActivo"));

  const passwordActual = document.getElementById("passwordActual").value.trim();
  const passwordNueva = document.getElementById("passwordNueva").value.trim();
  const passwordConfirmar = document.getElementById("passwordConfirmar").value.trim();

  if (passwordActual !== usuarioActivo.password) {
    mostrarMensajePassword("La contraseña actual no es correcta.", "error");
    return;
  }

  if (passwordNueva.length < 6) {
    mostrarMensajePassword("La nueva contraseña debe tener mínimo 6 caracteres.", "error");
    return;
  }

  if (passwordNueva !== passwordConfirmar) {
    mostrarMensajePassword("Las nuevas contraseñas no coinciden.", "error");
    return;
  }

  let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];

  usuarios = usuarios.map(function(usuario) {
    if (String(usuario.id) === String(usuarioActivo.id)) {
      usuario.password = passwordNueva;
    }

    return usuario;
  });

  usuarioActivo.password = passwordNueva;

  localStorage.setItem("usuarios", JSON.stringify(usuarios));
  sessionStorage.setItem("usuarioActivo", JSON.stringify(usuarioActivo));

  document.getElementById("passwordForm").reset();

  mostrarMensajePassword("Contraseña actualizada correctamente.", "success");
}

function mostrarMensajePerfil(texto, tipo) {
  const profileMessage = document.getElementById("profileMessage");

  profileMessage.textContent = texto;
  profileMessage.className = "message " + tipo;

  setTimeout(function() {
    profileMessage.textContent = "";
    profileMessage.className = "message";
  }, 3000);
}

function mostrarMensajePassword(texto, tipo) {
  const passwordMessage = document.getElementById("passwordMessage");

  passwordMessage.textContent = texto;
  passwordMessage.className = "message " + tipo;

  setTimeout(function() {
    passwordMessage.textContent = "";
    passwordMessage.className = "message";
  }, 3000);
}

function generarFotoPerfilPlaceholder() {
  return "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='150' height='150'><rect width='150' height='150' fill='%23cbd5e1'/><text x='50%' y='55%' dominant-baseline='middle' text-anchor='middle' font-size='50' fill='%23334155'>U</text></svg>";
}