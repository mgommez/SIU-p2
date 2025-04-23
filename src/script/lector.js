//GESTIÓN DE LECTURA

const caracteresLibro = 200;

let endBook = false;
let palabrasPorPagina = caracteresLibro;
let textoLibroGlobal = "";
let paginas = [];
let paginas_audio = [];

const socket = io();

//funciones auxiliares

async function obtenerDatos() {
    try {
        const response = await fetch('/api/libros');
        const biblioteca = await response.json();
        const titulo = localStorage.getItem("titulo");
        const libro = biblioteca.find(l => l.titulo.toLowerCase() === titulo.toLowerCase());
        textoLibroGlobal = libro.texto;
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
        return parseInt(libro.marcador);
    } catch (error) {
        console.error("Error:", error);
    }
}


function generarPaginas(texto, palabrasPorPagina){
    const text_in_words = texto.split(/(\n|\t)| +/).filter(x => x && x.trim() !== '');

    let ini_pag =0;
    let fin_pag = palabrasPorPagina;
    const paginas_totales = Math.ceil(text_in_words.length / palabrasPorPagina);

    let lista = [];
    for(let i=0; i < paginas_totales; i++){
        lista.push(text_in_words.slice(ini_pag, fin_pag).join(' '));
        ini_pag += palabrasPorPagina;
        fin_pag += palabrasPorPagina;
    }

    return lista;
}

function actualizarPagina(pagina_actual){
    const paginas_totales = paginas.length;
    document.getElementById('page-counter').textContent = `página: ${pagina_actual} / ${paginas_totales}`;

    const progressBar = document.getElementById('progress-bar');
    if (progressBar) {
        
        progressBar.value = ((pagina_actual) / paginas_totales) * 100;
    }
}

async function calcularPalabrasPorPagina(texto, contenedor_id) {
    const text_in_words = texto.split(/\s+/);
    const contenedor = document.getElementById(contenedor_id);
    let min = 50;
    let max = text_in_words.length;
    let resultado = 1;
  
    const spanTester = document.createElement("div");
    spanTester.style.visibility = "hidden";  // Contenedor oculto pero renderizado
    spanTester.style.position = "absolute";
    spanTester.style.width = contenedor.offsetWidth + "px";
    spanTester.style.font = window.getComputedStyle(contenedor).font;
    spanTester.style.lineHeight = window.getComputedStyle(contenedor).lineHeight;
    document.body.appendChild(spanTester);
  
    // Búsqueda binaria para encontrar el máximo sin desbordar
    while (min <= max) {
      const mid = Math.ceil((min + max) / 2);
      spanTester.innerText = text_in_words.slice(0, mid).join(" ");
  
      if (spanTester.scrollHeight > contenedor.clientHeight) {
        // Hay desbordamiento → reduce
        max = mid - 1;
      } else {
        resultado = mid;
        min = mid + 1;
      }
    }
  
    document.body.removeChild(spanTester);
    return resultado;
  }

//GESTIÓN DE EVENTOS DE LECTURA

const ajustarPaginasPantalla = async () => {
    const [libro, posicion] = await Promise.all([obtenerDatos(), obtenerMarcapaginas()]);
    
    document.getElementById('book_title').textContent = libro.titulo;
    document.getElementById('author-name').textContent = libro.autor;

    //generación de páginas escritas
    await calcularPalabrasPorPagina(libro.texto, 'paragraph-holder').then(palabrasPorPagina =>{
        localStorage.setItem("palabrasPorPagina", palabrasPorPagina);
        paginas = generarPaginas(libro.texto, palabrasPorPagina);
        marcador = Math.floor(posicion/palabrasPorPagina);
        console.log("mi nuevo marcador es: ", marcador, posicion, palabrasPorPagina);
    });
    
    if(marcador<paginas.length){ //las nuevas páginas son menos que en un renderización anterior
        localStorage.setItem("marcador", marcador);
        //Impresión de contenido
        document.getElementById('book_page').textContent = paginas[marcador];

        //Actualización páginas y marcador
        const pagina_actual = marcador+1;
        actualizarPagina(pagina_actual);
        
    }
    else{ //desbordamiento -impresión de la última página
        localStorage.setItem("marcador", paginas.length-1);
        //Impresión de contenido
        document.getElementById('book_page').textContent = paginas[paginas.length-1];

        //Actualización páginas y marcador
        const pagina_actual = paginas.length;
        actualizarPagina(pagina_actual);
   
    }

    
    //gestión de eventos -controles
    document.getElementById("boton-next").addEventListener("click", pasarPagina);
    document.getElementById("boton-prev").addEventListener("click", volverPagina);
    document.getElementById("boton-save").addEventListener("click", guardarMarcapaginas);

    //gestión de sincronización
    socket.emit('sincronizar-lectura', {
        sync_paginas: paginas,
        titulo_libro: localStorage.getItem("titulo"),
        marcador: marcador
    });
}
    

