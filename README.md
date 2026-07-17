# 🐭 UniBocado 🍔

¡Bienvenido a **UniBocado**, la aplicación web definitiva para gestionar y realizar pedidos de comida dentro del campus universitario de forma rápida, segura y deliciosa!

Diseñada pensando en los estudiantes y vendedores, UniBocado cuenta con una mascota muy especial, el **Ratoncito Chef**, que te acompañará en todo el proceso.

---

## 🚀 Características Principales

### 👨‍🎓 Para los Estudiantes (Clientes)
- **Registro y Acceso Seguro**: Cuentas personales protegidas mediante encriptación avanzada de contraseñas con `bcrypt`.
- **Exploración de Locales**: Consulta los diferentes establecimientos de comida dentro del campus y sus ubicaciones en tiempo real.
- **Menú Interactivo**: Visualiza los platillos, bebidas y postres disponibles con fotos, descripciones detalladas y precios.
- **Carrito de Compras**: Agrega tus alimentos favoritos, gestiona las cantidades y calcula el total a pagar automáticamente.
- **Pedidos en Tiempo Real**: Envía tus pedidos y selecciona tu método de pago preferido.
- **Monitoreo de Estado**: Consulta el estado de tu pedido (en cocina, listo para recoger o entregado).

### 🏪 Para los Vendedores (Establecimientos)
- **Panel de Control**: Acceso dedicado para administradores y empleados de cada local.
- **Gestión de Pedidos en Tiempo Real**: Recepción inmediata de nuevos pedidos con el nombre del estudiante y el desglose de productos.
- **Actualización de Estado**: Cambia el estado del pedido conforme progresa (`En cocina` ➡️ `Listo` ➡️ `Entregado`).
- **Control de Menú**: 
  - Agregar nuevos platillos, bebidas o postres.
  - Editar la información de productos existentes (precio, descripción, categoría, imagen).
  - Activar/desactivar la disponibilidad de un producto al instante.

---

## 🛠️ Stack Tecnológico

- **Frontend**: HTML5, CSS3 (Diseño responsivo móvil y estético), Vanilla JavaScript.
- **Backend**: Node.js, Express.js, CORS.
- **Base de Datos**: MySQL (utilizando la librería `mysql2` para consultas eficientes y transacciones seguras).
- **Seguridad**: Cifrado Hash de contraseñas con `bcrypt`.

---

## 📋 Requisitos Previos

Asegúrate de tener instalado en tu computadora:
- [Node.js](https://nodejs.org/) (versión 16 o superior recomendada)
- [MySQL Server](https://dev.mysql.com/downloads/mysql/) y MySQL Workbench (u otro cliente SQL)

---

## ⚙️ Instalación y Configuración

Sigue estos pasos para poner a funcionar UniBocado en tu computadora:

### 1. Clonar el repositorio (o descargar los archivos)
```bash
git clone https://github.com/23300470-oss/UniBocado.git
cd UniBocado
```

### 2. Configurar la Base de Datos MySQL
1. Abre tu cliente MySQL (por ejemplo, **MySQL Workbench**).
2. Crea una base de datos llamada `uni_bocado`:
   ```sql
   CREATE DATABASE uni_bocado;
   ```
3. Ejecuta los scripts de creación de tablas necesarios (puedes estructurar tus tablas según la lógica de `seed.js`). Las tablas principales requeridas son:
   - `establecimientos`
   - `empleados_locales`
   - `categorias`
   - `productos`
   - `estudiantes`
   - `pedidos`
   - `detalle_pedidos`

### 3. Configurar las credenciales de conexión
Abre el archivo [server.js](file:///c:/Users/Usuario/Desktop/Uni-Bocado-App%20-%20copia/server.js) y [seed.js](file:///c:/Users/Usuario/Desktop/Uni-Bocado-App%20-%20copia/seed.js) y actualiza los parámetros de la conexión si utilizas un usuario o contraseña diferente en tu MySQL:
```javascript
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'TU_CONTRASEÑA_DE_WORKBENCH',
    database: 'uni_bocado'
});
```

### 4. Instalar las dependencias de Node.js
Ejecuta el siguiente comando en la carpeta raíz del proyecto para descargar todas las librerías necesarias (Express, Mysql2, Bcrypt, Cors):
```bash
npm install
```

### 5. Precargar Datos de Prueba (Seeder)
Para rellenar la base de datos automáticamente con establecimientos, categorías, productos de prueba y una cuenta de vendedor de demostración, ejecuta:
```bash
node seed.js
```
*Esto creará el vendedor con el correo `vendedor@correo.com` y contraseña `vendedor123`.*

### 6. Iniciar el Servidor Backend
Enciende el backend ejecutando:
```bash
node server.js
```
Deberías ver el mensaje: `Servidor backend corriendo en http://localhost:5500` y `Conexión exitosa a la base de datos MySQL.`

### 7. Ejecutar la Aplicación
Abre el archivo [index.html](file:///c:/Users/Usuario/Desktop/Uni-Bocado-App%20-%20copia/index.html) directamente en tu navegador (puedes usar la extensión de VS Code **Live Server** para una mejor experiencia) e inicia a navegar por la app.

---

## 🎨 Diseños y Mockups
El proyecto incluye la documentación visual y flujos de pantallas detallados para referencia en formato PDF:
- [UI Cliente (PDF)](file:///c:/Users/Usuario/Desktop/Uni-Bocado-App%20-%20copia/UICliente.pdf)
- [UI Vendedor (PDF)](file:///c:/Users/Usuario/Desktop/Uni-Bocado-App%20-%20copia/UIvendedor.pdf)

---

## 👥 Colaboradores
- **23300470-oss** - Propietario del Proyecto y Desarrollo Principal.
