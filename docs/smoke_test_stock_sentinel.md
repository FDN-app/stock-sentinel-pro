# 🧪 SMOKE TEST — Stock Sentinel
**Fecha:** __________  
**Testeador:** __________  
**Ambiente:** - [ ] Local (localhost:8080) - [ ] Production (Vercel)  
**Versión:** __________

---

## 👤 ROL A TESTEAR
- [ ] Admin  
- [ ] Staff

> Repetir el test completo para cada rol. Algunos pasos solo aplican a Admin.

---

## A) AUTENTICACIÓN

| # | Acción | Resultado esperado | - [ ] |
|---|--------|-------------------|---|
| 1 | Ir a la URL de la app sin sesión | Redirige al login | - [ ] |
| 2 | Ingresar email/contraseña incorrectos | Muestra mensaje de error | - [ ] |
| 3 | Ingresar con `admin@stocksentinel.local` | Entra al Dashboard como Admin | - [ ] |
| 4 | Ingresar con `staff@stocksentinel.local` | Entra al Dashboard como Staff | - [ ] |
| 5 | Recargar la página estando logueado | La sesión persiste | - [ ] |
| 6 | Cerrar sesión | Redirige al login | - [ ] |
| 7 | Intentar entrar a `/gestion` sin sesión | Redirige al login | - [ ] |

**Bugs encontrados:**
```
1. 
2. 
```

---

## B) DASHBOARD

| # | Acción | Resultado esperado | - [ ] |
|---|--------|-------------------|---|
| 1 | Entrar al Dashboard | Carga sin errores en consola | - [ ] |
| 2 | Ver tarjetas de resumen | Muestran: Total insumos, Alertas, Por vencer | - [ ] |
| 3 | Ver alertas críticas | Lista productos con stock bajo o por vencer | - [ ] |
| 4 | Ver gráfico de distribución | Se renderiza correctamente | - [ ] |
| 5 | Hacer clic en accesos rápidos | Navegan a la pantalla correcta | - [ ] |

**Bugs encontrados:**
```
1. 
2. 
```

---

## C) GESTIÓN DE STOCK (`/gestion`)

### C1 — Visualización
| # | Acción | Resultado esperado | - [ ] |
|---|--------|-------------------|---|
| 1 | Entrar a Gestión de Stock | Tabla carga con productos reales de Supabase | - [ ] |
| 2 | Ver categorías | Aparecen agrupadas (Carnes, Aves, etc.) | - [ ] |
| 3 | Ver categoría vacía | Muestra "Sin productos" (no fila vacía) | - [ ] |
| 4 | Ver columna Vencimiento | Muestra fecha o badge de alerta | - [ ] |
| 5 | Stock = 0 | Badge rojo visible | - [ ] |
| 6 | Stock bajo mínimo | Badge amarillo visible | - [ ] |
| 7 | Stock sobre mínimo | Badge verde visible | - [ ] |

### C2 — Agregar producto (solo Admin)
| # | Acción | Resultado esperado | - [ ] |
|---|--------|-------------------|---|
| 1 | Clic en "Agregar Ítem" | Abre modal con formulario | - [ ] |
| 2 | Intentar guardar vacío | Muestra validación de campos requeridos | - [ ] |
| 3 | Completar todos los campos + fecha vencimiento | Se puede ingresar fecha | - [ ] |
| 4 | Guardar producto nuevo | Aparece en la tabla inmediatamente | - [ ] |
| 5 | Recargar página | El producto persiste (guardado en Supabase) | - [ ] |

### C3 — Editar producto
| # | Acción | Resultado esperado | - [ ] |
|---|--------|-------------------|---|
| 1 | Clic en ícono Editar (lápiz) | Abre modal con datos del producto | - [ ] |
| 2 | Modificar fecha de vencimiento | El campo date es editable | - [ ] |
| 3 | Guardar cambios | Se actualiza en la tabla | - [ ] |
| 4 | Recargar página | Los cambios persisten | - [ ] |

### C4 — Agregar categoría (solo Admin)
| # | Acción | Resultado esperado | - [ ] |
|---|--------|-------------------|---|
| 1 | Clic en "Agregar Categoría" | Abre modal o input | - [ ] |
| 2 | Guardar categoría "Test" | Aparece en la tabla | - [ ] |
| 3 | Recargar página | La categoría persiste | - [ ] |

**Bugs encontrados:**
```
1. 
2. 
```

---

## D) CARGA DE STOCK (`/carga`)

| # | Acción | Resultado esperado | - [ ] |
|---|--------|-------------------|---|
| 1 | Entrar a Carga de Stock | Tabla carga con productos | - [ ] |
| 2 | Filtrar por categoría | Muestra solo productos de esa categoría | - [ ] |
| 3 | Buscar por nombre | Filtra correctamente | - [ ] |
| 4 | Modificar cantidad actual (inline) | El campo es editable | - [ ] |
| 5 | Ingresar fecha de vencimiento | Campo date funciona | - [ ] |
| 6 | Fecha a menos de 7 días | Badge rojo visible | - [ ] |
| 7 | Fecha entre 7-30 días | Badge amarillo visible | - [ ] |
| 8 | Clic en "Guardar Cambios" | Muestra confirmación (toast) | - [ ] |
| 9 | Clic en "Descartar" | Revierte los cambios | - [ ] |
| 10 | Clic en "Nuevo Producto" | Abre modal con formulario completo | - [ ] |
| 11 | Guardar nuevo producto | Aparece en la tabla | - [ ] |

