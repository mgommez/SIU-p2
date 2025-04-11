///////////////////////////////////////////
/*
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
*/
/*
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

///////////////

async function obtenerLibrosMarketplace() {
    const res = await fetch('/api/libros');
    return await res.json();
}

async function guardarLibroUsuario(libro) {
    const res = await fetch('/api/lecturas_usuario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(libro)
    });

    if (res.ok) {
        alert(`Libro añadido: ${libro.titulo}`);
        window.location.href = "galeria_personal.html";
    } else {
        alert("Error al guardar el libro");
    }
}

// Ejemplo de uso con reconocimiento de voz:
function manejarResultadoReconocimiento(resultado) {
    obtenerLibrosMarketplace().then(libros => {
        const resultadoLibro = libros.find(libro =>
            resultado.includes(libro.titulo.toLowerCase())
        );

        if (resultadoLibro) {
            guardarLibroUsuario(resultadoLibro);
        } else {
            alert("Libro no reconocido. Intenta decir el título exactamente.");
        }
    });
}

/////////////////////
// Mostrar libros en galeria_personal.html desde el servidor
window.addEventListener("DOMContentLoaded", () => {
    const currentPage = window.location.pathname;

    if (currentPage.includes("galeria_personal.html")) {
        fetch('/api/lecturas_usuario')
            .then(res => res.json())
            .then(libros => {
                const contenedor = document.getElementById("galeria-libros");
                contenedor.innerHTML = ''; // Limpiar contenido anterior si lo hubiera

                libros.forEach(libro => {
                    const libroHTML = `
                        <a class="libro" href="informacion_libro.html">
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
    }
});
*/

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

        if (currentPage.includes("galeria_personal.html")) {
            if (resultado.includes("añadir libro")) {
                window.location.href = "marketplace.html";
            } else if (resultado.includes("información libro")) {
                window.location.href = "informacion_libro.html";
            } else {
                alert("Comando no reconocido: " + resultado);
            }
        } else if (currentPage.includes("marketplace.html")) {
            manejarResultadoReconocimiento(resultado);
        }
    };

    recognition.onerror = function (event) {
        console.error("Error en el reconocimiento de voz:", event.error);
    };
}

async function obtenerLibrosMarketplace() {
    const res = await fetch('/api/libros');
    if (!res.ok) throw new Error("Error al cargar libros");
    return await res.json();
}

async function guardarLibroUsuario(libro) {
    const res = await fetch('/api/lecturas_usuario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(libro)
    });

    if (res.ok) {
        alert(`Libro añadido: ${libro.titulo}`);
        window.location.href = "galeria_personal.html";
    } else {
        alert("Error al guardar el libro");
    }
}

function manejarResultadoReconocimiento(resultado) {
    obtenerLibrosMarketplace()
        .then(libros => {
            const libroEncontrado = libros.find(libro =>
                resultado.includes(libro.titulo.toLowerCase())
            );

            if (libroEncontrado) {
                guardarLibroUsuario(libroEncontrado);
            } else {
                alert("Libro no reconocido. Intenta decir el título exactamente.");
            }
        })
        .catch(err => {
            console.error("Error al buscar el libro:", err);
        });
}

window.addEventListener("DOMContentLoaded", () => {
    const currentPage = window.location.pathname;

    if (currentPage.includes("marketplace.html")) {
        mostrarLibrosMarketplace();
        startRecognition();
    }

    if (currentPage.includes("galeria_personal.html")) {
        mostrarLecturasUsuario();
        startRecognition();
    }
});

async function mostrarLibrosMarketplace() {
    try {
        const libros = await obtenerLibrosMarketplace();
        const contenedor = document.querySelector(".galeria");
        contenedor.innerHTML = "";

        libros.forEach(libro => {
            const libroHTML = `
                <a class="libro" href="informacion_libro.html">
                    <img src="${libro.imagen}" alt="${libro.titulo}">
                    <h2>${libro.titulo}</h2>
                </a>
            `;
            contenedor.innerHTML += libroHTML;
        });
    } catch (err) {
        console.error("Error al cargar libros del marketplace:", err);
    }
}

async function mostrarLecturasUsuario() {
    try {
        const res = await fetch('/api/lecturas_usuario');
        const libros = await res.json();
        const contenedor = document.getElementById("galeria-libros");
        contenedor.innerHTML = "";

        libros.forEach(libro => {
            const libroHTML = `
                <a class="libro" href="informacion_libro.html">
                    <img src="${libro.imagen}" alt="${libro.titulo}">
                    <h2>${libro.titulo}</h2>
                </a>
            `;
            contenedor.innerHTML += libroHTML;
        });
    } catch (err) {
        console.error("Error al cargar libros del usuario:", err);
    }
}

