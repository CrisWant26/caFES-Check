// signup.js

const btnUnam    = document.getElementById("btn-unam");
const btnExterno = document.getElementById("btn-externo");
const unamFields    = document.querySelectorAll(".unam-only");
const externoFields = document.querySelectorAll(".externo-only");
const signupForm    = document.getElementById("signup-form");

function setMode(mode) {
  const isUnam = mode === "unam";

  btnUnam.classList.toggle("active", isUnam);
  btnExterno.classList.toggle("active", !isUnam);

  unamFields.forEach(el => {
    el.classList.toggle("hidden", !isUnam);
    const input = el.querySelector("input");
    if (input) input.required = isUnam;
  });

  externoFields.forEach(el => {
    el.classList.toggle("hidden", isUnam);
    const input = el.querySelector("input");
    if (input) input.required = !isUnam;
  });
}

// Eventos de los botones toggle
btnUnam.addEventListener("click", () => setMode("unam"));
btnExterno.addEventListener("click", () => setMode("externo"));

// Modo inicial: UNAM
setMode("unam");

// Submit del formulario
signupForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const isUnam = btnUnam.classList.contains("active");
  const correo = isUnam ? 
    document.getElementById("correo-unam").value : 
    document.getElementById("correo-personal").value;
  
  // Generar contraseña temporal (en producción debería ser ingresada por el usuario)
  const contrasena = "temp123";
  
  try {
    const result = isUnam ? 
      await AuthAPI.registerUNAM(correo, contrasena) :
      await AuthAPI.registerExterno(correo, contrasena);
    
    if (result.mensaje) {
      alert(result.mensaje);
      localStorage.setItem('usuario_id', result.usuario_id);
      window.location.href = './identification.html';
    }
  } catch (error) {
    alert('Error al registrar: ' + error.message);
  }
});
