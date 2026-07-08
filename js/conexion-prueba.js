async function verificarConexion() {
  const { data, error } = await supabase.from('usuarios').select('id');

  if (error) {
    console.log("❌ Error:", error.message);
    alert("❌ No se pudo conectar, revisa los datos");
  } else {
    console.log("✅ ¡Conectado perfecto!");
    alert("✅ Conexión exitosa con la base compartida");
  }
}

// Ejecutar al abrir la página
window.addEventListener('load', verificarConexion);