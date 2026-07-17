const mysql = require('mysql2');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'unibocado2026', // contraseña de Workbench
    database: 'uni_bocado'
});

db.connect((err) => {
    if (err) {
        console.error('Error de conexión a la base de datos:', err);
        process.exit(1);
    }
    console.log('Conectado a MySQL para la precarga de datos.');
    runSeeder();
});

function runSeeder() {
    // 1. Limpiar tablas existentes en orden (hijos primero por FK)
    const tablesToClear = [
        'detalle_pedidos',
        'pedidos',
        'productos',
        'categorias',
        'empleados_locales',
        'establecimientos'
    ];

    let clearIndex = 0;
    function clearNextTable() {
        if (clearIndex >= tablesToClear.length) {
            console.log('Tablas limpiadas con éxito. Iniciando inserciones...');
            insertEstablecimientos();
            return;
        }
        const table = tablesToClear[clearIndex++];
        db.query(`DELETE FROM ${table}`, (err) => {
            if (err) {
                console.error(`Error al limpiar tabla ${table}:`, err);
                db.end();
                process.exit(1);
            }
            clearNextTable();
        });
    }

    clearNextTable();
}

function insertEstablecimientos() {
    const query = `INSERT INTO establecimientos (id_local, nombre_negocio, correo_encargado, contrasena, ubicacion_campus, foto_url) VALUES 
        (1, 'Cafetaria', 'cafeteria@uttt.edu.mx', '123', 'Edificio Principal (Edificio A)', 'ratoncito.png'),
        (2, 'Local 1', 'local1@uttt.edu.mx', '123', 'Edificio de Ingeniería (Edificio B)', 'Tazita.png'),
        (3, 'Local 2', 'local2@uttt.edu.mx', '123', 'Edificio de Ciencias (Edificio C)', 'raton _dona.png')`;

    db.query(query, (err) => {
        if (err) {
            console.error('Error insertando establecimientos:', err);
            db.end();
            process.exit(1);
        }
        console.log('✓ Establecimientos insertados.');
        insertEmpleados();
    });
}

function insertEmpleados() {
    // Contraseña: vendedor123
    const query = `INSERT INTO empleados_locales (id_empleado, id_local, nombre_completo, correo, contrasena) VALUES 
        (1, 1, 'Juan Perez', 'vendedor@correo.com', '$2b$10$PKbxpFE6xdoN7cGjoI9lterGElD8..Do4SH5UXNuAlBdQB95mbMNu')`;

    db.query(query, (err) => {
        if (err) {
            console.error('Error insertando empleados:', err);
            db.end();
            process.exit(1);
        }
        console.log('✓ Empleado vendedor@correo.com precargado.');
        insertCategorias();
    });
}

function insertCategorias() {
    const query = `INSERT INTO categorias (id_categoria, id_local, nombre_categoria) VALUES 
        (1, 1, 'Comida'), (2, 1, 'Bebidas'), (3, 1, 'Postres'),
        (4, 2, 'Comida'), (5, 2, 'Bebidas'), (6, 2, 'Postres'),
        (7, 3, 'Comida'), (8, 3, 'Bebidas'), (9, 3, 'Postres')`;

    db.query(query, (err) => {
        if (err) {
            console.error('Error insertando categorias:', err);
            db.end();
            process.exit(1);
        }
        console.log('✓ Categorías de comida insertadas.');
        insertProductos();
    });
}

function insertProductos() {
    const query = `INSERT INTO productos (id_product, id_local, id_categoria, nombre_platillo, descripcion, precio, foto_url, disponible) VALUES 
        (1, 1, 1, 'Hamburguesa clasica', 'Hamburguesa con queso, lechuga y tomate', 80.00, 'ratoncito.png', 1),
        (2, 1, 2, 'Jugo de naranja', 'Jugo 100% natural exprimido al momento', 35.00, 'Tazita.png', 1),
        (3, 1, 3, 'Pastel de fresa', 'Pastel esponjoso con fresas frescas y crema', 45.00, 'raton _dona.png', 0),
        (4, 1, 1, 'Papas a la francesa', 'Papas fritas crujientes con sal y especias', 45.00, 'raton _dona.png', 1),
        (5, 1, 1, 'Hot dog', 'Hot dog clásico con salchicha de pavo, cátsup y mostaza', 40.00, 'ratoncito.png', 1),
        (6, 1, 1, 'Ensalada', 'Ensalada fresca con lechuga, jitomate, pepino y aderezo', 55.00, 'ratoncito.png', 1),
        (7, 1, 2, 'Te chai', 'Té chai cremoso con infusión de especias tradicionales', 30.00, 'Tazita.png', 1),
        (8, 1, 2, 'Cafe capuchino', 'Café espresso con leche espumosa y canela', 32.00, 'Tazita.png', 1),
        (9, 1, 1, 'Pizza', 'Rebanada de pizza de pepperoni con queso fundido', 70.00, 'raton _dona.png', 1),
        (10, 1, 2, 'Pepsi', 'Lata de refresco de cola Pepsi fría de 355ml', 20.00, 'Tazita.png', 1),
        (11, 1, 3, 'Cupcake', 'Cupcake de vainilla y fresas con betún de mantequilla', 22.00, 'raton _dona.png', 1),
        (12, 1, 3, 'Pay de limón', 'Fresco pay frío de limón con galletas marías trituradas', 25.00, 'raton _dona.png', 1)`;

    db.query(query, (err) => {
        if (err) {
            console.error('Error insertando productos:', err);
            db.end();
            process.exit(1);
        }
        console.log('✓ Productos de prueba insertados con éxito.');
        console.log('============================================');
        console.log('Seeder completado. Todo listo para las pruebas.');
        db.end();
    });
}
