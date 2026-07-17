const cors = require('cors');
const express = require('express');
const mysql = require('mysql2');
const path = require('path');
const bcrypt = require('bcrypt'); // Librería para el cifrado seguro

const app = express();
app.use(cors());
// Middleware para entender formatos JSON y formularios
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(__dirname));

// Configuración de la conexión a la Base de Datos MySQL
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'unibocado2026', // contraseña de Workbench
    database: 'uni_bocado'
});

db.connect((err) => {
    if (err) {
        console.error('Error conectando a la base de datos:', err);
        return;
    }
    console.log('Conexión exitosa a la base de datos MySQL.');
});

// Endpoint POST para procesar el registro seguro de estudiantes
app.post('/api/registrar', async (req, res) => {
    const { nombre, apellidos, correo, contrasena } = req.body;

    // 1. Primero revisamos si el correo institucional ya existe en la BD
    const buscarCorreo = 'SELECT * FROM estudiantes WHERE correo = ?';
   
    db.query(buscarCorreo, [correo], async (err, resultados) => {
        if (err) {
            console.error("Error en MySQL:", err);
            return res.status(500).json({ error: 'Hubo un error interno en el servidor.' });
        }

        if (resultados.length > 0) {
            return res.status(400).json({ error: 'Este correo ya está registrado en nuestra app.' });
        }

        try {
            // --- PROCESAMIENTO DE SEGURIDAD (HASH) ---
            // Ciframos la contraseña pasándole 10 rondas de encriptación
            const contrasenaCifrada = await bcrypt.hash(contrasena, 10);

            // 2. Si el correo está disponible, guardamos el registro con la contraseña cifrada
            const queryInsert = 'INSERT INTO estudiantes (nombre, apellidos, correo, contrasena) VALUES (?, ?, ?, ?)';
           
            db.query(queryInsert, [nombre, apellidos, correo, contrasenaCifrada], (err, result) => {
                if (err) {
                    console.error("Error en MySQL:", err);
                    return res.status(500).json({ error: 'Hubo un error al guardar en la base de datos.' });
                }
                res.json({ mensaje: '¡Registro exitoso en Uni-Bocado!' });
            });

        } catch (errorCifrado) {
            console.error("Error al cifrar contraseña:", errorCifrado);
            return res.status(500).json({ error: 'Error de seguridad al procesar tus credenciales.' });
        }
    });
});
// Ruta para INICIAR SESIÓN
app.post('/api/login', async (req, res) => {
    const { correo, contrasena } = req.body;

    const buscarUsuario = 'SELECT * FROM estudiantes WHERE correo = ?';
    db.query(buscarUsuario, [correo], async (err, resultados) => {
        if (err) {
            console.error("Error en MySQL:", err);
            return res.status(500).json({ error: 'Error en el servidor' });
        }
        if (resultados.length === 0) {
            return res.status(400).json({ error: 'Correo no registrado' });
        }

        try {
            const usuario = resultados[0];
            const contrasenaCorrecta = await bcrypt.compare(contrasena, usuario.contrasena);

            if (!contrasenaCorrecta) {
                return res.status(400).json({ error: 'Contraseña incorrecta' });
            }

            res.json({ 
                mensaje: '¡Bienvenido a Uni-Bocado!',
                usuario: { id: usuario.id_estudiante, nombre: usuario.nombre, correo: usuario.correo }
            });
        } catch (errorLogin) {
            console.error("Error en el login:", errorLogin);
            return res.status(500).json({ error: 'Error interno al verificar tus credenciales.' });
        }
    });
});

// ==========================================
// ENDPOINTS PARA EL VENDEDOR (EMPLEADO LOCAL)
// ==========================================

// Login del vendedor
app.post('/api/vendedor/login', async (req, res) => {
    const { correo, contrasena } = req.body;

    const buscarVendedor = 'SELECT * FROM empleados_locales WHERE correo = ?';
    db.query(buscarVendedor, [correo], async (err, resultados) => {
        if (err) {
            console.error("Error en MySQL:", err);
            return res.status(500).json({ error: 'Error en el servidor' });
        }
        if (resultados.length === 0) {
            return res.status(400).json({ error: 'Correo de empleado no registrado' });
        }

        try {
            const empleado = resultados[0];
            const contrasenaCorrecta = await bcrypt.compare(contrasena, empleado.contrasena);

            if (!contrasenaCorrecta) {
                return res.status(400).json({ error: 'Contraseña incorrecta' });
            }

            res.json({
                mensaje: '¡Bienvenido al Panel de Control!',
                empleado: { id: empleado.id_empleado, nombre: empleado.nombre_completo, correo: empleado.correo, id_local: empleado.id_local }
            });
        } catch (errorLogin) {
            console.error("Error en el login del vendedor:", errorLogin);
            return res.status(500).json({ error: 'Error interno al verificar tus credenciales.' });
        }
    });
});

