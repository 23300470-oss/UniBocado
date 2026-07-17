const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const cors = require('cors');
const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static(__dirname));

let supabase;
if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
    supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_ANON_KEY
    );
    console.log('✅ Cliente de Supabase iniciado correctamente.');
} else {
    console.warn('⚠️ Advertencia: SUPABASE_URL o SUPABASE_ANON_KEY no están definidas en las variables de entorno.');
}

// Middleware para verificar la inicialización de Supabase y devolver JSON amigable
app.use('/api', (req, res, next) => {
    if (!supabase) {
        return res.status(500).json({
            error: 'El servidor de Vercel no ha cargado tus variables de entorno de Supabase. Por favor, asegúrate de haber añadido SUPABASE_URL y SUPABASE_ANON_KEY en la configuración de Vercel y haz un Redeploy de tu proyecto.'
        });
    }
    next();
});

// ==========================================
// ENDPOINTS PARA ESTUDIANTES
// ==========================================

// Registro de estudiante
app.post('/api/registrar', async (req, res) => {
    const { nombre, apellidos, correo, contrasena } = req.body;

    // 1. Verificar si el correo ya existe
    const { data: existe, error: errorBuscar } = await supabase
        .from('estudiantes')
        .select('id_estudiante')
        .eq('correo', correo)
        .maybeSingle();

    if (errorBuscar) {
        console.error('Error Supabase:', errorBuscar);
        return res.status(500).json({ error: 'Error interno: ' + errorBuscar.message });
    }
    if (existe) {
        return res.status(400).json({ error: 'Este correo ya está registrado en nuestra app.' });
    }

    // 2. Cifrar contraseña e insertar
    try {
        const contrasenaCifrada = await bcrypt.hash(contrasena, 10);
        const { error: errorInsert } = await supabase
            .from('estudiantes')
            .insert({ nombre, apellidos, correo, contrasena: contrasenaCifrada });

        if (errorInsert) {
            console.error('Error Supabase:', errorInsert);
            return res.status(500).json({ error: 'Error al guardar: ' + errorInsert.message });
        }
        res.json({ mensaje: '¡Registro exitoso en Uni-Bocado!' });
    } catch (e) {
        res.status(500).json({ error: 'Error al cifrar la contraseña.' });
    }
});

// Login de estudiante
app.post('/api/login', async (req, res) => {
    const { correo, contrasena } = req.body;

    const { data: usuario, error } = await supabase
        .from('estudiantes')
        .select('*')
        .eq('correo', correo)
        .maybeSingle();

    if (error) return res.status(500).json({ error: 'Error en el servidor: ' + error.message });
    if (!usuario) return res.status(400).json({ error: 'Correo no registrado' });

    try {
        const contrasenaCorrecta = await bcrypt.compare(contrasena, usuario.contrasena);
        if (!contrasenaCorrecta) return res.status(400).json({ error: 'Contraseña incorrecta' });

        res.json({
            mensaje: '¡Bienvenido a Uni-Bocado!',
            usuario: { id: usuario.id_estudiante, nombre: usuario.nombre, correo: usuario.correo }
        });
    } catch (e) {
        res.status(500).json({ error: 'Error al verificar credenciales.' });
    }
});

// Obtener el pedido activo de un estudiante (si existe)
app.get('/api/estudiantes/:id/pedido-activo', async (req, res) => {
    const id_estudiante = req.params.id;

    const { data, error } = await supabase
        .from('pedidos')
        .select('*, establecimientos(nombre_negocio)')
        .eq('id_estudiante', id_estudiante)
        .in('estado_actual', ['En cocina', 'Listo'])
        .order('fecha_creacion', { ascending: false })
        .limit(1)
        .maybeSingle();

    if (error) {
        console.error('Error Supabase:', error);
        return res.status(500).json({ error: 'Error al buscar pedido activo: ' + error.message });
    }

    if (data) {
        const pedido = {
            id_pedido: data.id_pedido,
            total: parseFloat(data.total_pagar),
            metodoPago: data.metodo_pago,
            local: data.establecimientos?.nombre_negocio || 'Cafetería',
            estado_actual: data.estado_actual
        };
        return res.json({ pedido });
    }

    res.json({ pedido: null });
});

// ==========================================
// ENDPOINTS PARA VENDEDOR (EMPLEADO LOCAL)
// ==========================================

