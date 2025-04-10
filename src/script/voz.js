/*
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
*/


///////////////////////////////////////////

const librosDisponibles = {
    "el quijote": {
        titulo: "El Quijote",
        imagen: "img/libros/libro1.jpg"
    },
    "cien años de soledad": {
        titulo: "Cien Años de Soledad",
        imagen: "img/libros/libro2.jpg"
    },
    "la princesa prometida": {
        titulo: "La princesa prometida",
        imagen: "img/libros/libro3.jpg"
    },
    "harry potter y la piedra filosofal": {
        titulo: "Harry Potter y la Piedra Filosofal",
        imagen: "img/libros/libro4.jpg"
    },
    "harry potter y la cámara de los secretos": {
        titulo: "Harry Potter y la Cámara de los Secretos",
        imagen: "img/libros/libro5.jpg"
    }
};

function startRecognition() {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = "es-ES";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.start();

    recognition.onresult = function (event) {
        const resultado = event.results[0][0].transcript.toLowerCase().trim();
        console.log("Comando reconocido:", resultado);

        const currentPage = window.location.pathname;
        console.log(currentPage);

        if (currentPage.includes("galeria_personal.html")) {
            if (resultado.includes("añadir libro")) {
                window.location.href = "marketplace.html";
            } else if (resultado.includes("información libro")) {
                window.location.href = "informacion_libro.html";
            } else {
                alert("Comando no reconocido: " + resultado);
            }
        } else if (currentPage.includes("marketplace.html")) {
            if (librosDisponibles[resultado]) {
                // Guardar el libro en localStorage
                const librosGuardados = JSON.parse(localStorage.getItem("librosUsuario")) || [];
                librosGuardados.push(librosDisponibles[resultado]);
                localStorage.setItem("librosUsuario", JSON.stringify(librosGuardados));

                alert(`Libro añadido: ${librosDisponibles[resultado].titulo}`);
                window.location.href = "galeria_personal.html";
            } else {
                alert("Libro no reconocido. Intenta decir el título exactamente.");
                recognition.stop(); // Opcionalmente puedes reiniciarlo si quieres seguir escuchando
            }
        }
    };

    recognition.onerror = function (event) {
        console.error("Error en el reconocimiento de voz:", event.error);
    };
}


//////////////
window.addEventListener("DOMContentLoaded", () => {
    const contenedor = document.getElementById("galeria-libros");
    const libros = JSON.parse(localStorage.getItem("librosUsuario")) || [];

    libros.forEach(libro => {
        const libroHTML = `
            <a class="libro" href="informacion_libro.html">
                <img src="${libro.imagen}" alt="${libro.titulo}">
                <h2>${libro.titulo}</h2>
            </a>
        `;
        contenedor.innerHTML += libroHTML;
    });
});


//////////////
window.addEventListener("DOMContentLoaded", () => {
    const currentPage = window.location.pathname;

    if (currentPage.includes("marketplace.html")) {
        startRecognition();
    }
});

