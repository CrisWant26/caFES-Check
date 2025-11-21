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
// =========================
//  1. FOTO (EVIDENCIA) - VERSIÓN IOS COMPATIBLE
// =========================

startCamBtn?.addEventListener("click", async () => {
  // 1. Verificar soporte básico
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    alert("Tu navegador no soporta acceso a la cámara. Intenta usar Safari actualizado.");
    return;
  }

  try {
    // 2. Configuración más flexible para iOS
    // Intentamos pedir la trasera, pero si falla, aceptamos cualquier cámara
    const constraints = {
      audio: false,
      video: {
        facingMode: "environment", // Intenta cámara trasera
        width: { ideal: 1280 },    // Resolución ideal (no obligatoria)
        height: { ideal: 720 }
      }
    };

    alert("Solicitando permiso de cámara..."); // DEBUG: Para saber si el botón funciona

    mediaStream = await navigator.mediaDevices.getUserMedia(constraints);

    // 3. Asignar al video
    videoElement.srcObject = mediaStream;
    
    // IMPORTANTE PARA IOS: Asegurar que se reproduzca inline
    videoElement.setAttribute("playsinline", true); 
    videoElement.play(); // Forzar play

    // 4. Cambiar interfaz
    takePhotoBtn.classList.remove("hidden");
    startCamBtn.classList.add("hidden");

  } catch (err) {
    // AQUÍ VERÁS EL ERROR REAL EN TU IPHONE
    console.error("Error cámara:", err);
    alert("ERROR DE CÁMARA: " + err.name + " - " + err.message);
    
    if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        alert("PERMISO DENEGADO: Ve a Ajustes > Safari > Cámara y permite el acceso.");
    }
  }
});

takePhotoBtn?.addEventListener("click", () => {
  if (!mediaStream) {
    alert("No hay cámara activa.");
    return;
  }

  // Asegurar que el canvas tenga el tamaño real del video
  // (En iOS a veces el videoElement reporta 0 si no se ha pintado)
  const videoWidth = videoElement.videoWidth;
  const videoHeight = videoElement.videoHeight;

  if (videoWidth === 0 || videoHeight === 0) {
    alert("Espera a que cargue bien el video antes de tomar la foto.");
    return;
  }

  photoCanvas.width  = videoWidth;
  photoCanvas.height = videoHeight;

  const ctx = photoCanvas.getContext("2d");
  ctx.drawImage(videoElement, 0, 0, videoWidth, videoHeight);

  // Intentar generar la imagen
  try {
    const dataUrl = photoCanvas.toDataURL("image/jpeg", 0.8);
    photoPreview.src = dataUrl;

    photoPreview.classList.remove("hidden");
    videoElement.classList.add("hidden");
    retakePhotoBtn.classList.remove("hidden");
    takePhotoBtn.classList.add("hidden");

    fotoTomada = true;
    actualizarEstadoContinuar();
  } catch (e) {
    alert("Error al procesar la foto: " + e.message);
  }
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