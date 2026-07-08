// js/auth.js - Solo inicio de sesión
function iniciarSesion() {
  const correo = document.getElementById("correo").value.trim();
  const contrasena = document.getElementById("contrasena").value.trim();

  if (!correo || !contrasena) {
    alert("⚠️ Escribe tu correo y contraseña");
    return;
  }

  if (!supabase) {
    alert("⏳ Espera un momento, cargando la conexión...");
    return;
  }

  // Consulta a la base de datos
  supabase
    .from("usuarios")
    .select("id, usuario, nombre_completo, rol")
    .eq("usuario", correo)
    .eq("contrasena", contrasena)
    .maybeSingle()
    .then(({ data, error }) => {
      if (error) {
        console.error(error);
        alert("❌ Error al consultar la base");
        return;
      }
      if (!data) {
        alert("❌ Usuario o contraseña incorrectos");
        return;
      }
      // Entrada exitosa
      alert("✅ Bienvenido " + data.nombre_completo);
      localStorage.setItem("usuarioActual", JSON.stringify(data));
      window.location.href = "dashboard.html";
    })
    .catch(err => {
      console.error(err);
      alert("❌ No se pudo conectar");
    });
}