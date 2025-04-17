//GESTIÓN DE LECTURA

const caracteresPorPagina = 2000;



async function obtenerDatos() {
    try {
      const response = await fetch('/api/libros');
      const biblioteca = await response.json();
      const titulo = localStorage.getItem("titulo");
      const libro = biblioteca.find(l => l.titulo.toLowerCase() === titulo.toLowerCase());
      const texto = libro.texto;
      return libro;
    } catch (error) {
      console.error("Error:", error);
    }
  }

  
async function obtenerMarcapaginas() {
    try {
        const response = await fetch('/api/lecturas_usuario');
        const biblioteca = await response.json();
        const titulo = localStorage.getItem("titulo");
        const libro = biblioteca.find(l => l.titulo.toLowerCase() === titulo.toLowerCase());
        
        return libro.marcador;
    } catch (error) {
      console.error("Error:", error);
    }
  }



window.addEventListener("DOMContentLoaded", () => {
    obtenerMarcapaginas().then(marcador =>{
        localStorage.setItem("marcador", marcador);
        console.log("marcador es: ", marcador);
    });

    obtenerDatos().then(libro => {
        document.getElementById('book_title').textContent = libro.titulo;
        document.getElementById('author-name').textContent = libro.autor;
        

        //impresión de contenido desde el último punto de lectura
        obtenerMarcapaginas().then(marcador =>{
            const page_content = libro.texto.slice(marcador, marcador + caracteresPorPagina);
            document.getElementById('book_page').textContent = page_content;
            localStorage.setItem("marcador", marcador);

            //impresión de página
            const paginas_totales = Math.ceil(libro.texto.length/caracteresPorPagina);
            const pagina_actual = Math.ceil((parseInt(marcador)+1)/caracteresPorPagina);
            document.getElementById('page-counter').textContent = `página: ${pagina_actual} / ${paginas_totales}`;
            localStorage.setItem("paginas_totales", paginas_totales);
            localStorage.setItem("pagina_actual", pagina_actual);
            console.log("paginas actual y totales: ", pagina_actual, paginas_totales);

        });
        
        
        
      });
      
    document.getElementById("boton-next").addEventListener("click", pasarPagina);
    document.getElementById("boton-prev").addEventListener("click", volverPagina);
    document.getElementById("boton-save").addEventListener("click", guardarMarcapaginas)

});


//Evento paso de página
const pasarPagina = () => {

    console.log("Estoy pasando página");
    //leemos el punto de lectura actual
    const marcador = parseInt(localStorage.getItem("marcador"));
    
    //acceso a los datos del libro
    obtenerDatos().then(libro => {
   
        if(marcador + caracteresPorPagina < libro.texto.length){
            //caso 1: marcador al principio o en medio del libro
            
            // Segmentación e impresión del bloque a imprimir 
            let page_content = libro.texto.slice(marcador + caracteresPorPagina,  marcador + caracteresPorPagina*2);
            document.getElementById('book_page').textContent = page_content;
            document.getElementById('page-counter').textContent = 
            //actualización del punto de lectura
            localStorage.setItem("marcador", marcador + caracteresPorPagina);

            //actualización de la página
            const paginas_totales = localStorage.getItem("paginas_totales");
            const  pagina_actual = parseInt(localStorage.getItem("pagina_actual")) + 1;
            document.getElementById('page-counter').textContent = `página: ${pagina_actual} / ${paginas_totales}`;
            localStorage.setItem("pagina_actual", pagina_actual);
        }
        //caso 2: marcador al final del libro, no se hace nada
        
        
            
        console.log("marcador", marcador , "nuevo marcador", marcador + caracteresPorPagina, "longitud", libro.texto.length);

    });
}

//Evento retroceso de página
const volverPagina = () => {

    console.log("Estoy volviendo la página");
    //leemos el punto de lectura actual
    const marcador = parseInt(localStorage.getItem("marcador"));
    
    //acceso a los datos del libro
    obtenerDatos().then(libro => {
        //PASO 1: estrategia de paso de página

        let nuevo_marcador = marcador
        if(marcador !=0){
            //caso 1: marcador en medio del libro
            nuevo_marcador = marcador - caracteresPorPagina;
            console.log("nuevo marcador", nuevo_marcador, "marcador", marcador);

            let page_content = libro.texto.slice(nuevo_marcador, marcador);
            document.getElementById('book_page').textContent = page_content;
            //actualización del punto de lectura
            localStorage.setItem("marcador", nuevo_marcador);

            //actualización de la página
            const paginas_totales = localStorage.getItem("paginas_totales");
            const  pagina_actual = parseInt(localStorage.getItem("pagina_actual")) - 1;
            document.getElementById('page-counter').textContent = `página: ${pagina_actual} / ${paginas_totales}`;
            localStorage.setItem("pagina_actual", pagina_actual);
        }
        //caso 2: el marcador ya es 0, no cambia nada. 
        
        console.log("marcador", marcador , "nuevo marcador", nuevo_marcador, "longitud", libro.texto.length);
    
    });
}


//Evento guardado de pagina
const guardarMarcapaginas = async() => {
    const titulo_libro = localStorage.getItem("titulo");
    const valor = localStorage.getItem("marcador");
    try {
        const response = await fetch('api/lecturas_usuario', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ titulo: titulo_libro, marcador: valor})
        });
    

        const resultado = await response.json();
        console.log('Marcapáginas guardado:', resultado);
    } catch (error) {
        console.error('Error al guardar el marcapáginas:', error);
    }
}



//GESTIÓN DE AUDIOLIBRO

const time_to_read = () => {

    speechSynthesis.cancel()
    if (audio.classList.contains('audio-on')) {

        console.log("Iniciando lectura...");
        const to_read = new SpeechSynthesisUtterance(document.getElementById('book_page').textContent);
        to_read.lang = "es-ES";
        to_read.rate = 1;
        to_read.pitch = 1;
        to_read.onend = () => {
            console.log("Fragmento leído");
            pasarPagina();
            setTimeout(() => {
                time_to_read();;
            }, 100);
        }
        
        speechSynthesis.speak(to_read);
        
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

window.addEventListener('beforeunload', () => {
    speechSynthesis.cancel();
    guardarMarcapaginas();
});
