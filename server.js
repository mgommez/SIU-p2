const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

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
            res.status(200).send("Libro añadido");
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


app.listen(PORT, () => {
    console.log(`Servidor funcionando en http://localhost:${PORT}`);
});