// Login del vendedor
app.post('/api/vendedor/login', async (req, res) => {
    const { correo, contrasena } = req.body;

    const { data: empleado, error } = await supabase
        .from('empleados_locales')
        .select('*')
        .eq('correo', correo)
        .maybeSingle();

    if (error) return res.status(500).json({ error: 'Error en el servidor: ' + error.message });
    if (!empleado) return res.status(400).json({ error: 'Correo de empleado no registrado' });

    try {
        const contrasenaCorrecta = await bcrypt.compare(contrasena, empleado.contrasena);
        if (!contrasenaCorrecta) return res.status(400).json({ error: 'Contraseña incorrecta' });

        res.json({
            mensaje: '¡Bienvenido al Panel de Control!',
            empleado: { id: empleado.id_empleado, nombre: empleado.nombre_completo, correo: empleado.correo, id_local: empleado.id_local }
        });
    } catch (e) {
        res.status(500).json({ error: 'Error al verificar credenciales.' });
    }
});

// Obtener pedidos del local del vendedor
app.get('/api/vendedor/pedidos', async (req, res) => {
    const id_local = req.query.id_local;
    if (!id_local) return res.status(400).json({ error: 'Falta especificar el id_local' });

    const { data, error } = await supabase
        .from('pedidos')
        .select('*, estudiantes(nombre, apellidos)')
        .eq('id_local', id_local)
        .order('fecha_creacion', { ascending: false });

    if (error) {
        console.error('Error Supabase:', error);
        return res.status(500).json({ error: 'Error al obtener pedidos: ' + error.message });
    }

    // Aplanar el objeto anidado de estudiantes para mantener compatibilidad con el frontend
    const resultado = data.map(p => ({
        ...p,
        nombre: p.estudiantes?.nombre,
        apellidos: p.estudiantes?.apellidos,
        estudiantes: undefined
    }));

    res.json(resultado);
});

// Obtener detalles de un pedido
app.get('/api/vendedor/pedidos/:id/detalles', async (req, res) => {
    const id_pedido = req.params.id;

    const { data, error } = await supabase
        .from('detalle_pedidos')
        .select('*, productos(nombre_platillo, precio)')
        .eq('id_pedido', id_pedido);

    if (error) {
        console.error('Error Supabase:', error);
        return res.status(500).json({ error: 'Error al obtener detalles: ' + error.message });
    }

    // Aplanar el objeto anidado de productos
    const resultado = data.map(d => ({
        ...d,
        nombre_platillo: d.productos?.nombre_platillo,
        precio: d.productos?.precio,
        productos: undefined
    }));

    res.json(resultado);
});

// Actualizar estado del pedido
app.put('/api/vendedor/pedidos/:id/estado', async (req, res) => {
    const id_pedido = req.params.id;
    const { estado } = req.body;

    const { error } = await supabase
        .from('pedidos')
        .update({ estado_actual: estado })
        .eq('id_pedido', id_pedido);

    if (error) {
        console.error('Error Supabase:', error);
        return res.status(500).json({ error: 'Error al actualizar estado: ' + error.message });
    }
    res.json({ mensaje: 'Estado de pedido actualizado con éxito.' });
});

// Obtener productos de un local (panel vendedor)
app.get('/api/vendedor/productos', async (req, res) => {
    const id_local = req.query.id_local;
    if (!id_local) return res.status(400).json({ error: 'Falta especificar el id_local' });

    const { data, error } = await supabase
        .from('productos')
        .select('*')
        .eq('id_local', id_local);

    if (error) {
        console.error('Error Supabase:', error);
        return res.status(500).json({ error: 'Error al obtener productos: ' + error.message });
    }
    res.json(data);
});

// Agregar un nuevo producto
app.post('/api/vendedor/productos', async (req, res) => {
    const { id_local, id_categoria, nombre_platillo, descripcion, precio, foto_url, disponible } = req.body;

    const { data, error } = await supabase
        .from('productos')
        .insert({ id_local, id_categoria, nombre_platillo, descripcion, precio, foto_url, disponible })
        .select('id_product')
        .single();

    if (error) {
        console.error('Error Supabase:', error);
        return res.status(500).json({ error: 'Error al guardar el producto: ' + error.message });
    }
    res.json({ mensaje: 'Producto agregado con éxito.', id_product: data.id_product });
});

