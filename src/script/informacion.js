
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

  async function ObtenerValoracion() {
    try {
        const response = await fetch('/api/lecturas_usuario');
        const biblioteca = await response.json();
        const titulo = localStorage.getItem("titulo");
        const libro = biblioteca.find(l => l.titulo.toLowerCase() === titulo.toLowerCase());
        return parseInt(libro.valoracion);
    } catch (error) {
        console.error("Error:", error);
    }
}

window.addEventListener("DOMContentLoaded", () => {
    ObtenerDatosLibro().then(libro => {
        if(libro){
            //Escritura en localStorage
            localStorage.setItem("titulo", libro.titulo);

            // Actualizamos el contenido de la página con los datos del libro
            document.getElementById('imagen-libro').src = libro.imagen;
            document.getElementById('titulo-libro').textContent = libro.titulo;
            document.getElementById('nombre-autor').textContent = libro.autor;
            document.getElementById('sinopsis').textContent = libro.sinopsis;

            //impresión de la valoración
            ObtenerValoracion().then(valoracion => {
                const stars = document.querySelectorAll(".star-button");
                stars.forEach(star =>{
                    if (parseInt(star.dataset.value) <= valoracion){
                        star.style.color = "orange";
                    }
                    else{
                        star.style.color = "var(--medium-gray)"
                    }
            });
            
    });
           
        }

        else{
            console.log("No se ha encontrado el libro");
        }

    });


});


async function añadirValoracion(event){
    //lectura de la valoración
    const valor = parseInt(event.target.dataset.value);

    //guardamos el dato en el dataset
    const titulo_libro = localStorage.getItem("titulo");

    try {
        const response = await fetch('api/lecturas_usuario', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ titulo: titulo_libro, valoracion: valor }) 
        });
       
        const resultado = await response.json();
        console.log('Valoración guardada:', resultado);
    } catch (error) {
        console.error('Error al guardar la valoración:', error);
    }

    //imprimimos los cambios por pantalla
    const stars = document.querySelectorAll(".star-button");
    stars.forEach(star =>{
        if (parseInt(star.dataset.value) <= valor){
            star.style.color = "orange";
        }
        else{
            star.style.color = "var(--medium-gray)"
        }
    });

    //notificamos al usuario
    showNotification(`Valoración añadida: ${valor}/5`);

}

function showNotification(message) {
    const container = document.getElementById("notification-container");

    // Crear el contenido de la notificación
    const notification = document.createElement("div");
    notification.className = "notification";

    const messageElement = document.createElement("p");
    messageElement.textContent = message;

}
function closeNotification(container) {
    container.classList.remove("active"); // Ocultar notificación
    container.innerHTML = ""; // Limpiar contenido
}