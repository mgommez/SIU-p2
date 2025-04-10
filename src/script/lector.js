
const text = "La historia de Marta Fumari empieza el día que le ofrecieron un cigarro en el Circo del Sol. Juan se encontró unas habichuelas al lado del río y las plantó por ocurría algo parecido a lo que le pasó a Jack y vivía aventuras como cazador de ogros. Sin embargo, en lugar de una planta enorme, salió un pollito, al cual cuidó como si de un hijo se tratase hasta que tuvo tanta hambre que lo asó, lo aliñó con ajito, aceitito y sal, y se lo comió. Atentamente: Tu cuentacuentos favorita."

const time_to_read = () => {

    if (audio.classList.contains('audio-on')) {
        console.log("Iniciando lectura...");
        const to_read = new SpeechSynthesisUtterance(text);
        to_read.lang = "es-ES";
        to_read.rate = 1;
        to_read.pitch = 0.9;
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
    
    console.log("Botón pulsado");
    if (audio.classList.contains("audio-on")) {
        console.log("Finalizar evento de audiolibro");
        audio.classList.remove("audio-on");
    } else {
        console.log("Lanzar evento de inicio de audiolibro");
        audio.classList.add("audio-on");
    }
}

//Evento activación audiolibro
const boton = document.querySelector(".prueba");
boton.addEventListener("click", prueba);

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