// Modificar un producto existente
app.put('/api/vendedor/productos/:id', async (req, res) => {
    const id_product = req.params.id;
    const { id_categoria, nombre_platillo, descripcion, precio, foto_url, disponible } = req.body;

    const { error } = await supabase
        .from('productos')
        .update({ id_categoria, nombre_platillo, descripcion, precio, foto_url, disponible })
        .eq('id_product', id_product);

    if (error) {
        console.error('Error Supabase:', error);
        return res.status(500).json({ error: 'Error al actualizar el producto: ' + error.message });
    }
    res.json({ mensaje: 'Producto actualizado con éxito.' });
});

// Cambiar disponibilidad de un producto
app.put('/api/vendedor/productos/:id/disponibilidad', async (req, res) => {
    const id_product = req.params.id;
    const { disponible } = req.body;

    const { error } = await supabase
        .from('productos')
        .update({ disponible })
        .eq('id_product', id_product);

    if (error) {
        console.error('Error Supabase:', error);
        return res.status(500).json({ error: 'Error al actualizar disponibilidad: ' + error.message });
    }
    res.json({ mensaje: 'Disponibilidad actualizada.' });
});

// ==========================================
// ENDPOINTS PARA ESTUDIANTE (PEDIDOS REALES)
// ==========================================

// Obtener todos los locales
app.get('/api/locales', async (req, res) => {
    const { data, error } = await supabase.from('establecimientos').select('*');

    if (error) {
        console.error('Error Supabase:', error);
        return res.status(500).json({ error: 'Error al obtener locales: ' + error.message });
    }
    res.json(data);
});

// Obtener productos disponibles de un local (menú del estudiante)
app.get('/api/locales/:id/productos', async (req, res) => {
    const id_local = req.params.id;

    const { data, error } = await supabase
        .from('productos')
        .select('*')
        .eq('id_local', id_local)
        .eq('disponible', 1);

    if (error) {
        console.error('Error Supabase:', error);
        return res.status(500).json({ error: 'Error al obtener productos: ' + error.message });
    }
    res.json(data);
});

// Registrar un pedido real
app.post('/api/pedidos', async (req, res) => {
    const { id_estudiante, id_local, total_pagar, metodo_pago, articulos } = req.body;

    if (!id_estudiante || !id_local || !total_pagar || !metodo_pago || !articulos || articulos.length === 0) {
        return res.status(400).json({ error: 'Datos de pedido incompletos.' });
    }

    // 1. Insertar el pedido principal
    const { data: pedidoData, error: pedidoError } = await supabase
        .from('pedidos')
        .insert({ id_estudiante, id_local, total_pagar, metodo_pago, estado_actual: 'En cocina' })
        .select('id_pedido')
        .single();

    if (pedidoError) {
        console.error('Error al insertar pedido:', pedidoError);
        return res.status(500).json({ error: 'Error al guardar el pedido: ' + pedidoError.message });
    }

    const id_pedido = pedidoData.id_pedido;

    // 2. Insertar el desglose de productos
    const detalles = articulos.map(art => ({
        id_pedido,
        id_producto: art.id_producto,
        cantidad: art.cantidad,
        subtotal: art.subtotal
    }));

    const { error: detalleError } = await supabase
        .from('detalle_pedidos')
        .insert(detalles);

    if (detalleError) {
        // Compensar: eliminar el pedido ya guardado si fallan los detalles
        await supabase.from('pedidos').delete().eq('id_pedido', id_pedido);
        console.error('Error al insertar detalles:', detalleError);
        return res.status(500).json({ error: 'Error al guardar el desglose: ' + detalleError.message });
    }

    res.json({ mensaje: '¡Pedido guardado con éxito!', id_pedido });
});

// Consultar el estado actual de un pedido (polling del cliente)
app.get('/api/pedido/:id/estado', async (req, res) => {
    const id_pedido = req.params.id;

    const { data, error } = await supabase
        .from('pedidos')
        .select('estado_actual')
        .eq('id_pedido', id_pedido)
        .maybeSingle();

    if (error) {
        console.error('Error Supabase:', error);
        return res.status(500).json({ error: 'Error al consultar estado: ' + error.message });
    }
    if (!data) return res.status(404).json({ error: 'Pedido no encontrado.' });

    res.json({ estado_actual: data.estado_actual });
});

// Exportar app para Vercel Serverless
module.exports = app;

// Servidor local (solo en desarrollo)
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5500;
    app.listen(PORT, () => {
        console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    });
}