// Obtener pedidos del local del vendedor
app.get('/api/vendedor/pedidos', (req, res) => {
    const id_local = req.query.id_local;
    if (!id_local) {
        return res.status(400).json({ error: 'Falta especificar el id_local' });
    }

    const query = `
        SELECT p.*, e.nombre, e.apellidos 
        FROM pedidos p 
        JOIN estudiantes e ON p.id_estudiante = e.id_estudiante 
        WHERE p.id_local = ? 
        ORDER BY p.fecha_creacion DESC`;

    db.query(query, [id_local], (err, resultados) => {
        if (err) {
            console.error("Error en MySQL:", err);
            return res.status(500).json({ error: 'Error al obtener pedidos.' });
        }
        res.json(resultados);
    });
});

// Obtener detalles de un pedido específico (los productos comprados)
app.get('/api/vendedor/pedidos/:id/detalles', (req, res) => {
    const id_pedido = req.params.id;

    const query = `
        SELECT dp.*, pr.nombre_platillo, pr.precio 
        FROM detalle_pedidos dp 
        JOIN productos pr ON dp.id_producto = pr.id_product 
        WHERE dp.id_pedido = ?`;

    db.query(query, [id_pedido], (err, resultados) => {
        if (err) {
            console.error("Error en MySQL:", err);
            return res.status(500).json({ error: 'Error al obtener detalles del pedido.' });
        }
        res.json(resultados);
    });
});

// Actualizar estado del pedido
app.put('/api/vendedor/pedidos/:id/estado', (req, res) => {
    const id_pedido = req.params.id;
    const { estado } = req.body; // 'En cocina', 'Listo', 'Entregado'

    const query = 'UPDATE pedidos SET estado_actual = ? WHERE id_pedido = ?';
    db.query(query, [estado, id_pedido], (err, result) => {
        if (err) {
            console.error("Error en MySQL:", err);
            return res.status(500).json({ error: 'Error al actualizar el estado del pedido.' });
        }
        res.json({ mensaje: 'Estado de pedido actualizado con éxito.' });
    });
});

// Obtener productos de un local
app.get('/api/vendedor/productos', (req, res) => {
    const id_local = req.query.id_local;
    if (!id_local) {
        return res.status(400).json({ error: 'Falta especificar el id_local' });
    }

    const query = 'SELECT * FROM productos WHERE id_local = ?';
    db.query(query, [id_local], (err, resultados) => {
        if (err) {
            console.error("Error en MySQL:", err);
            return res.status(500).json({ error: 'Error al obtener productos.' });
        }
        res.json(resultados);
    });
});

// Agregar un nuevo producto
app.post('/api/vendedor/productos', (req, res) => {
    const { id_local, id_categoria, nombre_platillo, descripcion, precio, foto_url, disponible } = req.body;

    const query = 'INSERT INTO productos (id_local, id_categoria, nombre_platillo, descripcion, precio, foto_url, disponible) VALUES (?, ?, ?, ?, ?, ?, ?)';
    db.query(query, [id_local, id_categoria, nombre_platillo, descripcion, precio, foto_url, disponible], (err, result) => {
        if (err) {
            console.error("Error en MySQL:", err);
            return res.status(500).json({ error: 'Error al guardar el producto.' });
        }
        res.json({ mensaje: 'Producto agregado con éxito.', id_product: result.insertId });
    });
});

// Modificar un producto existente
app.put('/api/vendedor/productos/:id', (req, res) => {
    const id_product = req.params.id;
    const { id_categoria, nombre_platillo, descripcion, precio, foto_url, disponible } = req.body;

    const query = 'UPDATE productos SET id_categoria = ?, nombre_platillo = ?, descripcion = ?, precio = ?, foto_url = ?, disponible = ? WHERE id_product = ?';
    db.query(query, [id_categoria, nombre_platillo, descripcion, precio, foto_url, disponible, id_product], (err, result) => {
        if (err) {
            console.error("Error en MySQL:", err);
            return res.status(500).json({ error: 'Error al actualizar el producto.' });
        }
        res.json({ mensaje: 'Producto actualizado con éxito.' });
    });
});

