-- ==============================================================
-- SCHEMA PARA POSTGRESQL / SUPABASE - UNI_BOCADO
-- ==============================================================

-- 1. LIMPIEZA DE TABLAS EXISTENTES (Si existen, en orden inverso)
DROP TABLE IF EXISTS historial_estados CASCADE;
DROP TABLE IF EXISTS detalle_pedidos CASCADE;
DROP TABLE IF EXISTS pedidos CASCADE;
DROP TABLE IF EXISTS productos CASCADE;
DROP TABLE IF EXISTS categorias CASCADE;
DROP TABLE IF EXISTS empleados_locales CASCADE;
DROP TABLE IF EXISTS estudiantes CASCADE;
DROP TABLE IF EXISTS establecimientos CASCADE;

-- 2. CREACIÓN DE LAS TABLAS

-- Tabla 1: Establecimientos (Soporta fotos Base64 con el tipo TEXT)
CREATE TABLE establecimientos (
    id_local SERIAL PRIMARY KEY,
    nombre_negocio VARCHAR(100) NOT NULL,
    correo_encargado VARCHAR(100) NOT NULL,
    contrasena VARCHAR(255) NOT NULL,
    ubicacion_campus VARCHAR(150) NOT NULL,
    foto_url TEXT
);

-- Tabla 2: Estudiantes
CREATE TABLE estudiantes (
    id_estudiante SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    correo VARCHAR(100) NOT NULL,
    contrasena VARCHAR(255) NOT NULL
);

-- Tabla 3: Empleados del Local (Vendedores)
CREATE TABLE empleados_locales (
    id_empleado SERIAL PRIMARY KEY,
    id_local INT NOT NULL,
    nombre_completo VARCHAR(100) NOT NULL,
    correo VARCHAR(100) NOT NULL,
    contrasena VARCHAR(255) NOT NULL,
    CONSTRAINT fk_empleados_local FOREIGN KEY (id_local) REFERENCES establecimientos(id_local) ON DELETE CASCADE
);

-- Tabla 4: Categorías de Platillos
CREATE TABLE categorias (
    id_categoria SERIAL PRIMARY KEY,
    id_local INT NOT NULL,
    nombre_categoria VARCHAR(50) NOT NULL,
    CONSTRAINT fk_categorias_local FOREIGN KEY (id_local) REFERENCES establecimientos(id_local) ON DELETE CASCADE
);

-- Tabla 5: Productos / Platillos
CREATE TABLE productos (
    id_product SERIAL PRIMARY KEY,
    id_local INT NOT NULL,
    id_categoria INT NOT NULL,
    nombre_platillo VARCHAR(100) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(6,2) NOT NULL,
    foto_url TEXT,
    disponible SMALLINT DEFAULT 1 CHECK (disponible IN (0, 1)),
    CONSTRAINT fk_productos_local FOREIGN KEY (id_local) REFERENCES establecimientos(id_local) ON DELETE CASCADE,
    CONSTRAINT fk_productos_categoria FOREIGN KEY (id_categoria) REFERENCES categorias(id_categoria) ON DELETE CASCADE
);

-- Tabla 6: Pedidos Generales
CREATE TABLE pedidos (
    id_pedido SERIAL PRIMARY KEY,
    id_estudiante INT NOT NULL,
    id_local INT NOT NULL,
    total_pagar DECIMAL(7,2) NOT NULL,
    metodo_pago VARCHAR(20) NOT NULL CHECK (metodo_pago IN ('Efectivo', 'Tarjeta')),
    estado_actual VARCHAR(20) DEFAULT 'En cocina' CHECK (estado_actual IN ('En cocina', 'Listo', 'Entregado')),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_pedidos_estudiante FOREIGN KEY (id_estudiante) REFERENCES estudiantes(id_estudiante) ON DELETE CASCADE,
    CONSTRAINT fk_pedidos_local FOREIGN KEY (id_local) REFERENCES establecimientos(id_local) ON DELETE CASCADE
);

-- Tabla 7: Detalle de cada Pedido (Productos comprados)
CREATE TABLE detalle_pedidos (
    id_detalle SERIAL PRIMARY KEY,
    id_pedido INT NOT NULL,
    id_producto INT NOT NULL,
    cantidad INT NOT NULL,
    subtotal DECIMAL(6,2) NOT NULL,
    CONSTRAINT fk_detalle_pedido FOREIGN KEY (id_pedido) REFERENCES pedidos(id_pedido) ON DELETE CASCADE,
    CONSTRAINT fk_detalle_producto FOREIGN KEY (id_producto) REFERENCES productos(id_product) ON DELETE CASCADE
);

-- Tabla 8: Historial de Estados de los pedidos
CREATE TABLE historial_estados (
    id_historial SERIAL PRIMARY KEY,
    id_pedido INT NOT NULL,
    estado_registrado VARCHAR(20) NOT NULL CHECK (estado_registrado IN ('En cocina', 'Listo', 'Entregado')),
    fecha_cambio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_historial_pedido FOREIGN KEY (id_pedido) REFERENCES pedidos(id_pedido) ON DELETE CASCADE
);


-- ==============================================================
-- 3. PRECARGA DE DATOS (SEED)
-- ==============================================================

INSERT INTO establecimientos (id_local, nombre_negocio, correo_encargado, contrasena, ubicacion_campus, foto_url) VALUES 
(1, 'Cafetaria', 'cafeteria@uttt.edu.mx', '123', 'Edificio Principal (Edificio A)', 'ratoncito.png'),
(2, 'Local 1', 'local1@uttt.edu.mx', '123', 'Edificio de Ingeniería (Edificio B)', 'Tazita.png'),
(3, 'Local 2', 'local2@uttt.edu.mx', '123', 'Edificio de Ciencias (Edificio C)', 'raton _dona.png');

-- Contraseña encriptada para el vendedor (vendedor123)
INSERT INTO empleados_locales (id_empleado, id_local, nombre_completo, correo, contrasena) VALUES 
(1, 1, 'Juan Perez', 'vendedor@correo.com', '$2b$10$PKbxpFE6xdoN7cGjoI9lterGElD8..Do4SH5UXNuAlBdQB95mbMNu');

INSERT INTO categorias (id_categoria, id_local, nombre_categoria) VALUES 
(1, 1, 'Comida'), (2, 1, 'Bebidas'), (3, 1, 'Postres'),
(4, 2, 'Comida'), (5, 2, 'Bebidas'), (6, 2, 'Postres'),
(7, 3, 'Comida'), (8, 3, 'Bebidas'), (9, 3, 'Postres');

INSERT INTO productos (id_product, id_local, id_categoria, nombre_platillo, descripcion, precio, foto_url, disponible) VALUES 
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
(12, 1, 3, 'Pay de limón', 'Fresco pay frío de limón con galletas marías trituradas', 25.00, 'raton _dona.png', 1);

-- Ajustar las secuencias de IDs automáticos para que no fallen los inserts posteriores sin id explícito
SELECT setval('establecimientos_id_local_seq', COALESCE((SELECT MAX(id_local)+1 FROM establecimientos), 1), false);
SELECT setval('empleados_locales_id_empleado_seq', COALESCE((SELECT MAX(id_empleado)+1 FROM empleados_locales), 1), false);
SELECT setval('categorias_id_categoria_seq', COALESCE((SELECT MAX(id_categoria)+1 FROM categorias), 1), false);
SELECT setval('productos_id_product_seq', COALESCE((SELECT MAX(id_product)+1 FROM productos), 1), false);
