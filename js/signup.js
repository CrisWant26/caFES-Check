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
signupForm.addEventListener("submit", (event) => {
  event.preventDefault(); // evitar recarga

  // Aquí en un futuro puedes mandar datos a un backend.
  // Por ahora solo redirigimos a la pantalla principal.
  window.location.href = "identificacion.html";
});
