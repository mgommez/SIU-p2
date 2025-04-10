// Compatibilidad con distintos navegadores
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (SpeechRecognition) {
    const recognition = new SpeechRecognition();
    recognition.lang = 'es-ES'; // Idioma español
    recognition.continuous = false; // Para que pare después de un comando
    recognition.interimResults = false; // Solo resultados finales

    // Función que se llama cuando pulsas el botón
    function startRecognition() {
        recognition.start();
    }

    // Cuando se reconoce algo
    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript.toLowerCase().trim();
        console.log("Comando reconocido:", transcript);

        if (transcript.includes("añadir libro")) {
            window.location.href = "marketplace.html";
        } else if (transcript.includes("información libro")) {
            window.location.href = "informacion_libro.html";
        } else {
            alert("Comando no reconocido: " + transcript);
        }
    };

    recognition.onerror = (event) => {
        console.error("Error de reconocimiento:", event.error);
        alert("Hubo un problema con el reconocimiento de voz.");
    };

    // Exponer función al ámbito global (para que funcione con onclick)
    window.startRecognition = startRecognition;

} else {
    alert("Tu navegador no soporta reconocimiento de voz.");
}
