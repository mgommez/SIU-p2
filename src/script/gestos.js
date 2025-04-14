import {
    GestureRecognizer,
    FilesetResolver,
    DrawingUtils
  } from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3";
  
  let gestureRecognizer;
  let runningMode = "VIDEO";
  let webcamRunning = false;
  const videoElement = document.createElement("video");
  const canvasElement = document.createElement("canvas");
  const canvasCtx = canvasElement.getContext("2d");
  const gestureOutput = document.createElement("div");
  
  // Configuración inicial
  gestureOutput.id = "gesture_output";
  gestureOutput.style.position = "absolute";
  gestureOutput.style.top = "10px";
  gestureOutput.style.left = "10px";
  gestureOutput.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
  gestureOutput.style.color = "white";
  gestureOutput.style.padding = "10px";
  gestureOutput.style.borderRadius = "5px";
  gestureOutput.style.display = "none";
  document.body.appendChild(gestureOutput);
  
  canvasElement.id = "output_canvas";
  canvasElement.style.position = "absolute";
  canvasElement.style.top = "0";
  canvasElement.style.left = "0";
  document.body.appendChild(canvasElement);
  
  // Inicializar el modelo de reconocimiento de gestos
  const createGestureRecognizer = async () => {
    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
    );
    gestureRecognizer = await GestureRecognizer.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath:
          "https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task",
        delegate: "GPU"
      },
      runningMode: runningMode
    });
  
    // Iniciar la cámara automáticamente después de cargar el modelo
    startWebcam();
  };
  createGestureRecognizer();
  
  // Verificar si el navegador soporta la cámara
  function hasGetUserMedia() {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  }
  
  // Iniciar la cámara
  function startWebcam() {
    if (!hasGetUserMedia()) {
      console.warn("getUserMedia() no es soportado por tu navegador.");
      alert("Tu navegador no soporta acceso a la cámara.");
      return;
    }
  
    const constraints = {
      video: true
    };
  
    navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
      videoElement.srcObject = stream;
      videoElement.play();
      webcamRunning = true;
      videoElement.addEventListener("loadeddata", predictWebcam);
    }).catch((error) => {
      console.error("Error al acceder a la cámara:", error);
      alert("No se pudo acceder a la cámara. Por favor, verifica los permisos en tu navegador.");
    });
  }
  
  // Procesar los gestos detectados
  async function predictWebcam() {
    if (!gestureRecognizer) {
      console.warn("El modelo de reconocimiento de gestos aún no está cargado.");
      return;
    }
  
    if (runningMode === "IMAGE") {
      runningMode = "VIDEO";
      await gestureRecognizer.setOptions({ runningMode: "VIDEO" });
    }
  
    const nowInMs = Date.now();
    const results = gestureRecognizer.recognizeForVideo(videoElement, nowInMs);
  
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    const drawingUtils = new DrawingUtils(canvasCtx);
  
    if (results.landmarks) {
      for (const landmarks of results.landmarks) {
        drawingUtils.drawConnectors(
          landmarks,
          GestureRecognizer.HAND_CONNECTIONS,
          { color: "#00FF00", lineWidth: 5 }
        );
        drawingUtils.drawLandmarks(landmarks, { color: "#FF0000", lineWidth: 2 });
      }
    }
  
    if (results.gestures.length > 0) {
      const gesture = results.gestures[0][0].categoryName;
      const confidence = (results.gestures[0][0].score * 100).toFixed(2);
  
      gestureOutput.style.display = "block";
      gestureOutput.innerText = `Gesto detectado: ${gesture}\nConfianza: ${confidence}%`;
  
      handleGesture(gesture);
    } else {
      gestureOutput.style.display = "none";
    }
  
    if (webcamRunning) {
      window.requestAnimationFrame(predictWebcam);
    }
  }
  
  // Manejar acciones según el gesto detectado
  function handleGesture(gesture) {
    const currentPage = window.location.pathname;
  
    switch (gesture) {
      case "Open_Palm":
        if (currentPage.includes("inicio.html")) {
          console.log("Gesto: Mano abierta - Navegar a galería personal.");
          window.location.href = "galeria_personal.html";
        }
        break;
  
    case "Thumb_Up":
        if (currentPage.includes("galeria_personal.html") || currentPage.includes("marketplace.html")) {
            console.log("Gesto: Pulgar arriba - Subir en la página.");
            window.scrollBy(0, -200); // Desplazar hacia arriba
        }
        break;
    
        case "Thumb_Down":
        if (currentPage.includes("galeria_personal.html") || currentPage.includes("marketplace.html")) {
            console.log("Gesto: Pulgar abajo - Bajar en la página.");
            window.scrollBy(0, 200); // Desplazar hacia abajo
        }
        break;
  
      default:
        console.log(`Gesto no reconocido: ${gesture}`);
    }
  }