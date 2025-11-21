alert("JS de identificación CARGADO ✅");

// =========================
//  BASE DE DATOS DE QR VÁLIDOS
// =========================
const QR_DATABASE = [
  {
    numAutorizado: "1001",
    dependencia: "Facultad de Ingeniería",
    localidad: "C",
    autorizado: "Raúl Ruiz Flores",
    horario: "Lunes a viernes 7:00 a 20:00 horas; sábados 8:00 a 14:00 horas"
  },
  {
    numAutorizado: "1004",
    dependencia: "Facultad de Química",
    localidad: "C",
    autorizado: "Alfonso Crespo Pérez",
    horario: "Lunes a viernes 7:00 a 20:00 horas; sábados 8:00 a 14:00 horas"
  },
  {
    numAutorizado: "1014",
    dependencia: "Facultad de Medicina",
    localidad: "C",
    autorizado: "Gastronómica 50y30, S.A. de C.V.",
    horario: "Lunes a viernes 7:00 a 20:00 horas; sábados 8:00 a 13:00 horas"
  },
  {
    numAutorizado: "1020",
    dependencia: "Escuela Nacional Colegio de Ciencias y Humanidades Plantel Sur",
    localidad: "M",
    autorizado: "Carlos Manuel Hernández Ortega",
    horario: "Lunes a viernes 7:00 a 20:00 horas; sábados 8:00 a 14:00 horas"
  },
  {
    numAutorizado: "1023",
    dependencia: "Escuela Nacional Preparatoria No. 5 José Vasconcelos",
    localidad: "M",
    autorizado: "Eduardo Quintanar Floriano",
    horario: "Lunes a viernes 7:00 a 20:00 horas; sábados 8:00 a 14:00 horas"
  }
];

// =========================
//  ESTADO COMPARTIDO
// =========================

let mediaStream = null;
let fotoTomada = false;
let qrLeido = false;

// Elementos del DOM
const startCamBtn    = document.getElementById("btn-start-camera");
const takePhotoBtn   = document.getElementById("btn-take-photo");
const retakePhotoBtn = document.getElementById("btn-retake-photo");
const videoElement   = document.getElementById("camera-preview");
const photoCanvas    = document.getElementById("photo-canvas");
const photoPreview   = document.getElementById("photo-preview");

const startQrBtn     = document.getElementById("btn-start-qr");
const continuarBtn   = document.getElementById("btn-continuar");

function actualizarEstadoContinuar() {
  // El botón continuar se activa SOLO si hay foto Y hay QR válido
  if (continuarBtn) {
    continuarBtn.disabled = !(fotoTomada && qrLeido);
  }
}

// =========================
//  1. FOTO (EVIDENCIA)
// =========================

startCamBtn?.addEventListener("click", async () => {
  try {
    // Pedir permiso de cámara
    mediaStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment" }, // Intenta usar la cámara trasera
      audio: false
    });

    videoElement.srcObject = mediaStream;

    // Mostrar botones correctos
    takePhotoBtn.classList.remove("hidden");
    startCamBtn.classList.add("hidden");
  } catch (err) {
    console.error("Error getUserMedia:", err);
    alert("No se pudo acceder a la cámara. Asegúrate de estar en HTTPS o localhost y haber dado permisos.");
  }
});

takePhotoBtn?.addEventListener("click", () => {
  if (!mediaStream) return;

  // Configurar el canvas al tamaño del video
  const track = mediaStream.getVideoTracks()[0];
  const settings = track.getSettings();
  const width  = settings.width  || 640;
  const height = settings.height || 480;

  photoCanvas.width  = width;
  photoCanvas.height = height;

  // Dibujar la foto
  const ctx = photoCanvas.getContext("2d");
  ctx.drawImage(videoElement, 0, 0, width, height);

  // Convertir a imagen visible
  const dataUrl = photoCanvas.toDataURL("image/jpeg", 0.85);
  photoPreview.src = dataUrl;

  // Cambiar interfaz
  photoPreview.classList.remove("hidden");
  videoElement.classList.add("hidden");
  retakePhotoBtn.classList.remove("hidden");
  takePhotoBtn.classList.add("hidden");

  fotoTomada = true;
  actualizarEstadoContinuar();
});

