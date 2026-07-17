-- ==============================================================
-- EJECUTA ESTO EN EL SQL EDITOR DE SUPABASE
-- Desactiva Row Level Security para que la app pueda leer/escribir datos
-- ==============================================================

ALTER TABLE establecimientos DISABLE ROW LEVEL SECURITY;
ALTER TABLE estudiantes DISABLE ROW LEVEL SECURITY;
ALTER TABLE empleados_locales DISABLE ROW LEVEL SECURITY;
ALTER TABLE categorias DISABLE ROW LEVEL SECURITY;
ALTER TABLE productos DISABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos DISABLE ROW LEVEL SECURITY;
ALTER TABLE detalle_pedidos DISABLE ROW LEVEL SECURITY;
ALTER TABLE historial_estados DISABLE ROW LEVEL SECURITY;