**Bugs encontrados:**
```
1. 
2. 
```

---

## E) FICHAS TÉCNICAS (`/fichas`)

| # | Acción | Resultado esperado | - [ ] |
|---|--------|-------------------|---|
| 1 | Entrar a Fichas Técnicas | Carga sin errores | - [ ] |
| 2 | Ver lista de fichas existentes | Se muestran correctamente | - [ ] |
| 3 | Crear nueva ficha | Abre formulario | - [ ] |
| 4 | Completar nombre del plato + ingredientes | Campos funcionan | - [ ] |
| 5 | Guardar ficha | Aparece en la lista | - [ ] |

**Bugs encontrados:**
```
1. 
2. 
```

---

## F) REQUISICIONES (`/requisiciones`)

| # | Acción | Resultado esperado | - [ ] |
|---|--------|-------------------|---|
| 1 | Entrar a Requisiciones | Carga lista de requisiciones | - [ ] |
| 2 | Crear requisición manual | Abre formulario | - [ ] |
| 3 | Completar ítem + cantidad | Campos funcionan | - [ ] |
| 4 | Guardar requisición | Aparece con estado "Pendiente" | - [ ] |
| 5 | Admin: cambiar estado a "Aprobada" | Cambia el estado | - [ ] |
| 6 | Staff: no puede cambiar estados | Botón bloqueado o no visible | - [ ] |

**Bugs encontrados:**
```
1. 
2. 
```

---

## G) HISTORIAL (`/historico`)

| # | Acción | Resultado esperado | - [ ] |
|---|--------|-------------------|---|
| 1 | Entrar a Historial | Carga tabla de movimientos | - [ ] |
| 2 | Ver movimientos registrados | Muestran fecha, producto, usuario | - [ ] |
| 3 | Filtrar por fecha | Funciona el filtro | - [ ] |
| 4 | Filtrar por tipo de movimiento | Funciona el filtro | - [ ] |

**Bugs encontrados:**
```
1. 
2. 
```

---

## H) USUARIOS (`/usuarios`) — Solo Admin

| # | Acción | Resultado esperado | - [ ] |
|---|--------|-------------------|---|
| 1 | Entrar a Usuarios como Admin | Ve lista de usuarios | - [ ] |
| 2 | Entrar a Usuarios como Staff | No tiene acceso (redirige o muestra error) | - [ ] |
| 3 | Crear nuevo usuario | Abre formulario | - [ ] |
| 4 | Asignar rol Staff | Se guarda correctamente | - [ ] |
| 5 | El usuario aparece en la lista | Visible inmediatamente | - [ ] |

**Bugs encontrados:**
```
1. 
2. 
```

---

## I) CONFIGURACIÓN (`/configuracion`) — Solo Admin

| # | Acción | Resultado esperado | - [ ] |
|---|--------|-------------------|---|
| 1 | Entrar a Configuración | Carga sin errores | - [ ] |
| 2 | Cambiar nombre del restaurante | Campo editable | - [ ] |
| 3 | Guardar cambios | Persisten al recargar | - [ ] |
| 4 | Staff no puede acceder | Ruta protegida | - [ ] |

**Bugs encontrados:**
```
1. 
2. 
```

---

## J) NAVEGACIÓN GENERAL

| # | Acción | Resultado esperado | - [ ] |
|---|--------|-------------------|---|
| 1 | Todos los links del sidebar | Navegan a la pantalla correcta | - [ ] |
| 2 | Recargar en cualquier ruta | No aparece error 404 | - [ ] |
| 3 | Botón atrás del navegador | Funciona correctamente | - [ ] |
| 4 | Abrir en mobile | Layout responsive | - [ ] |

---

## K) CONSOLA Y ERRORES (F12)

| # | Verificación | - [ ] |
|---|-------------|---|
| 1 | No hay errores rojos en consola | - [ ] |
| 2 | No hay errores de Supabase (401, 403, 500) | - [ ] |
| 3 | Las requests HTTP responden 200/201 | - [ ] |
| 4 | No hay errores de variables de entorno | - [ ] |

---

## 📊 RESULTADO FINAL

| Sección | Total | Pasaron | Fallaron |
|---------|-------|---------|---------|
| A) Autenticación | 7 | | |
| B) Dashboard | 5 | | |
| C) Gestión de Stock | 16 | | |
| D) Carga de Stock | 11 | | |
| E) Fichas Técnicas | 5 | | |
| F) Requisiciones | 6 | | |
| G) Historial | 4 | | |
| H) Usuarios | 5 | | |
| I) Configuración | 4 | | |
| J) Navegación | 4 | | |
| K) Consola | 4 | | |
| **TOTAL** | **71** | | |

---

## ✅ VEREDICTO

- [ ] **PASA** — Menos de 5 fallos → Puedo continuar al siguiente sprint  
- [ ] **ATENCIÓN** — Entre 5 y 15 fallos → Arreglar bugs antes de mostrar a usuarios  
- [ ] **FALLA** — Más de 15 fallos → Revisar en profundidad antes de continuar  

---

## 🐛 LISTA DE BUGS PRIORITARIOS

Completar al finalizar el test:

| Prioridad | Pantalla | Descripción del bug |
|-----------|----------|---------------------|
| 🔴 Alta | | |
| 🔴 Alta | | |
| 🟡 Media | | |
| 🟡 Media | | |
| 🟢 Baja | | |

---

*Stock Sentinel — Smoke Test v1.0*  
*Basado en metodología Labora Vibe Testing*
