

function showNotification(message, onConfirm = null, onCancel = null) {
    const container = document.getElementById("notification-container");

    // Crear el contenido de la notificación
    const notification = document.createElement("div");
    notification.className = "notification";

    const messageElement = document.createElement("p");
    messageElement.textContent = message;

    // Añadir el botón de "Cancelar"
    const cancelButton = document.createElement("button");
    cancelButton.textContent = "Cancelar";
    cancelButton.onclick = () => {
        if (onCancel) onCancel();
        closeNotification(container);
    };

    notification.appendChild(messageElement);

    // Si se proporciona una función de confirmación, añadir el botón "Confirmar"
    if (onConfirm) {
        const confirmButton = document.createElement("button");
        confirmButton.textContent = "Confirmar";
        confirmButton.onclick = () => {
            onConfirm();
            closeNotification(container);
        };
        notification.appendChild(confirmButton);
    }

    notification.appendChild(cancelButton);

    // Añadir la notificación al contenedor
    container.appendChild(notification);
    container.classList.add("active"); // Mostrar notificación

    // Iniciar reconocimiento de voz si hay confirmación o cancelación
    if (onConfirm || onCancel) {
        startVoiceConfirmation(onConfirm, onCancel, container);
    }
}
function closeNotification(container) {
    container.classList.remove("active"); // Ocultar notificación
    container.innerHTML = ""; // Limpiar contenido
}

function startVoiceConfirmation(onConfirm, onCancel, container) {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = "es-ES";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.start();

    recognition.onresult = function (event) {
        const resultado = event.results[0][0].transcript.toLowerCase().trim();
        console.log("Comando de voz reconocido:", resultado);

        if (resultado.includes("confirmar")) {
            onConfirm();
            closeNotification(container);
        } else if (resultado.includes("cancelar")) {
            if (onCancel) onCancel();
            closeNotification(container);
        }
    };

    recognition.onerror = function (event) {
        console.error("Error en el reconocimiento de voz:", event.error);
    };
}

function startRecognition() {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = "es-ES";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    // Mostrar opciones de comandos de voz
    const legend = document.getElementById('speech-legend');
    if (legend) { // Verificar si el elemento existe
        legend.style.display = "block";
        setTimeout(() => {
            legend.style.display = "none";
        }, 5000); // Ocultar después de 5 segundos
    }

    recognition.start();

    recognition.onresult = function (event) {
        const resultado = event.results[0][0].transcript.toLowerCase().trim();
        console.log("Comando reconocido:", resultado);

        const currentPage = window.location.pathname;

        if (currentPage.includes("galeria_personal.html")) {
            if (resultado.includes("añadir libro")) {
                window.location.href = "marketplace.html";
            } else if (resultado.includes("información")) {
                const tituloLibro = resultado.replace("información", "").trim();
                window.location.href = `informacion_libro.html?titulo=${encodeURIComponent(tituloLibro)}`;
            } else if (resultado.includes("borrar")) {
                const tituloLibro = resultado.replace("borrar", "").trim();
                borrarLibroUsuario(tituloLibro);
            } else {
                alert("Comando no reconocido: " + resultado);
            }
        } else if (currentPage.includes("marketplace.html")) {
            if (resultado.includes("cancelar")) {
                window.location.href = "galeria_personal.html";
            } else {
                manejarResultadoReconocimiento(resultado, recognition);
            }
        }
    };

    recognition.onerror = function (event) {
        console.error("Error en el reconocimiento de voz:", event.error);
    };
}

async function borrarLibroUsuario(titulo) {
    const res = await fetch('/api/lecturas_usuario');
    const libros = await res.json();

    const libroExiste = libros.find(libro =>
        libro.titulo.toLowerCase() === titulo.toLowerCase()
    );

    if (!libroExiste) {
        showNotification(
            "No se encontró el libro en tu galería.",
            null, // No hay confirmación
            () => {
                console.log("Operación cancelada. Notificación cerrada.");
            }
        );
        return;
    }

    showNotification(
        `¿Estás segura de que quieres borrar el libro "${titulo}" de tu galería personal?`,
        async () => {
            const nuevosLibros = libros.filter(libro =>
                libro.titulo.toLowerCase() !== titulo.toLowerCase()
            );

            const deleteRes = await fetch('/api/lecturas_usuario', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(nuevosLibros)
            });

            if (deleteRes.ok) {
                showNotification(`Libro eliminado: ${titulo}`);
                window.location.reload();
            } else {
                showNotification("Error al eliminar el libro.");
            }
        },
        () => {
            console.log("Operación cancelada. Notificación cerrada.");
        }
    );
}