window.addEventListener("DOMContentLoaded", ajustarPaginasPantalla);

const pasarPagina = async () => {
    const marcador = parseInt(localStorage.getItem("marcador"));
    
    if (marcador + 1 < paginas.length) {
        const nuevo_marcador = marcador + 1;
        
        document.getElementById('book_page').textContent = paginas[nuevo_marcador];

        //Actualización nuevo marcador 
        socket.emit('cambiar-pagina', {
            titulo_libro: localStorage.getItem("titulo"),
            marcador: nuevo_marcador
        }) //sincronización

        localStorage.setItem("marcador", nuevo_marcador); //local.
        
        //Actualización páginas y progress bar
        pagina_actual = nuevo_marcador + 1; 
        actualizarPagina(pagina_actual);

        //gestión de audiolibro
        if (document.querySelector(".audiobook").classList.contains("audio-on")) {
            await guardarMarcapaginas();
        }

    } else {
        //FIN LIBRO
        endBook = true;
        console.log("Fin libro: ", endBook);
    }
}

const volverPagina = async () => {
    const marcador = parseInt(localStorage.getItem("marcador"));
    
    if (marcador !== 0) {
        const nuevo_marcador = marcador - 1;
        document.getElementById('book_page').textContent = paginas[nuevo_marcador];

        //Actualización nuevo marcador 
        socket.emit('cambiar-pagina', {
            titulo_libro: localStorage.getItem("titulo"),
            marcador: nuevo_marcador
        }) //sincronización

        localStorage.setItem("marcador", nuevo_marcador); //local.

        //Actualización páginas y progress bar
        const pagina_actual = nuevo_marcador + 1;
        actualizarPagina(pagina_actual);

        //Fin libro?
        if (endBook) {
            endBook = false;
        }
    }
}

const refrescarParagraph = async () => {
    const marcador = parseInt(localStorage.getItem("marcador"));
    console.log("desde refrescar, mi marcador es", marcador);

    const page_content = paginas[marcador];
    document.getElementById('book_page').textContent = page_content;

    const pagina_actual = marcador +1;
    actualizarPagina(pagina_actual);
}


//Sincronización
//caso 1: update de la página
socket.on('actualizar-pagina', ({titulo_libro, marcador}) => {
    if (titulo_libro == localStorage.getItem("titulo")) {
        console.log("Actualizando página sincronización...");
        localStorage.setItem("marcador", marcador);
        refrescarParagraph();
    }
});

//caso 2: sincronización de caracteres por pantalla
socket.on('sincronizar-lectura', ({sync_paginas, titulo_libro, marcador}) => {
    if (titulo_libro == localStorage.getItem("titulo")) {
        
        if(sync_paginas.length >= paginas.length){
            //si la solicitud tiene más páginas (menos caracteres por pantalla), renderi
            paginas = sync_paginas;
            console.log("Tengo menos páginas: actualizando página por sincronización...");
            console.log("mi nuevo marcador es", marcador);
            localStorage.setItem("marcador", marcador);
            refrescarParagraph();
        }
        else{
            //si el número de palabras de nuestro dispositivo es menor, emite un nuevo mensaje de sincronización
            socket.emit('sincronizar-lectura', {
                sync_paginas: paginas,
                titulo_libro: localStorage.getItem("titulo"),
                marcador: localStorage.getItem("marcador")
            });
        }
        
    }
}

);

//Persistencia marcapáginas
const guardarMarcapaginas = async () => {
    const titulo_libro = localStorage.getItem("titulo");
    const valor = localStorage.getItem("marcador");
    const palabras =localStorage.getItem("palabrasPorPagina");

    try {
        const response = await fetch('api/lecturas_usuario', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ titulo: titulo_libro, marcador: valor*palabras})
        });
        
        const resultado = await response.json();
        console.log('Marcapáginas guardado:', resultado);
    } catch (error) {
        console.error('Error al guardar el marcapáginas:', error);
    }
}

//GESTIÓN DE AUDIOLIBRO

const audio_speed = document.getElementById("audio-speed");

