window.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const tituloLibro = params.get('titulo'); // Obtiene el título del libro desde la URL
   

    if (tituloLibro) {
        fetch('/api/lecturas_usuario')  // Asegúrate de tener la ruta correcta al archivo JSON
            .then(res => res.json())
            .then(libros => {
                
                localStorage.setItem("titulo", tituloLibro);
                const libro = libros.find(l => l.titulo.toLowerCase() === tituloLibro.toLowerCase());

                if (libro) {
                    // Actualizamos el contenido de la página con los datos del libro
                    document.getElementById('titulo-libro').textContent = libro.titulo;
                    document.getElementById('nombre-autor').textContent = libro.autor;
                    document.getElementById('sinopsis').textContent = libro.sinopsis;
                    document.getElementById('valoracion').textContent = libro.valoracion;
                    /*
                    // Mostrar las reseñas -> habría que añadir un <div id="resena"> en el html
                    const resenasContainer = document.getElementById('resenas');
                    libro.resenas.forEach(resena => {
                        const resenaHTML = `
                            <div class="resena">
                                <div class="info-resenas">
                                    <h4>${resena.nombre}</h4>
                                    <p class="valoracion">${resena.valoracion}/5</p>
                                </div>
                                <p>${resena.comentario}</p>
                            </div>
                        `;
                        resenasContainer.innerHTML += resenaHTML;
                    });
                    */
                } else {
                    alert("Libro no encontrado.");
                }
            })
            .catch(err => {
                console.error("Error al cargar los datos del libro:", err);
            });
    }
});
