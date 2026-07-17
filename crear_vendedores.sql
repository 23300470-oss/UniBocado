-- ==============================================================
-- EJECUTA ESTO EN EL SQL EDITOR DE SUPABASE
-- Crea cuentas de vendedores para la Cafetería, Local 1 y Local 2
-- ==============================================================

-- 1. Elimina registros previos con estos IDs para evitar duplicación
DELETE FROM empleados_locales WHERE id_empleado IN (1, 2, 3);

-- 2. Inserta los encargados asociados a cada local
-- Nota: La contraseña encriptada para todos es: vendedor123
INSERT INTO empleados_locales (id_empleado, id_local, nombre_completo, correo, contrasena) VALUES 
(1, 1, 'Encargado Cafetería', 'cafeteria@correo.com', '$2a$10$PKbxpFE6xdoN7cGjoI9lterGElD8..Do4SH5UXNuAlBdQB95mbMNu'),
(2, 2, 'Encargado Local 1', 'local1@correo.com', '$2a$10$PKbxpFE6xdoN7cGjoI9lterGElD8..Do4SH5UXNuAlBdQB95mbMNu'),
(3, 3, 'Encargado Local 2', 'local2@correo.com', '$2a$10$PKbxpFE6xdoN7cGjoI9lterGElD8..Do4SH5UXNuAlBdQB95mbMNu');

-- 3. Actualiza la secuencia de autoincremento para evitar errores en futuros registros
SELECT setval('empleados_locales_id_empleado_seq', COALESCE((SELECT MAX(id_empleado)+1 FROM empleados_locales), 1), false);
