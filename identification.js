"use strict";

// DEBUG: para saber que el archivo sí se cargó
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

document.addEventListener("DOMContentLoaded", () => {
  // =========================
  //  ESTADO COMPARTIDO
  // =========================
  let mediaStream = null;
  let fotoTomada = false;
  let qrLeido = false;
  let html5QrCode = null;
  let qrCorriendo = false;

  // Elementos del DOM
  const startCamBtn    = document.getElementById("btn-start-camera");
  const takePhotoBtn   = document.getElementById("btn-take-photo");
  const retakePhotoBtn = document.getElementById("btn-retake-photo");
  const videoElement   = document.getElementById("camera-preview");
  const photoCanvas    = document.getElementById("photo-canvas");
  const photoPreview   = document.getElementById("photo-preview");
  const continuarBtn   = document.getElementById("btn-continuar");
  const startQrBtn     = document.getElementById("btn-start-qr");

  // Campos de texto del concesionario
  const campoNumAut      = document.getElementById("campo-num-aut");
  const campoDependencia = document.getElementById("campo-dependencia");
  const campoLocalidad   = document.getElementById("campo-localidad");
  const campoAutorizado  = document.getElementById("campo-autorizado");
  const campoHorario     = document.getElementById("campo-horario");

  // Contenedor del formulario y texto de hint
  const concesionarioForm = document.getElementById("concesionario-datos");
  const qrHint            = document.getElementById("qr-hint");

  function actualizarEstadoContinuar() {
    if (continuarBtn) {
      continuarBtn.disabled = !(fotoTomada && qrLeido);
    }
  }

  function detenerCamara() {
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
      mediaStream = null;
    }
  }

  // =========================
  //  1. FOTO (EVIDENCIA)
  // =========================

  startCamBtn?.addEventListener("click", async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert("Tu navegador no soporta acceso a la cámara. Intenta usar Safari/Chrome actualizado.");
      return;
    }

    try {
      const constraints = {
        audio: false,
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };

      console.log("Solicitando permiso de cámara…");
      mediaStream = await navigator.mediaDevices.getUserMedia(constraints);

      videoElement.srcObject = mediaStream;
      videoElement.setAttribute("playsinline", true); // importante en iOS
      await videoElement.play();

      // Mostrar video, ocultar preview
      videoElement.classList.remove("hidden");
      photoPreview.classList.add("hidden");

      takePhotoBtn.classList.remove("hidden");
      startCamBtn.classList.add("hidden");
      retakePhotoBtn.classList.add("hidden");
    } catch (err) {
      console.error("Error cámara:", err);
      alert("No se pudo acceder a la cámara: " + err.name);

      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        alert("Permiso de cámara denegado. Ve a Ajustes/Navegador y permite el acceso a la cámara.");
      }
    }
  });

  takePhotoBtn?.addEventListener("click", () => {
    if (!mediaStream) {
      alert("No hay cámara activa.");
      return;
    }

    const videoWidth  = videoElement.videoWidth;
    const videoHeight = videoElement.videoHeight;

    if (!videoWidth || !videoHeight) {
      alert("Espera a que el video cargue antes de tomar la foto.");
      return;
    }

    photoCanvas.width  = videoWidth;
    photoCanvas.height = videoHeight;

    const ctx = photoCanvas.getContext("2d");
    ctx.drawImage(videoElement, 0, 0, videoWidth, videoHeight);

    try {
      const dataUrl = photoCanvas.toDataURL("image/jpeg", 0.8);
      photoPreview.src = dataUrl;

      photoPreview.classList.remove("hidden");
      videoElement.classList.add("hidden");
      takePhotoBtn.classList.add("hidden");
      retakePhotoBtn.classList.remove("hidden");

      fotoTomada = true;
      actualizarEstadoContinuar();

      // Opcional: apagar cámara después de sacar foto
      detenerCamara();
    } catch (e) {
      alert("Error al procesar la foto: " + e.message);
    }
  });

  retakePhotoBtn?.addEventListener("click", async () => {
    // Volver a pedir cámara
    startCamBtn.classList.remove("hidden");
    takePhotoBtn.classList.add("hidden");
    retakePhotoBtn.classList.add("hidden");
    photoPreview.classList.add("hidden");
    videoElement.classList.add("hidden");

    fotoTomada = false;
    actualizarEstadoContinuar();
  });

  // =========================
  //  2. QR EN VIVO
  // =========================

  // Crear instancia del lector QR (si la librería está disponible)
  try {
    if (typeof Html5Qrcode !== "undefined") {
      html5QrCode = new Html5Qrcode("qr-reader");
    } else {
      console.error("Librería html5-qrcode no encontrada (Html5Qrcode undefined).");
    }
  } catch (e) {
    console.error("Error inicializando Html5Qrcode:", e);
  }

  function onScanSuccess(decodedText) {
    console.log("QR Crudo:", decodedText);

    let datosDelQR;
    try {
      datosDelQR = JSON.parse(decodedText);
    } catch (e) {
      alert("El QR no es válido: debe contener un JSON.");
      // Aseguramos que el formulario siga oculto
      if (concesionarioForm) concesionarioForm.classList.add("hidden");
      if (qrHint) qrHint.classList.remove("hidden");
      return;
    }

    const registroEncontrado = QR_DATABASE.find(
      item => item.numAutorizado === datosDelQR.numAutorizado
    );

    if (!registroEncontrado) {
      alert(`El número autorizado "${datosDelQR.numAutorizado}" no existe en la base de datos.`);
      if (concesionarioForm) concesionarioForm.classList.add("hidden");
      if (qrHint) qrHint.classList.remove("hidden");
      return;
    }

    // Llenamos los campos con info “segura” desde la base
    if (campoNumAut)      campoNumAut.value      = registroEncontrado.numAutorizado;
    if (campoDependencia) campoDependencia.value = registroEncontrado.dependencia;
    if (campoLocalidad)   campoLocalidad.value   = registroEncontrado.localidad;
    if (campoAutorizado)  campoAutorizado.value  = registroEncontrado.autorizado;
    if (campoHorario)     campoHorario.value     = registroEncontrado.horario;

    // 👉 Mostrar formulario y ocultar mensaje de ayuda
    if (concesionarioForm) concesionarioForm.classList.remove("hidden");
    if (qrHint) qrHint.classList.add("hidden");

    qrLeido = true;
    actualizarEstadoContinuar();

    // Detener escáner QR
    if (html5QrCode && qrCorriendo) {
      html5QrCode.stop().then(() => {
        qrCorriendo = false;
        startQrBtn.textContent = "Activar escáner QR";
      }).catch(err => console.error("Error al detener QR:", err));
    }
  }

  startQrBtn?.addEventListener("click", () => {
    if (!html5QrCode) {
      alert("El lector QR aún no está listo. Recarga la página.");
      return;
    }

    if (qrCorriendo) {
      html5QrCode.stop().then(() => {
        qrCorriendo = false;
        startQrBtn.textContent = "Activar escáner QR";
      }).catch(err => console.error("Error al detener QR:", err));
      return;
    }

    // Config para QR cuadrado, centrado
    const config = {
      fps: 10,
      qrbox: { width: 230, height: 230 } // cuadrado
    };

    html5QrCode
      .start({ facingMode: "environment" }, config, onScanSuccess, () => {})
      .then(() => {
        qrCorriendo = true;
        startQrBtn.textContent = "Detener escáner QR";
      })
      .catch(err => {
        console.error("Error al iniciar QR:", err);
        alert("No se pudo iniciar la cámara para el QR. Revisa permisos.");
      });
  });

  // =========================
  //  3. BOTÓN CONTINUAR
  // =========================

  continuarBtn?.addEventListener("click", () => {
    if (fotoTomada && qrLeido) {
      // Aquí podrías guardar info en localStorage si lo necesitas
      // localStorage.setItem("reporte_datos", JSON.stringify(...));
      window.location.href = "main.html";
    }
  });
});
