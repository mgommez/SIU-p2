/*function startRecognition() {
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
            } else if (resultado.includes("borrar")) {
                const tituloLibro = resultado.replace("borrar", "").trim();
                borrarLibroUsuario(tituloLibro);           
            } else {
                alert("Comando no reconocido: " + resultado);
            }
        } else if (currentPage.includes("marketplace.html")) {
            if (resultado.includes("cancelar")) {
                alert("Se ha cancelado el proceso.");
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
    try {
        const res = await fetch('/api/lecturas_usuario');
        let libros = await res.json();

        const libroExiste = libros.find(libro =>
            libro.titulo.toLowerCase() === titulo.toLowerCase()
        );

        if (!libroExiste) {
            alert(`No se encontró el libro "${titulo}" en tu galería.`);
            startRecognition();
            return;
        }

        const nuevosLibros = libros.filter(libro =>
            libro.titulo.toLowerCase() !== titulo.toLowerCase()
        );

        const deleteRes = await fetch('/api/lecturas_usuario', {
            method: 'PUT', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nuevosLibros)
        });

        if (deleteRes.ok) {
            alert(`Libro eliminado: ${libroExiste.titulo}`);
            window.location.reload();
        } else {
            alert("Error al eliminar el libro.");
        }
    } catch (err) {
        console.error("Error eliminando libro:", err);
    }
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

function manejarResultadoReconocimiento(resultado, recognition) {
    Promise.all([obtenerLibrosMarketplace(), obtenerLecturasUsuario()])
        .then(([librosMarketplace, lecturasUsuario]) => {
            const resultadoLibro = librosMarketplace.find(libro =>
                resultado.includes(libro.titulo.toLowerCase())
            );

            if (!resultadoLibro) {
                alert("Libro no reconocido. Intenta decir el título exactamente.");
                startRecognition(); // Reanudar escucha
                return;
            }

            const yaExiste = lecturasUsuario.some(libro =>
                libro.titulo.toLowerCase() === resultadoLibro.titulo.toLowerCase()
            );

            if (yaExiste) {
                alert("Este libro ya está en tu galería personal. Elige otro o di 'Cancelar'.");
                startRecognition(); // Reanudar escucha
            } else {
                guardarLibroUsuario(resultadoLibro);
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

