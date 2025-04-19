const express = require('express');
const http = require('http');
const fs = require('fs');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const PORT = 3000;

server.listen(PORT, () => {
    console.log(`Servidor funcionando en http://localhost:${PORT}`);
});

// Servir archivos estáticos desde 'src'
app.use(express.static(path.join(__dirname, 'src')));
app.use(express.json());

const librosPath = path.join(__dirname, 'data', 'libros.json');
const lecturasUsuarioPath = path.join(__dirname, 'data', 'lecturas_usuario.json');


app.get('/api/libros', (req, res) => {
    fs.readFile(librosPath, 'utf8', (err, data) => {
        if (err) return res.status(500).send("Error leyendo libros");
        res.json(JSON.parse(data));
    });
});

app.get('/api/lecturas_usuario', (req, res) => {
    fs.readFile(lecturasUsuarioPath, 'utf8', (err, data) => {
        if (err) return res.status(500).send("Error leyendo lecturas");
        res.json(JSON.parse(data));
    });
});

app.post('/api/lecturas_usuario', (req, res) => {
    const nuevoLibro = req.body;
    fs.readFile(lecturasUsuarioPath, 'utf8', (err, data) => {
        if (err) return res.status(500).send("Error leyendo lecturas");

        const libros = JSON.parse(data);
        libros.push(nuevoLibro);

        fs.writeFile(lecturasUsuarioPath, JSON.stringify(libros, null, 2), err => {
            if (err) return res.status(500).send("Error escribiendo libro");
            res.status(200).json({ mensaje: "Lectura actualizada"});

        });
    });
});

app.put('/api/lecturas_usuario', (req, res) => {
    const nuevosLibros = req.body;
    fs.writeFile(lecturasUsuarioPath, JSON.stringify(nuevosLibros, null, 2), err => {
        if (err) return res.status(500).send("Error actualizando lecturas");
        res.status(200).send("Lecturas actualizadas");
    });
});



app.patch('/api/lecturas_usuario', (req, res) => {

    fs.readFile(lecturasUsuarioPath, 'utf8', (err, data) => {
        if (err) return res.status(500).json({ error: 'Error leyendo archivo' });
        
        
        let libros = JSON.parse(data);

        //CASO 1: update de marcapáginas
        if("marcador" in req.body){
            const { titulo, marcador } = req.body;

            //obtenemos datos del libro
            const index = libros.findIndex(l => l.titulo.toLowerCase() === titulo.toLowerCase());
            if (index === -1) return res.status(404).json({ error: 'Libro no encontrado' });

            //modificación del campo marcador
            libros[index].marcador = marcador;
        }
        
        //escritura de fichero
        fs.writeFile(lecturasUsuarioPath, JSON.stringify(libros, null, 2), err => {
            if (err) return res.status(500).json({ error: 'Error escribiendo archivo' });
            res.status(200).json({ mensaje: 'JSON de lecturas actualizado'});
        });
    });
});

//Sincronización
io.on('connection', (socket) => {
    console.log('Nuevo dispositivo conectado');
    
    //Pasar, retroceder página.
    socket.on('cambiar-pagina', ({ titulo_libro, marcador }) => {
        socket.broadcast.emit('actualizar-pagina', { titulo_libro, marcador });
    });

    socket.on('cambiar-vel-audio', (speed) => {
        socket.broadcast.emit('actualizar-vel-audio', speed);
    })

    //Desconexión.
    socket.on('disconnect', () => {
        console.log('Dispositivo desconectado');
    })
})