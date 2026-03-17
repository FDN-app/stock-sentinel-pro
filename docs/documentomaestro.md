# 📋 DOCUMENTO MAESTRO — Stock Control
**Versión:** 2.0  
**Fecha de actualización:** Marzo 2026  
**Estado actual:** Prototipo UI completado → Fase de desarrollo local iniciada

---

## 1. VISIÓN DEL PRODUCTO

**Stock Control** es una aplicación web de gestión de inventario para restaurantes, diseñada para eliminar el caos del control manual de stock. Permite registrar, monitorear y gestionar insumos organizados por categorías (carnes, vegetales, aves, mariscos), con alertas automáticas de stock bajo y vencimientos próximos.

### Problema que resuelve
Los restaurantes pierden entre un 4-10% de sus ingresos anuales por mermas, vencimientos no detectados y compras desorganizadas. La gestión manual en hojas de cálculo o cuadernos no escala y genera errores humanos costosos.

### Propuesta de valor
Una solución visual, intuitiva y rápida que cualquier encargado de cocina puede operar sin entrenamiento técnico.

---

## 2. STACK TECNOLÓGICO

| Capa | Tecnología | Propósito |
|------|-----------|-----------|
| Framework UI | React + Vite | Interfaz reactiva y rápida |
| Lenguaje | TypeScript | Código con tipado seguro |
| Componentes | shadcn/ui | Componentes profesionales pre-diseñados |
| Estilos | Tailwind CSS | Diseño rápido y consistente |
| Plataforma dev | Lovable | Prototipado con IA |
| IDE local | Cursor / Antigravity | Desarrollo y refinamiento local |
| Control de versiones | Git + GitHub | Sincronización Lovable ↔ local |

---

## 3. ROLES DE USUARIO

### 👤 Administrador
- Acceso completo a todos los módulos
- Puede crear/editar/eliminar insumos
- Gestiona usuarios y permisos
- Visualiza reportes y estadísticas

### 👤 Staff (Encargado de cocina)
- Puede registrar entradas y salidas de stock
- Visualiza el inventario actual
- Crea requisiciones
- No puede modificar configuraciones del sistema

---

## 4. MÓDULOS Y PANTALLAS

### 4.1 Dashboard (Inicio)
**Propósito:** Vista general del estado del inventario en tiempo real.

**Elementos clave:**
- Tarjetas de resumen: Total de insumos, ítems en alerta, ítems por vencer
- Gráfico de distribución por categoría
- Lista de alertas críticas (stock bajo + próximos vencimientos)
- Accesos rápidos a acciones frecuentes

### 4.2 Gestión de Stock
**Propósito:** Listado completo del inventario con filtros y búsqueda.

**Elementos clave:**
- Tabla con: nombre, categoría, cantidad actual, unidad, stock mínimo, fecha de vencimiento, estado
- Filtros por categoría (Carnes / Vegetales / Aves / Mariscos / Todos)
- Buscador por nombre
- Indicadores de color: 🔴 Crítico / 🟡 Bajo / 🟢 Normal
- Botones: Editar, Eliminar, Ver historial

### 4.3 Carga de Stock
**Propósito:** Registrar entradas de nuevos insumos o reposición de existentes.

**Elementos clave:**
- Formulario: seleccionar insumo, cantidad, unidad, fecha de vencimiento, proveedor
- Opción de registrar insumo nuevo durante la carga
- Confirmación y registro en historial automático

### 4.4 Fichas Técnicas
**Propósito:** Documentar las recetas y sus ingredientes con cantidades exactas.

**Elementos clave:**
- Lista de fichas técnicas existentes
- Formulario de creación: nombre del plato, porciones, lista de ingredientes con cantidad y unidad
- Cálculo automático de costo por porción (fase futura)

### 4.5 Requisiciones
**Propósito:** Generar solicitudes de compra cuando el stock está bajo.

**Elementos clave:**
- Crear requisición manual o desde alerta automática
- Lista de ítems a pedir con cantidad sugerida
- Estado: Pendiente / Aprobada / Entregada
- Exportar como PDF (fase futura)

### 4.6 Historial
**Propósito:** Trazabilidad completa de todos los movimientos de inventario.

**Elementos clave:**
- Tabla cronológica de movimientos (entradas, salidas, ajustes)
- Filtros por fecha, tipo de movimiento, categoría
- Usuario responsable de cada movimiento

### 4.7 Usuarios
**Propósito:** Gestión de cuentas y permisos (solo Admin).

**Elementos clave:**
- Lista de usuarios activos
- Crear / editar / desactivar usuarios
- Asignar rol: Admin o Staff

### 4.8 Configuración
**Propósito:** Parámetros globales del sistema.

**Elementos clave:**
- Nombre del restaurante
- Umbrales de alerta (ej: alertar cuando quede menos del 20% del stock mínimo)
- Categorías de insumos (editable)
- Unidades de medida disponibles

---

## 5. MOCK DATA (Prototipo)

### Insumos de ejemplo
```
Lomo de res     | Carnes    | 8 kg    | Mín: 5 kg   | Vence: 05-Mar  | 🟢 OK
Pechuga pollo   | Aves      | 2 kg    | Mín: 4 kg   | Vence: 04-Mar  | 🔴 Crítico
Salmón          | Mariscos  | 3 kg    | Mín: 3 kg   | Vence: 07-Mar  | 🟡 Bajo
Tomate cherry   | Vegetales | 5 kg    | Mín: 2 kg   | Vence: 10-Mar  | 🟢 OK
Cebolla         | Vegetales | 1 kg    | Mín: 3 kg   | Vence: 15-Mar  | 🔴 Crítico
```

