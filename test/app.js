// Esto importa la función expect de la librería Chai, que se utiliza para realizar aserciones en las pruebas.
// import { expect } from 'chai'; 
const { expect } = import ('chai')

//Esto importa el módulo app desde la ruta relativa ../app/app.
// Se asume que app es el archivo que contiene la aplicación que deseas probar.
const app = require('../app/app')

//describe es una función de Mocha que agrupa un conjunto de pruebas relacionadas. 
// En este caso, el conjunto de pruebas se llama “testing para la creación de la app”.

describe('Testing app creation', () => {
    it('App is correctly exported', () => {
        // este código verifica que el módulo app exporte una función. Si app no es una función, la prueba fallará.
        expect(typeof app).to.equal('function')
    })
})