retakePhotoBtn?.addEventListener("click", () => {
  fotoTomada = false;
  actualizarEstadoContinuar();

  // Resetear interfaz
  photoPreview.classList.add("hidden");
  retakePhotoBtn.classList.add("hidden");
  videoElement.classList.remove("hidden");
  takePhotoBtn.classList.remove("hidden");
});

// =========================
//  2. QR EN VIVO
// =========================

let html5QrCode = null;
let qrCorriendo = false;

window.addEventListener("load", () => {
  if (typeof Html5Qrcode === "undefined") {
    console.error("Librería html5-qrcode no encontrada");
    return;
  }
  // "qr-reader" debe coincidir con el ID del div en el HTML
  html5QrCode = new Html5Qrcode("qr-reader");
});

function onScanSuccess(decodedText) {
  console.log("QR Crudo:", decodedText);

  let datosDelQR;
  try {
    datosDelQR = JSON.parse(decodedText);
  } catch (e) {
    alert("El QR no es válido (No es un JSON).");
    return;
  }

  // VALIDACIÓN: Buscar en la base de datos "QR_DATABASE"
  // Buscamos coincidencia por 'numAutorizado'
  const registroEncontrado = QR_DATABASE.find(item => item.numAutorizado === datosDelQR.numAutorizado);

  if (!registroEncontrado) {
    alert(`El número autorizado "${datosDelQR.numAutorizado}" no existe en la base de datos.`);
    return;
  }

  // SI EXISTE: Llenamos el formulario con los datos de la base de datos (más seguro)
  document.getElementById("campo-num-aut").value     = registroEncontrado.numAutorizado;
  document.getElementById("campo-dependencia").value = registroEncontrado.dependencia;
  document.getElementById("campo-localidad").value   = registroEncontrado.localidad;
  document.getElementById("campo-autorizado").value  = registroEncontrado.autorizado;
  document.getElementById("campo-horario").value     = registroEncontrado.horario;

  qrLeido = true;
  actualizarEstadoContinuar();

  // Detener cámara QR
  if (html5QrCode && qrCorriendo) {
    html5QrCode.stop().then(() => {
      qrCorriendo = false;
      startQrBtn.textContent = "Activar escáner QR";
    }).catch(err => console.error(err));
  }
}

startQrBtn?.addEventListener("click", () => {
  if (!html5QrCode) {
    alert("El lector QR aún no está listo. Recarga la página.");
    return;
  }

  if (qrCorriendo) {
    // Si ya corre, lo paramos
    html5QrCode.stop().then(() => {
      qrCorriendo = false;
      startQrBtn.textContent = "Activar escáner QR";
    });
    return;
  }

  // Iniciar escaneo
  const config = { fps: 10, qrbox: 250 };
  
  html5QrCode.start(
    { facingMode: "environment" }, 
    config, 
    onScanSuccess, 
    () => {} // Ignorar errores de "no QR found" en cada frame
  ).then(() => {
    qrCorriendo = true;
    startQrBtn.textContent = "Detener escáner QR";
  }).catch(err => {
    console.error(err);
    alert("No se pudo iniciar la cámara para el QR. Revisa permisos.");
  });
});

// =========================
//  3. BOTÓN CONTINUAR
// =========================

continuarBtn?.addEventListener("click", () => {
  if (fotoTomada && qrLeido) {
    // Guardar datos si quisieras (opcional)
    // localStorage.setItem("reporte_datos", ...);
    
    // Ir a la siguiente pantalla
    window.location.href = "main.html";
  }
});