### Usuarios de ejemplo
```
Admin     | Carlos Méndez  | admin@restaurante.com    | Administrador
Staff     | Ana Torres     | ana@restaurante.com      | Encargada Cocina
Staff     | Luis Paredes   | luis@restaurante.com     | Ayudante Cocina
```

---

## 6. SISTEMA DE DISEÑO

| Elemento | Valor |
|---------|-------|
| Color primario | `#1E3A5F` (azul marino profesional) |
| Color de acento | `#F59E0B` (ámbar — alertas) |
| Color éxito | `#10B981` (verde) |
| Color peligro | `#EF4444` (rojo) |
| Tipografía | Inter / System UI |
| Bordes | Rounded-lg (8px) |
| Componentes base | shadcn/ui |

---

## 7. ROADMAP DE DESARROLLO

### ✅ FASE 0 — Prototipo (COMPLETADA)
- [x] Prototipo UI completo en Lovable con mock data
- [x] 8 pantallas diseñadas y navegables
- [x] Sistema de alertas visuales (colores por estado)
- [x] Documentación técnica y de negocio creadas
- [x] Repositorio clonado en entorno local (Cursor / Antigravity)

### 🔄 FASE 1 — Estabilización local (EN CURSO)
- [ ] Verificar que `npm run dev` corra sin errores localmente
- [ ] Auditar la estructura de carpetas del proyecto
- [ ] Identificar y documentar todos los componentes existentes
- [ ] Limpiar código generado por Lovable (comentarios, código muerto)
- [ ] Configurar ESLint y Prettier para consistencia de código

### ⏳ FASE 2 — Base de datos (PRÓXIMA)
- [ ] Elegir solución de persistencia: Supabase (recomendado) o IndexedDB local
- [ ] Modelar esquema de tablas: `products`, `movements`, `users`, `categories`
- [ ] Reemplazar mock data por datos reales de la BD
- [ ] Implementar operaciones CRUD completas

### ⏳ FASE 3 — Autenticación
- [ ] Login con email/contraseña
- [ ] Sistema de roles Admin / Staff funcional
- [ ] Rutas protegidas por rol

### ⏳ FASE 4 — Funcionalidades avanzadas
- [ ] Alertas automáticas por email/notificación
- [ ] Exportación de requisiciones a PDF
- [ ] Reportes y gráficos de consumo histórico
- [ ] Cálculo de costos en fichas técnicas

---

## 8. ESTRUCTURA DE ARCHIVOS ESPERADA

```
stock-control/
├── src/
│   ├── components/
│   │   ├── ui/           ← Componentes shadcn/ui base
│   │   ├── layout/       ← Navbar, Sidebar, Layout wrapper
│   │   └── shared/       ← Componentes reutilizables propios
│   ├── pages/            ← Una carpeta/archivo por pantalla
│   │   ├── Dashboard.tsx
│   │   ├── Stock.tsx
│   │   ├── LoadStock.tsx
│   │   ├── TechnicalSheets.tsx
│   │   ├── Requisitions.tsx
│   │   ├── History.tsx
│   │   ├── Users.tsx
│   │   └── Settings.tsx
│   ├── data/             ← Mock data centralizada
│   │   └── mockData.ts
│   ├── types/            ← Tipos TypeScript globales
│   │   └── index.ts
│   ├── hooks/            ← Custom hooks (futuro)
│   ├── lib/              ← Utilidades y helpers
│   └── App.tsx           ← Router principal
├── public/
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

---

## 9. MODELO DE NEGOCIO

### Segmento objetivo
Restaurantes pequeños y medianos (10-80 empleados) sin sistema de inventario digital.

### Monetización — Modelo SaaS
| Plan | Precio/mes | Usuarios | Insumos |
|------|-----------|----------|---------|
| Básico | $29 USD | 2 | 100 |
| Profesional | $59 USD | 10 | Ilimitados |
| Enterprise | $149 USD | Ilimitados | Ilimitados + API |

### Métricas de éxito (MVP)
- 10 restaurantes piloto en mes 3
- Reducción del 30% en mermas reportada por usuarios
- NPS > 40 al finalizar período de prueba

---

## 10. DECISIONES TÉCNICAS CLAVE

| Decisión | Elección | Razón |
|---------|---------|-------|
| Framework | React + Vite | Ecosistema maduro, rápido, buena DX |
| Componentes | shadcn/ui | No es una librería dependiente, el código es tuyo |
| Estilos | Tailwind | Velocidad de desarrollo, consistencia |
| BD (planeada) | Supabase | BaaS con auth incluido, tier gratuito generoso |
| Prototipado | Lovable | Permite validar UI antes de invertir en backend |
| IDE | Cursor | IA integrada que acelera el desarrollo |

---

## 11. GLOSARIO

| Término | Significado |
|---------|------------|
| Mock data | Datos de prueba inventados para mostrar la UI sin BD real |
| CRUD | Create, Read, Update, Delete — las 4 operaciones básicas de datos |
| BaaS | Backend as a Service (ej: Supabase) |
| Componente | Pieza reutilizable de UI en React |
| SaaS | Software as a Service — modelo de suscripción web |
| ESLint | Herramienta que detecta errores de código automáticamente |

---

*Documento mantenido por: Fernando + Dev (Claude)*  
*Próxima revisión: Al completar Fase 1*