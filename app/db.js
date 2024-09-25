const { Client } = require('pg')

const cliente = new Client ({
    user: process.env.POSTGRES_USER,
    password:  process.env.POSTGRES_PASSWORD,
    host:  process.env.POSTGRES_HOST
})

cliente.connect()
cliente.query('select now()').then(
    res => console.log('Conectado a la base de datos 💻' + res.row[0].now)
)

module.exports = client