// Cambiar disponibilidad rápida de un producto
app.put('/api/vendedor/productos/:id/disponibilidad', (req, res) => {
    const id_product = req.params.id;
    const { disponible } = req.body; // 1 o 0

    const query = 'UPDATE productos SET disponible = ? WHERE id_product = ?';
    db.query(query, [disponible, id_product], (err, result) => {
        if (err) {
            console.error("Error en MySQL:", err);
            return res.status(500).json({ error: 'Error al actualizar disponibilidad.' });
        }
        res.json({ mensaje: 'Disponibilidad actualizada.' });
    });
});


// ==========================================
// ENDPOINTS PARA EL ESTUDIANTE (PEDIDOS REALES)
// ==========================================

// Obtener locales de comida (para elegir lugar)
app.get('/api/locales', (req, res) => {
    db.query('SELECT * FROM establecimientos', (err, resultados) => {
        if (err) {
            console.error("Error en MySQL:", err);
            return res.status(500).json({ error: 'Error al obtener locales.' });
        }
        res.json(resultados);
    });
});

// Obtener productos de un local específico para el menú del estudiante
app.get('/api/locales/:id/productos', (req, res) => {
    const id_local = req.params.id;
    const query = 'SELECT * FROM productos WHERE id_local = ? AND disponible = 1';
    db.query(query, [id_local], (err, resultados) => {
        if (err) {
            console.error("Error en MySQL:", err);
            return res.status(500).json({ error: 'Error al obtener productos.' });
        }
        res.json(resultados);
    });
});

// Registrar un pedido real
app.post('/api/pedidos', (req, res) => {
    const { id_estudiante, id_local, total_pagar, metodo_pago, articulos } = req.body;

    if (!id_estudiante || !id_local || !total_pagar || !metodo_pago || !articulos || articulos.length === 0) {
        return res.status(400).json({ error: 'Datos de pedido incompletos.' });
    }

    // Iniciar transacción de MySQL
    db.beginTransaction((err) => {
        if (err) {
            console.error("Error al iniciar transacción:", err);
            return res.status(500).json({ error: 'Error al procesar el pedido.' });
        }

        const queryPedido = 'INSERT INTO pedidos (id_estudiante, id_local, total_pagar, metodo_pago, estado_actual) VALUES (?, ?, ?, ?, ?)';
        db.query(queryPedido, [id_estudiante, id_local, total_pagar, metodo_pago, 'En cocina'], (err, result) => {
            if (err) {
                return db.rollback(() => {
                    console.error("Error al insertar pedido:", err);
                    res.status(500).json({ error: 'Error al guardar el pedido.' });
                });
            }

            const id_pedido = result.insertId;

            // Mapear artículos para inserción múltiple
            // detalle_pedidos: id_pedido, id_producto, cantidad, subtotal
            const queryDetalle = 'INSERT INTO detalle_pedidos (id_pedido, id_producto, cantidad, subtotal) VALUES ?';
            const valoresDetalle = articulos.map(art => [
                id_pedido,
                art.id_producto,
                art.cantidad,
                art.subtotal
            ]);

            db.query(queryDetalle, [valoresDetalle], (err) => {
                if (err) {
                    return db.rollback(() => {
                        console.error("Error al insertar detalles de pedido:", err);
                        res.status(500).json({ error: 'Error al guardar el desglose de productos.' });
                    });
                }

                db.commit((err) => {
                    if (err) {
                        return db.rollback(() => {
                            console.error("Error al confirmar transacción:", err);
                            res.status(500).json({ error: 'Error al finalizar el pedido.' });
                        });
                    }
                    res.json({ mensaje: '¡Pedido guardado con éxito!', id_pedido: id_pedido });
                });
            });
        });
    });
});

// Consultar el estado actual de UN pedido (para el polling del cliente)
app.get('/api/pedido/:id/estado', (req, res) => {
    const id_pedido = req.params.id;
    db.query('SELECT estado_actual FROM pedidos WHERE id_pedido = ?', [id_pedido], (err, rows) => {
        if (err) {
            console.error("Error en MySQL:", err);
            return res.status(500).json({ error: 'Error al consultar estado.' });
        }
        if (rows.length === 0) return res.status(404).json({ error: 'Pedido no encontrado.' });
        res.json({ estado_actual: rows[0].estado_actual });
    });
});

// Encendido oficial del Servidor Backend
const PORT = 5500;
app.listen(PORT, () => {
    console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
});
