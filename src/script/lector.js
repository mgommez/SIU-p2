//GESTIÓN DE LECTURA

const caracteresPorPagina = 2000;

async function obtenerDatos() {
    try {
      const response = await fetch('/api/libros');
      const biblioteca = await response.json();
      const titulo = localStorage.getItem("titulo");
      const libro = biblioteca.find(l => l.titulo.toLowerCase() === titulo.toLowerCase());
      const texto = libro.texto;
      console.log("titulo: ", titulo, "texto: ", texto);
      return libro;
    } catch (error) {
      console.error("Error:", error);
    }
  }

window.addEventListener("DOMContentLoaded", () => {
    obtenerDatos().then(libro => {
        document.getElementById('book_title').textContent = libro.titulo;
        const page_content = libro.texto.slice(0,caracteresPorPagina);
        document.getElementById('book_page').textContent = page_content;
        localStorage.setItem("marcapaginas", caracteresPorPagina);
        
      });
      
    document.getElementById("boton-next").addEventListener("click", pasarPagina);

});

//Evento paso de página
const pasarPagina = () => {

    console.log("Estoy pasando página");
    const marcador = localStorage.getItem("marcapaginas");
    
    obtenerDatos().then(libro => {
    page_content = libro.texto.slice(marcador, marcador + caracteresPorPagina);
    document.getElementById('book_page').textContent = page_content;
    localStorage.setItem("marcapaginas", marcador + caracteresPorPagina);
    });
}



//GESTIÓN DE AUDIOLIBRO

const time_to_read = () => {

    if (audio.classList.contains('audio-on')) {
        console.log("Iniciando lectura...");
        const to_read = new SpeechSynthesisUtterance(document.getElementById('book_page').textContent);
        to_read.lang = "es-ES";
        to_read.rate = 1;
        to_read.pitch = 1;
        speechSynthesis.cancel();
        speechSynthesis.speak(to_read);
        //adelantar marcador.
    } else {
        console.log("Finalizando lectura...");
        speechSynthesis.cancel()
        //no se cambia el marcador.
    }
}

const prueba = () => {
    const audio = document.querySelector(".audiobook");
    const paragraph = document.querySelector(".paragraph");

    console.log("Botón pulsado");
    if (audio.classList.contains("audio-on")) {
        console.log("Finalizar evento de audiolibro");
        audio.classList.remove("audio-on");
        paragraph.classList.add("audio-off");
    } else {
        console.log("Lanzar evento de inicio de audiolibro");
        audio.classList.add("audio-on");
        paragraph.classList.remove("audio-off");
    }
}

//Evento activación audiolibro
const boton_audio = document.querySelector(".prueba");
boton_audio.addEventListener("click", prueba);

//Modo audiolibro
const audio = document.querySelector(".audiobook");

const observer = new MutationObserver((mutationsList) => {
    for (let mutation of mutationsList) {
        if (mutation.type === "attributes" && mutation.attributeName === "class") {
            time_to_read()
        }
    }
})
observer.observe(audio, {attributes: true})

