
async function ObtenerDatosLibro() {
    try {
        //lectura de los datos
        const response = await fetch('/api/libros');
        if (!response.ok) {
            throw new Error(`Error al leer json libros: ${response.statusText}`);
          }

        const biblioteca = await response.json();
        
        //lectura de título de la url
        const params = new URLSearchParams(window.location.search);
        const titulo = params.get('titulo');


        //obtención de datos
        const libro = biblioteca.find(l => l.titulo.toLowerCase() === titulo.toLowerCase());
        return libro;

    } catch (error) {
        console.error("Error en ObtenerDatosLibro:", error);
    }
  }

window.addEventListener("DOMContentLoaded", () => {
    ObtenerDatosLibro().then(libro => {
        if(libro){
            //Escritura en localStorage
            localStorage.setItem("titulo", libro.titulo);

            // Actualizamos el contenido de la página con los datos del libro
            document.getElementById('titulo-libro').textContent = libro.titulo;
            document.getElementById('nombre-autor').textContent = libro.autor;
            document.getElementById('sinopsis').textContent = libro.sinopsis;
            document.getElementById('valoracion').textContent = libro.valoracion;
        }

        else{
            console.log("No se ha encontrado el libro");
        }

    });


});
