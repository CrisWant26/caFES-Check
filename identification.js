alert("JS de identificación CARGADO ✅");


// =========================
//  ESTADO COMPARTIDO
// =========================

let mediaStream = null;
let fotoTomada = false;
let qrLeido = false;

const startCamBtn    = document.getElementById("btn-start-camera");
const takePhotoBtn   = document.getElementById("btn-take-photo");
const retakePhotoBtn = document.getElementById("btn-retake-photo");
const videoElement   = document.getElementById("camera-preview");
const photoCanvas    = document.getElementById("photo-canvas");
const photoPreview   = document.getElementById("photo-preview");

const startQrBtn     = document.getElementById("btn-start-qr");
const continuarBtn   = document.getElementById("btn-continuar");

function actualizarEstadoContinuar() {
  continuarBtn.disabled = !(fotoTomada && qrLeido);
}

// =========================
//  1. FOTO (EVIDENCIA)
// =========================

startCamBtn?.addEventListener("click", async () => {
  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment" },
      audio: false
    });

    videoElement.srcObject = mediaStream;

    takePhotoBtn.classList.remove("hidden");
    startCamBtn.classList.add("hidden");
  } catch (err) {
    console.error("Error getUserMedia:", err.name, err.message);

    if (err.name === "NotAllowedError") {
      alert("La cámara está bloqueada. Revisa permisos en Ajustes > Safari > Cámara.");
    } else if (
      err.name === "NotSupportedError" ||
      (err.message && err.message.includes("secure origins"))
    ) {
      alert("La cámara solo funciona en sitios HTTPS o localhost.");
    } else {
      alert("No se pudo acceder a la cámara.");
    }
  }
});

takePhotoBtn?.addEventListener("click", () => {
  if (!mediaStream) return;

  const track = mediaStream.getVideoTracks()[0];
  const settings = track.getSettings();
  const width  = settings.width  || 640;
  const height = settings.height || 480;

  photoCanvas.width  = width;
  photoCanvas.height = height;

  const ctx = photoCanvas.getContext("2d");
  ctx.drawImage(videoElement, 0, 0, width, height);

  const dataUrl = photoCanvas.toDataURL("image/jpeg", 0.85);
  photoPreview.src = dataUrl;

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

  photoPreview.classList.add("hidden");
  retakePhotoBtn.classList.add("hidden");
  videoElement.classList.remove("hidden");
  takePhotoBtn.classList.remove("hidden");
});

// =========================
//  2. QR EN VIVO (HTML5-QRCODE)
// =========================

let html5QrCode = null;
let qrCorriendo = false;

// Crear instancia al cargar la página
window.addEventListener("load", () => {
  if (typeof Html5Qrcode === "undefined") {
    console.error("No se cargó la librería html5-qrcode");
    return;
  }
  html5QrCode = new Html5Qrcode("qr-reader");
});

// -------- NUEVO onScanSuccess --------
function onScanSuccess(decodedText) {
  console.log("QR detectado:", decodedText);

  let datos;
  try {
    // Esperamos un JSON como:
    // {"numAutorizado":"1001","dependencia":"Facultad de Ingeniería", ...}
    datos = JSON.parse(decodedText);
  } catch (e) {
    alert("El QR no tiene el formato esperado (JSON).");
    return;
  }

  document.getElementById("campo-num-aut").value     = datos.numAutorizado || "";
  document.getElementById("campo-dependencia").value = datos.dependencia   || "";
  document.getElementById("campo-localidad").value   = datos.localidad     || "";
  document.getElementById("campo-autorizado").value  = datos.autorizado    || "";
  document.getElementById("campo-horario").value     = datos.horario       || "";

  qrLeido = true;
  actualizarEstadoContinuar();

  // Detenemos el escáner después de leer
  if (html5QrCode && qrCorriendo) {
    html5QrCode.stop().then(() => {
      qrCorriendo = false;
      startQrBtn.textContent = "Activar escáner QR";
    });
  }
}


startQrBtn?.addEventListener("click", () => {
  if (!html5QrCode) {
    alert("El escáner QR no está listo.");
    return;
  }

  if (qrCorriendo) {
    html5QrCode.stop().then(() => {
      qrCorriendo = false;
      startQrBtn.textContent = "Activar escáner QR";
    });
    return;
  }

  const config = { fps: 10, qrbox: 220 };

  html5QrCode
    .start(
      { facingMode: "environment" },
      config,
      onScanSuccess,
      () => {} // errores de lectura ignorados
    )
    .then(() => {
      qrCorriendo = true;
      startQrBtn.textContent = "Detener escáner QR";
    })
    .catch(err => {
      console.error("No se pudo iniciar el escáner:", err);
      alert("No se pudo iniciar el escáner. Revisa permisos.");
    });
});

// =========================
//  3. CONTINUAR
// =========================

continuarBtn?.addEventListener("click", () => {
  if (!(fotoTomada && qrLeido)) return;
  window.location.href = "main.html";
});
