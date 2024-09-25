// Importar las dependencias
const express = require('express');

//importamos las rutas
const bokRouter = require('./routes/book')

// Crear una instancia de la aplicación Express
const app = express();

// Este middleware analiza las solicitudes entrantes con cargas útiles codificadas en URL 
// (como las enviadas por formularios HTML).
app.use(express.urlencoded({
    extended: false
}))

//
app.use('/book', bokRouter)

//Este middleware analiza las solicitudes entrantes con cargas útiles en formato JSON.
//Es útil para manejar datos enviados en el cuerpo de la solicitud, especialmente en aplicaciones API RESTful.
app.use(express.json())

// Definir una ruta básica
app.get('/', (req, res) => {
    res.send('¡Hola Mundo!');
});

// Configurar el puerto desde las variables de entorno
const PORT = process.env.PORT || 3000;

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto: http://localhost:${PORT}`);
});
