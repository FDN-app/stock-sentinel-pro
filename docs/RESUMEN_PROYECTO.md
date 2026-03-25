# Resumen del Proyecto: Stock Savvy 21

Este documento proporciona una visión general y descriptiva de todos los avances, funcionalidades, integraciones y arquitectura técnica del proyecto Stock Savvy 21.

## 1. Arquitectura y Tecnologías Base

El proyecto es una aplicación web moderna construida (Single Page Application - SPA) centrada en el rendimiento, la tipado estricto y una experiencia de usuario fluida.

*   **Core:** React 18 con TypeScript.
*   **Empaquetador (Bundler):** Vite, para tiempos de construcción y recarga en caliente ultrarrápidos.
*   **Enrutamiento:** `react-router-dom` para la navegación gestionada en el cliente con protección de rutas.
*   **Manejo de Estado y Obtención de Datos:** `@tanstack/react-query` para fetching, caching y sincronización del estado que proviene del servidor.

## 2. Diseño e Interfaz de Usuario (UI/UX)

La interfaz de usuario está diseñada para ser limpia, accesible y altamente responsiva.

*   **Framework CSS:** Tailwind CSS.
*   **Librería de Componentes:** shadcn-ui, que proporciona componentes base de alta calidad, accesibles y personalizables construidos sobre **Radix UI** primitives.
*   **Iconografía:** Lucide React.
*   **Formularios:** `react-hook-form` combinado con `zod` para la validación estricta de esquemas de datos desde el lado del cliente (seguridad y experiencia de usuario).
*   **Gráficos y Visualización de datos:** `recharts` para mostrar estadísticas y métricas en el Dashboard.
*   **Notificaciones:** `sonner` / Radix Toast para alertas temporales e informativas al usuario.

## 3. Integraciones Principales

### Supabase (Backend as a Service)
Toda la lógica de persistencia visual, base de datos en tiempo real y autenticación recae en Supabase (`@supabase/supabase-js`).
*   **Autenticación:** Gestión completa de usuarios y sesiones.
*   **Base de Datos PostgreSQL:** Almacenamiento estructurado.
*   **Row Level Security (RLS):** Integrado asumiendo la estructura de organización y roles que restringen la visibilidad y acción de los datos según las políticas asociadas al contexto del usuario.

### Suscripciones y Pagos
A partir de la estructura de la base de datos, el proyecto contempla escalabilidad comercial (SaaS):
*   Tablas para gestión de pagos / facturación (`subscriptions`, `payment_failures`).
*   Integración teórica (o próxima) con **Stripe** para la gestión económica de planes organizacionales.

## 4. Funcionalidades Principales Desarrolladas

La aplicación se perfila como un sistema avanzado de **Gestión de Inventario y Solicitudes Multi-tenant** (soporte para múltiples organizaciones). A continuación se detallan los módulos principales:

### 4.1. Autenticación y Control de Acceso
*   **Login seguro** de usuarios.
*   **Protección de Rutas (`ProtectedRoute`):** El acceso al Dashboard y sus sub-rutas está protegido con un contexto de autenticación.
*   **Gestión de Roles (`app_role`):** Clasificación en usuarios "admin" y "staff", permitiendo vistas granulares y control de accesos (como el panel de Usuarios o Settings exclusivos para administradores).

### 4.2. Panel de Control (Dashboard)
*   **Vista General:** Resumen métrico del estado del stock, alertas de expiración y estado de la organización.
*   **Diseño de Layout Principal:** Menús laterales o superiores que unifican toda la navegación del sistema a los siguientes módulos de gestión.

### 4.3. Gestión de Inventarios (Stock Management)
*   **Catálogo de Artículos (`items`):** Creación y edición de artículos con propiedades como SKU, marca, modelo, proveedor, costo, precio de venta, mínimo de stock, y stock recomendado. Categorización vinculada (`categories`).
*   **Columnas Personalizadas (`custom_columns` & `custom_column_values`):** Flexibilidad para que las organizaciones añadan campos o propiedades dinámicas a los artículos sin alterar la base de datos estructural.

### 4.4. Entradas y Movimientos de Stock (Stock Entries)
*   **Control de Lotes:** Registro de ingreso físico de mercancía (`stock_entries`), vinculando fechas críticas como **fechas de vencimiento / caducidad** e hitos de conteo con responsable de conteo y notas de estado.

### 4.5. Requisiciones (Requisitions)
Módulo completo para el flujo de solicitud de material de cara al personal staff hacia la administración.
*   **Tipos de Requisición:** 'product' (producto interno) y 'purchase' (solicitud de compra nueva).
*   **Estados de Flujo:** Gestión de la solicitud entre los estados 'pending', 'approved', 'rejected' y 'completed' indicando quién la solicitó y quién la aprobó de forma asíncrona.

### 4.6. Fichas Técnicas (Technical Sheets)
Módulo de consulta de información ampliada por producto. (Con base en la ruta `/dashboard/technical-sheets`). Permite enriquecer la información estructural que necesita visualización detallada, muy probablemente integrando URLs con hojas de especificaciones o adjuntos.

### 4.7. Historial de Actividad (Activity History)
Monitorización para auditoría continua de las acciones de los usuarios (`activity_logs`).
*   Registra quién hizo qué (`action_type`), la cantidad movida, la entidad afectada (Artículos, Categorías, o Requisiciones), además de anotaciones y metadatos extras.

### 4.8. Configuración y Multi-Tenancy (Organización)
La arquitectura de datos está diseñada de tal manera que cada `profile` se relaciona con una `organization`.
*   Tablas aisladas lógicamente por el `organization_id`.
*   **Settings de Organización (`organization_settings`):** Configuración en vivo sobre los montos en días para alertar por caducidad (ej. `expiration_alert_days`) y umbrales porcentuales de "Bajo Stock".

---
*Este documento resume la estructura lógica visible actual y puede evolucionar a medida que se desplieguen y terminen nuevas capas de negocio y lógica de producto en el repositorio.*
