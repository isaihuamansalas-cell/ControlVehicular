// Conexión única a Supabase
const SUPABASE_URL = "https://wehozsqkrjxuctsqgvj.supabase.co";
const SUPABASE_KEY = "sb_publishable_yHYOE4k8TEYxVuyJbwNCxw_d0nkPTiW";

let supabase;

// Esperamos a que cargue todo antes de conectar
window.addEventListener('load', () => {
  if (window.supabase) {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    console.log("✅ Conexión lista");
  } else {
    console.error("❌ No se cargó la librería");
  }
});