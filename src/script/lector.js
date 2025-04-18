//GESTIÓN DE LECTURA

const caracteresLibro = 1000;
const caracteresAudiolibro = 150;

let caracteresPorPagina = caracteresLibro;
let textoLibroGlobal = "";

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
        return libro.marcador;
    } catch (error) {
        console.error("Error:", error);
    }
}

window.addEventListener("DOMContentLoaded", async () => {
    const [libro, marcador] = await Promise.all([obtenerDatos(), obtenerMarcapaginas()]);
    localStorage.setItem("marcador", marcador);
    document.getElementById('book_title').textContent = libro.titulo;
    document.getElementById('author-name').textContent = libro.autor;

    const page_content = libro.texto.slice(marcador, marcador + caracteresPorPagina);
    document.getElementById('book_page').textContent = page_content;

    const paginas_totales = Math.ceil(libro.texto.length / caracteresPorPagina);
    const pagina_actual = Math.ceil((parseInt(marcador) + 1) / caracteresPorPagina);
    document.getElementById('page-counter').textContent = `página: ${pagina_actual} / ${paginas_totales}`;

    localStorage.setItem("paginas_totales", paginas_totales);
    localStorage.setItem("pagina_actual", pagina_actual);

    document.getElementById("boton-next").addEventListener("click", pasarPagina);
    document.getElementById("boton-prev").addEventListener("click", volverPagina);
    document.getElementById("boton-save").addEventListener("click", guardarMarcapaginas);
});

const pasarPagina = async () => {
    const marcador = parseInt(localStorage.getItem("marcador"));
    const libro = await obtenerDatos();

    if (marcador + caracteresPorPagina < libro.texto.length) {
        let nuevo_marcador = marcador + caracteresPorPagina;
        let page_content = libro.texto.slice(nuevo_marcador, nuevo_marcador + caracteresPorPagina);
        document.getElementById('book_page').textContent = page_content;

        localStorage.setItem("marcador", nuevo_marcador);

        const paginas_totales = Math.ceil(libro.texto.length / caracteresPorPagina);
        const pagina_actual = Math.ceil((nuevo_marcador + 1) / caracteresPorPagina);

        const progressBar = document.getElementById('progress-bar');
        if (progressBar) {
            progressBar.value = (nuevo_marcador / libro.texto.length) * 100;
        }

        document.getElementById('page-counter').textContent = `página: ${pagina_actual} / ${paginas_totales}`;
        localStorage.setItem("pagina_actual", pagina_actual);
        localStorage.setItem("paginas_totales", paginas_totales);

        if (document.querySelector(".audiobook").classList.contains("audio-on")) {
            await guardarMarcapaginas();
        }
    }
}

const volverPagina = async () => {
    const marcador = parseInt(localStorage.getItem("marcador"));
    const libro = await obtenerDatos();

    if (marcador !== 0) {
        let nuevo_marcador = marcador - caracteresPorPagina;
        let page_content = libro.texto.slice(nuevo_marcador, marcador);
        document.getElementById('book_page').textContent = page_content;

        localStorage.setItem("marcador", nuevo_marcador);

        const paginas_totales = Math.ceil(libro.texto.length / caracteresPorPagina);
        const pagina_actual = Math.ceil((nuevo_marcador + 1) / caracteresPorPagina);

        document.getElementById('page-counter').textContent = `página: ${pagina_actual} / ${paginas_totales}`;
        document.getElementById('progress-bar').value = (nuevo_marcador / libro.texto.length) * 100;

        localStorage.setItem("pagina_actual", pagina_actual);
    }
}

const refrescarParagraph = async () => {
    const marcador = parseInt(localStorage.getItem("marcador"));
    const texto = textoLibroGlobal;

    const page_content = texto.slice(marcador, marcador + caracteresPorPagina);
    document.getElementById('book_page').textContent = page_content;

    const paginas_totales = Math.ceil(texto.length / caracteresPorPagina);
    const pagina_actual = Math.ceil((marcador + 1) / caracteresPorPagina);
    document.getElementById('page-counter').textContent = `página: ${pagina_actual} / ${paginas_totales}`;
    document.getElementById('progress-bar').value = (marcador / texto.length) * 100;
}

const guardarMarcapaginas = async () => {
    const titulo_libro = localStorage.getItem("titulo");
    const valor = localStorage.getItem("marcador");

    try {
        const response = await fetch('api/lecturas_usuario', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ titulo: titulo_libro, marcador: valor })
        });

        const resultado = await response.json();
        console.log('Marcapáginas guardado:', resultado);
    } catch (error) {
        console.error('Error al guardar el marcapáginas:', error);
    }
}

//GESTIÓN DE AUDIOLIBRO

const audio_speed = document.getElementById("audio-speed");

const read_aloud = () => {
    console.log("Iniciando lectura...");
    const to_read = new SpeechSynthesisUtterance(document.getElementById('book_page').textContent);
    to_read.lang = "es-ES";
    to_read.rate = parseFloat(audio_speed.value);
    to_read.pitch = 1;

    to_read.onend = async () => {
        console.log("Fragmento leído");
        await pasarPagina();
        await new Promise(resolve => setTimeout(resolve, 10));
        time_to_read();
    }

    speechSynthesis.speak(to_read);
}

const time_to_read = async () => {
    speechSynthesis.cancel();

    if (audio.classList.contains('audio-on')) {
        read_aloud();
    }
}

const audio_handler = async () => {
    const audio = document.querySelector(".audiobook");
    const paragraph = document.querySelector(".paragraph-holder");

    caracteresPorPagina = audio.classList.contains("audio-on") ? caracteresLibro : caracteresAudiolibro;

    await refrescarParagraph();
    audio.classList.toggle("audio-on");
    paragraph.classList.toggle("audio-off");
}

const boton_audio = document.getElementById("boton-audio");
boton_audio.addEventListener("click", audio_handler);

function reconocimiento_voz() {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = "es-ES";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

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
            time_to_read();
        }
    }
});
observer.observe(audio, { attributes: true });

audio_speed.addEventListener("input", time_to_read);

const audio_next = document.getElementById("audio-next");
const audio_prev = document.getElementById("audio-prev");

const next_audio = async () => {
    await pasarPagina();
    time_to_read();
}

const prev_audio = async () => {
    await volverPagina();
    time_to_read();
}

audio_next.addEventListener("click", next_audio);
audio_prev.addEventListener("click", prev_audio);

window.addEventListener('beforeunload', () => {
    speechSynthesis.cancel();
});
