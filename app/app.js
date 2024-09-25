// Importar las dependencias
const express = require('express');

// Crear una instancia de la aplicación Express
const app = express();

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