const particion = 4;
let particion_pos = 0;
let pagina_particionada = [];

const avanzarAudio = async () => {
    if ((particion_pos + 1) % particion != 0) {
        particion_pos += 1;
    } else {
        pasarPagina();

        const marcador = parseInt(localStorage.getItem("marcador"));
        pagina_particionada = generarPaginas(paginas[marcador], Math.ceil(palabrasPorPagina/particion));
        
        particion_pos = 0;

        console.log("Pagina particionada: ", pagina_particionada);
    }
}

const retrocederAudio = async () => {
    if ((particion_pos + 1) % particion == 1) {
        volverPagina();

        const marcador = parseInt(localStorage.getItem("marcador"));
        console.log("Vuelta marcador: ", marcador);
        pagina_particionada = generarPaginas(paginas[marcador], Math.ceil(palabrasPorPagina/particion));

        particion_pos = particion - 2;

        console.log("Pagina particionada: ", pagina_particionada);
    } else {
        particion_pos -= 1;
    }
}

const read_aloud = () => {
    console.log("Iniciando lectura...");
    const to_read = new SpeechSynthesisUtterance(pagina_particionada[particion_pos]);
    to_read.lang = "es-ES";
    to_read.rate = parseFloat(audio_speed.value);
    to_read.pitch = 1;

    to_read.onend = async () => {
        console.log("Fragmento leído");
        await avanzarAudio();
        await new Promise(resolve => setTimeout(resolve, 10));
        time_to_read();
    }

    speechSynthesis.speak(to_read);
}

const time_to_read = async () => {
    speechSynthesis.cancel();

    if (audio.classList.contains('audio-on') && !endBook) {
        read_aloud();
    }
}

const audio_handler = async () => {
    const audio = document.querySelector(".audiobook");
    const paragraph = document.querySelector(".paragraph-holder");
    const controls = document.querySelectorAll(".button-group--nav");

    audio.classList.toggle("audio-on");
    paragraph.classList.toggle("audio-off");

    controls.forEach((control) => {
        control.classList.toggle("audio-on--button-group");
    });
}

const boton_audio = document.getElementById("boton-audio");
boton_audio.addEventListener("click", audio_handler);

function reconocimiento_voz() {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = "es-ES";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    //mostrar opciones de comandos de voz
    const legend = document.getElementById('speech-legend-lector');
    legend.style.display = "block";
    setTimeout(()=>{
        legend.style.display = "none";
    }, 5000);

    recognition.start();

    recognition.onresult = function (event) {
        const resultado = event.results[0][0].transcript.toLowerCase().trim();
        if (resultado.includes("reproducir") || resultado.includes("detener")) {
            audio_handler();
        }
        

    };

    recognition.onerror = function (event) {
        console.error("Error en el reconocimiento de voz:", event.error);
    };
}

const audio = document.querySelector(".audiobook");

const observer = new MutationObserver((mutationsList) => {
    for (let mutation of mutationsList) {
        if (mutation.type === "attributes" && mutation.attributeName === "class") {
            const marcador = parseInt(localStorage.getItem("marcador"));
            pagina_particionada = generarPaginas(paginas[marcador], Math.ceil(palabrasPorPagina/particion));
            particion_pos = 0;

            time_to_read();
        }
    }
});
observer.observe(audio, { attributes: true });

//CONTROL AUDIO

//Velocidad audio
const audio_speed_handler = () => {
    document.getElementById("speed-label").textContent = "x" + audio_speed.value;

    const speed = parseFloat(audio_speed.value);
    socket.emit("cambiar-vel-audio", speed);
    time_to_read();
}

audio_speed.addEventListener("input", audio_speed_handler);

socket.on('actualizar-vel-audio', (speed) => {
    console.log("Sincronización velocidad de audio: ", speed);
    
    audio_speed.value = speed;
    document.getElementById("speed-label").textContent = "x" + audio_speed.value;

    time_to_read();
})

//Avanzar, retroceder audio.
const audio_next = document.getElementById("audio-next");
const audio_prev = document.getElementById("audio-prev");

const next_audio = async () => {
    await avanzarAudio();
    time_to_read();
}

const prev_audio = async () => {
    await retrocederAudio();
    time_to_read();
}

audio_next.addEventListener("click", next_audio);
audio_prev.addEventListener("click", prev_audio);

window.addEventListener('beforeunload', async () => {
    await guardarMarcapaginas(); 
    speechSynthesis.cancel();
});
