const client = require('../db');  // Importa el cliente de la base de datos
const InvalidArgumentError = require('../error');  // Importa una clase de error personalizada

// Define un array con los atributos de los libros
const bookAttributesArray = ['id', 'author', 'price', 'description', 'year_published', 'added_dttm'];
// Crea una cadena de atributos para la inserción de libros, excluyendo el último atributo
const insertBookAttrbiutes = bookAttributesArray.slice(0, -1).join(', ');
// Crea una cadena de atributos para la selección de libros
const selectBookAttributes = bookAttributesArray.join(', ');

// Función asincrónica para obtener libros con parámetros de paginación y ordenación
async function getBooks({ limit, offset, sortBy, desc }) {
    // Validaciones de los parámetros de entrada
    // Validar que 'limit' esté definido y sea un número
validate(limit !== undefined && isNaN(+limit) === true, 'Limit debe ser un número si está definido');

// Validar que 'offset' esté definido y sea un número
validate(offset !== undefined && isNaN(+offset) === true, 'Offset debe ser un número si está definido');

// Validar que 'sortBy' esté definido y sea un atributo válido del libro
validate(sortBy !== undefined && bookAttributesArray.includes(sortBy) === false, 'sortBy debe ser un atributo del libro');

// Validar que 'desc' esté definido y sea un booleano
validate(desc !== undefined && typeof desc !== 'boolean', 'desc debe ser un booleano si está definido');


    // Construcción de la consulta SQL
    let query = `
        select ${selectBookAttributes}
        from book
    `;

    let bindVariables = [];  // Array para las variables de enlace

    // Añade la cláusula ORDER BY a la consulta
    if (sortBy !== undefined) {
        query = query + ` order by ${sortBy}`;
    } else {
        query = query + ` order by added_dttm`;
    }

    // Añade la cláusula DESC si es necesario
    if (desc !== false) {
        query = query + ` desc`;
    }

    // Añade la cláusula LIMIT a la consulta
    if (limit !== undefined) {
        query = query + ` limit $${bindVariables.length + 1}`;
        bindVariables.push(+limit);
    }

    // Añade la cláusula OFFSET a la consulta
    if (offset !== undefined) {
        query = query + ` offset $${bindVariables.length + 1}`;
        bindVariables.push(+offset);
    }

    let results;
    try {
        // Ejecuta la consulta SQL
        results = await client.query(query, bindVariables);
    } catch (e) {
        logger.error(e);  // Registra el error
        return undefined;
    }

    return results.rows;  // Devuelve las filas de resultados
}

// Función asincrónica para obtener un libro por su ID
async function getBook({ bookId }) {
    if (typeof bookId !== 'string') return undefined;  // Valida el tipo de bookId

    const query = `
        select ${selectBookAttributes}
        from book
        where id = $1
    `;

    let results;
    try {
        // Ejecuta la consulta SQL
        results = await client.query(query, [bookId]);
    } catch (e) {
        logger.error(e);  // Registra el error
        return undefined;
    }

    if (results.rowCount === 0) return null;  // Si no se encuentra el libro, devuelve null

    return results.rows[0];  // Devuelve el libro encontrado
}

// Función para validar expresiones y lanzar errores personalizados
function validate(expression, errorMessage) {
    if (expression) throw new InvalidArgumentError(errorMessage);
}

// Función para realizar validaciones específicas de atributos
function makeValidation(attribute, value) {
    switch(attribute) {
        case 'author':
            validate(typeof value !== 'string' || value.length === 0, 'Author must be a string and longer than 0');
            break;
        case 'price':
            validate(typeof value !== 'number' || value < 0, 'Price must be a number and must be larger or equal than 0');
            break;
        case 'description':
            validate(value !== undefined && typeof value !== 'string', 'Description must be a string if exists');
            break;
        case 'year_published':
            validate(typeof value !== 'number' || value < 0, 'Year must be larger than 0');
            break;
        default:
            logger.error('Unknown attribute value');
    }
}

// Función asincrónica para añadir un libro a la base de datos
async function addBook({ id, author, price, description, year_published }) {
    if (typeof id !== 'string' || id.length === 0) throw new Error('Id must be a string and longer than 0');
    makeValidation('author', author);
    makeValidation('price', price);
    makeValidation('year_published', year_published);
    makeValidation('description', description);

    let resp;
    try {
        // Ejecuta la consulta SQL para insertar un libro
        resp = await client.query(`
            insert into book (${insertBookAttrbiutes})
            values ($1, $2, $3, $4, $5)
        `, [id, author, price, description, year_published]);
    } catch (e) {
        logger.error(e);  // Registra el error
        return undefined;
    }

    return resp;  // Devuelve la respuesta de la consulta
}

// Función asincrónica para actualizar un libro en la base de datos
async function updateBook({ bookId, newAttributes }) {
    if (typeof bookId !== 'string' || bookId.length === 0) throw new Error('Id must be a string and longer than 0');
    validate(typeof newAttributes !== 'object', 'New attributes must be provided as an object');

    // Filtra los atributos válidos para la actualización
    const validAttributes = Object.keys(newAttributes).filter(element => bookAttributesArray.includes(element));
    validate(validAttributes.length === 0, 'At least one valid attribute must be provided for update');

    // Construcción de la consulta SQL para la actualización
    let setClause = validAttributes.map((attr, index) => `${attr} = $${index + 2}`).join(', ');
    let query = `
        update book
        set ${setClause}
        where id = $1
    `;

    let bindVariables = [bookId, ...validAttributes.map(attr => newAttributes[attr])];

    let resp;
    try {
        // Ejecuta la consulta SQL para actualizar el libro
        resp = await client.query(query, bindVariables);
    } catch (e) {
        logger.error(e);  // Registra el error
        return undefined;
    }

    return resp;  // Devuelve la respuesta de la consulta
}

// Función asíncrona para eliminar un libro por su ID
async function deleteBook({ bookId }) {
    // Verificar que 'bookId' sea una cadena de texto
    if (typeof bookId !== 'string') return undefined

    let resp
    try {
        // Ejecutar la consulta para eliminar el libro de la base de datos
        resp = await client.query(`
            delete from book
            where id = $1
        `, [bookId])
    } catch (e) {
        // Registrar el error si ocurre una excepción
        logger.error(e)
        return undefined
    }
    // Devolver la respuesta de la consulta
    return resp
}

module.exports = {
    getBook,
    getBooks,
    addBook,
    updateBook,
    deleteBook
}