async function obtenerLibrosMarketplace() {
    const res = await fetch('/api/libros');
    return await res.json();
}

async function obtenerLecturasUsuario() {
    const res = await fetch('/api/lecturas_usuario');
    return await res.json();
}

async function guardarLibroUsuario(libro) {
    showNotification(
        `¿Estás segura de que quieres añadir el libro "${libro.titulo}" a tu galería personal?`,
        async () => {
            // Acción al confirmar
            const res = await fetch('/api/lecturas_usuario', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(libro)
            });

            if (res.ok) {
                showNotification(`Libro añadido: ${libro.titulo}`);
                window.location.href = "galeria_personal.html"; // Redirigir a la galería personal
            } else {
                showNotification("Error al guardar el libro.", null, () => {});
            }
        },
        () => {
            // Acción al cancelar
            console.log("Operación cancelada. Redirigiendo a la galería personal...");
            window.location.href = "galeria_personal.html"; // Redirigir a la galería personal
        }
    );
}

function manejarResultadoReconocimiento(resultado, recognition) {
    Promise.all([obtenerLibrosMarketplace(), obtenerLecturasUsuario()])
        .then(([librosMarketplace, lecturasUsuario]) => {
            const resultadoLibro = librosMarketplace.find(libro =>
                resultado.includes(libro.titulo.toLowerCase())
            );

            if (!resultadoLibro) {
                showNotification("Libro no reconocido. Intenta decir el título exactamente.", null, () => {
                    console.log("Notificación cerrada.");
                });
                startRecognition(); // Reanudar escucha
                return;
            }

            const yaExiste = lecturasUsuario.some(libro =>
                libro.titulo.toLowerCase() === resultadoLibro.titulo.toLowerCase()
            );

            if (yaExiste) {
                showNotification("Este libro ya está en tu galería personal. Elige otro o di 'Cancelar'.", null, () => {
                    console.log("Notificación cerrada.");
                });
                startRecognition(); // Reanudar escucha
            } else {
                const nueva_entrada = {
                    titulo: resultadoLibro.titulo,
                    imagen: resultadoLibro.imagen,
                    marcador: 0, 
                    valoracion: 0,
                }
                guardarLibroUsuario(nueva_entrada);
            }
        })
        .catch(err => {
            console.error("Error en el manejo de libros:", err);
        });
}

window.addEventListener("DOMContentLoaded", () => {
    const currentPage = window.location.pathname;

    if (currentPage.includes("galeria_personal.html")) {
        fetch('/api/lecturas_usuario')
            .then(res => res.json())
            .then(libros => {
                const contenedor = document.getElementById("galeria-libros");
                contenedor.innerHTML = '';

                libros.forEach(libro => {
                    
                    const libroHTML = `
                        <a class="libro" href="informacion_libro.html?titulo=${encodeURIComponent(libro.titulo)}">
                            <img src="${libro.imagen}" alt="${libro.titulo}">
                            <h2>${libro.titulo}</h2>
                        </a>
                    `;
                    contenedor.innerHTML += libroHTML;
                });
            })
            .catch(err => {
                console.error("Error cargando libros del usuario:", err);
            });
    }

    if (currentPage.includes("marketplace.html")) {
        startRecognition();
    
        fetch('/api/libros')
            .then(res => res.json())
            .then(libros => {
                const contenedor = document.getElementById("galeria-marketplace");
                contenedor.innerHTML = '';
    
                libros.forEach(libro => {
                    const libroHTML = `
                        <div class="libro">
                            <img src="${libro.imagen}" alt="${libro.titulo}">
                            <h2>${libro.titulo}</h2>
                        </div>
                    `;
                    contenedor.innerHTML += libroHTML;
                });
            })
            .catch(err => {
                console.error("Error cargando libros del marketplace:", err);
            });
    }
    
});
