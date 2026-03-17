export interface User {
  email: string;
  password: string;
  nombre: string;
  rol: 'Admin' | 'Staff';
}

export const USERS: User[] = [
  { email: 'admin@gmail.com', password: 'admin', nombre: 'Carlos Méndez', rol: 'Admin' },
  { email: 'staff@gmail.com', password: 'staff', nombre: 'María González', rol: 'Staff' },
];

export interface StockItem {
  id: number;
  producto: string;
  categoria: string;
  unidad: string;
  stockMinimo: number;
  cantidadActual: number;
  fechaConteo: string;
  vencimiento: string;
  responsable: string;
}

export const CATEGORIES = ['CARNE ROJA', 'VERDURAS', 'POLLO', 'PESCADO', 'FRUTAS', 'LÁCTEOS'];

export const STOCK_ITEMS: StockItem[] = [
  { id: 1, producto: 'Asado', categoria: 'CARNE ROJA', unidad: 'Kg', stockMinimo: 10, cantidadActual: 15, fechaConteo: '2026-02-28', vencimiento: '2026-03-10', responsable: 'Carlos Méndez' },
  { id: 2, producto: 'Vacío', categoria: 'CARNE ROJA', unidad: 'Kg', stockMinimo: 5, cantidadActual: 2, fechaConteo: '2026-02-28', vencimiento: '2026-03-15', responsable: 'Carlos Méndez' },
  { id: 3, producto: 'Bife de Chorizo', categoria: 'CARNE ROJA', unidad: 'Kg', stockMinimo: 8, cantidadActual: 12, fechaConteo: '2026-02-27', vencimiento: '2026-03-08', responsable: 'María González' },
  { id: 4, producto: 'Nalga', categoria: 'CARNE ROJA', unidad: 'Kg', stockMinimo: 5, cantidadActual: 6, fechaConteo: '2026-02-28', vencimiento: '2026-03-12', responsable: 'Carlos Méndez' },
  { id: 5, producto: 'Matambre', categoria: 'CARNE ROJA', unidad: 'Kg', stockMinimo: 4, cantidadActual: 3, fechaConteo: '2026-02-28', vencimiento: '2026-03-01', responsable: 'María González' },
  { id: 6, producto: 'Tomate', categoria: 'VERDURAS', unidad: 'Kg', stockMinimo: 5, cantidadActual: 8, fechaConteo: '2026-02-28', vencimiento: '2026-03-05', responsable: 'María González' },
  { id: 7, producto: 'Lechuga', categoria: 'VERDURAS', unidad: 'Unidad', stockMinimo: 10, cantidadActual: 12, fechaConteo: '2026-02-28', vencimiento: '2026-03-03', responsable: 'María González' },
  { id: 8, producto: 'Cebolla', categoria: 'VERDURAS', unidad: 'Kg', stockMinimo: 3, cantidadActual: 0, fechaConteo: '2026-02-27', vencimiento: '2026-03-20', responsable: 'Carlos Méndez' },
  { id: 9, producto: 'Papa', categoria: 'VERDURAS', unidad: 'Kg', stockMinimo: 3, cantidadActual: 1, fechaConteo: '2026-02-28', vencimiento: '2026-03-18', responsable: 'Carlos Méndez' },
  { id: 10, producto: 'Pechuga', categoria: 'POLLO', unidad: 'Kg', stockMinimo: 8, cantidadActual: 10, fechaConteo: '2026-02-28', vencimiento: '2026-03-06', responsable: 'María González' },
  { id: 11, producto: 'Muslo', categoria: 'POLLO', unidad: 'Kg', stockMinimo: 5, cantidadActual: 7, fechaConteo: '2026-02-28', vencimiento: '2026-03-07', responsable: 'Carlos Méndez' },
  { id: 12, producto: 'Pollo Entero', categoria: 'POLLO', unidad: 'Unidad', stockMinimo: 3, cantidadActual: 0, fechaConteo: '2026-02-27', vencimiento: '2026-03-04', responsable: 'María González' },
  { id: 13, producto: 'Salmón', categoria: 'PESCADO', unidad: 'Kg', stockMinimo: 3, cantidadActual: 4, fechaConteo: '2026-02-28', vencimiento: '2026-03-02', responsable: 'Carlos Méndez' },
  { id: 14, producto: 'Merluza', categoria: 'PESCADO', unidad: 'Kg', stockMinimo: 4, cantidadActual: 5, fechaConteo: '2026-02-28', vencimiento: '2026-03-14', responsable: 'María González' },
  { id: 15, producto: 'Manzana', categoria: 'FRUTAS', unidad: 'Kg', stockMinimo: 3, cantidadActual: 4, fechaConteo: '2026-02-28', vencimiento: '2026-03-10', responsable: 'Carlos Méndez' },
  { id: 16, producto: 'Naranja', categoria: 'FRUTAS', unidad: 'Kg', stockMinimo: 3, cantidadActual: 5, fechaConteo: '2026-02-28', vencimiento: '2026-03-12', responsable: 'María González' },
  { id: 17, producto: 'Banana', categoria: 'FRUTAS', unidad: 'Kg', stockMinimo: 2, cantidadActual: 3, fechaConteo: '2026-02-28', vencimiento: '2026-03-03', responsable: 'Carlos Méndez' },
  { id: 18, producto: 'Mozzarella', categoria: 'LÁCTEOS', unidad: 'Kg', stockMinimo: 3, cantidadActual: 2, fechaConteo: '2026-02-28', vencimiento: '2026-03-08', responsable: 'María González' },
];

export interface Requisicion {
  id: string;
  item: string;
  categoria: string;
  cantidadSolicitada: number;
  unidad: string;
  estado: 'Pendiente' | 'Aprobado' | 'Rechazado';
  fecha: string;
  solicitadoPor: string;
}

export const REQUISICIONES: Requisicion[] = [
  { id: 'REQ-001', item: 'Cebolla', categoria: 'VERDURAS', cantidadSolicitada: 10, unidad: 'Kg', estado: 'Pendiente', fecha: '2026-03-01', solicitadoPor: 'María González' },
  { id: 'REQ-002', item: 'Pollo Entero', categoria: 'POLLO', cantidadSolicitada: 5, unidad: 'Unidad', estado: 'Aprobado', fecha: '2026-02-28', solicitadoPor: 'Carlos Méndez' },
  { id: 'REQ-003', item: 'Salmón', categoria: 'PESCADO', cantidadSolicitada: 8, unidad: 'Kg', estado: 'Pendiente', fecha: '2026-03-01', solicitadoPor: 'María González' },
  { id: 'REQ-004', item: 'Vacío', categoria: 'CARNE ROJA', cantidadSolicitada: 10, unidad: 'Kg', estado: 'Aprobado', fecha: '2026-02-27', solicitadoPor: 'Carlos Méndez' },
  { id: 'REQ-005', item: 'Papa', categoria: 'VERDURAS', cantidadSolicitada: 15, unidad: 'Kg', estado: 'Rechazado', fecha: '2026-02-26', solicitadoPor: 'María González' },
  { id: 'REQ-006', item: 'Mozzarella', categoria: 'LÁCTEOS', cantidadSolicitada: 5, unidad: 'Kg', estado: 'Pendiente', fecha: '2026-03-01', solicitadoPor: 'Carlos Méndez' },
  { id: 'REQ-007', item: 'Matambre', categoria: 'CARNE ROJA', cantidadSolicitada: 8, unidad: 'Kg', estado: 'Aprobado', fecha: '2026-02-25', solicitadoPor: 'María González' },
  { id: 'REQ-008', item: 'Lechuga', categoria: 'VERDURAS', cantidadSolicitada: 20, unidad: 'Unidad', estado: 'Pendiente', fecha: '2026-03-01', solicitadoPor: 'Carlos Méndez' },
];

export interface HistoricoEntry {
  id: number;
  fecha: string;
  item: string;
  categoria: string;
  tipo: 'Entrada' | 'Salida' | 'Ajuste';
  cantidad: number;
  stockResultante: number;
  responsable: string;
}

export const HISTORICO: HistoricoEntry[] = [
  { id: 1, fecha: '2026-03-01 08:30', item: 'Asado', categoria: 'CARNE ROJA', tipo: 'Entrada', cantidad: 10, stockResultante: 15, responsable: 'Carlos Méndez' },
  { id: 2, fecha: '2026-03-01 08:30', item: 'Vacío', categoria: 'CARNE ROJA', tipo: 'Salida', cantidad: 3, stockResultante: 2, responsable: 'María González' },
  { id: 3, fecha: '2026-02-28 14:00', item: 'Tomate', categoria: 'VERDURAS', tipo: 'Entrada', cantidad: 5, stockResultante: 8, responsable: 'María González' },
  { id: 4, fecha: '2026-02-28 12:00', item: 'Cebolla', categoria: 'VERDURAS', tipo: 'Salida', cantidad: 4, stockResultante: 0, responsable: 'Carlos Méndez' },
  { id: 5, fecha: '2026-02-28 10:00', item: 'Pechuga', categoria: 'POLLO', tipo: 'Entrada', cantidad: 6, stockResultante: 10, responsable: 'María González' },
  { id: 6, fecha: '2026-02-27 16:00', item: 'Salmón', categoria: 'PESCADO', tipo: 'Ajuste', cantidad: -1, stockResultante: 4, responsable: 'Carlos Méndez' },
  { id: 7, fecha: '2026-02-27 14:00', item: 'Papa', categoria: 'VERDURAS', tipo: 'Salida', cantidad: 5, stockResultante: 1, responsable: 'María González' },
  { id: 8, fecha: '2026-02-27 10:00', item: 'Mozzarella', categoria: 'LÁCTEOS', tipo: 'Entrada', cantidad: 2, stockResultante: 2, responsable: 'Carlos Méndez' },
  { id: 9, fecha: '2026-02-26 15:00', item: 'Bife de Chorizo', categoria: 'CARNE ROJA', tipo: 'Entrada', cantidad: 12, stockResultante: 12, responsable: 'María González' },
  { id: 10, fecha: '2026-02-26 12:00', item: 'Muslo', categoria: 'POLLO', tipo: 'Salida', cantidad: 3, stockResultante: 7, responsable: 'Carlos Méndez' },
  { id: 11, fecha: '2026-02-26 09:00', item: 'Lechuga', categoria: 'VERDURAS', tipo: 'Entrada', cantidad: 12, stockResultante: 12, responsable: 'María González' },
  { id: 12, fecha: '2026-02-25 16:00', item: 'Pollo Entero', categoria: 'POLLO', tipo: 'Salida', cantidad: 2, stockResultante: 0, responsable: 'Carlos Méndez' },
  { id: 13, fecha: '2026-02-25 14:00', item: 'Matambre', categoria: 'CARNE ROJA', tipo: 'Ajuste', cantidad: -2, stockResultante: 3, responsable: 'María González' },
  { id: 14, fecha: '2026-02-25 10:00', item: 'Merluza', categoria: 'PESCADO', tipo: 'Entrada', cantidad: 5, stockResultante: 5, responsable: 'Carlos Méndez' },
  { id: 15, fecha: '2026-02-24 08:00', item: 'Nalga', categoria: 'CARNE ROJA', tipo: 'Entrada', cantidad: 6, stockResultante: 6, responsable: 'María González' },
];

export interface UserRecord {
  id: number;
  nombre: string;
  email: string;
  rol: 'Admin' | 'Staff';
  estado: 'Activo' | 'Inactivo';
  fechaAlta: string;
  avatar: string;
}

export const USER_RECORDS: UserRecord[] = [
  { id: 1, nombre: 'Carlos Méndez', email: 'admin@gmail.com', rol: 'Admin', estado: 'Activo', fechaAlta: '2025-01-15', avatar: 'CM' },
  { id: 2, nombre: 'María González', email: 'staff@gmail.com', rol: 'Staff', estado: 'Activo', fechaAlta: '2025-03-20', avatar: 'MG' },
  { id: 3, nombre: 'Juan Pérez', email: 'staff2@gmail.com', rol: 'Staff', estado: 'Inactivo', fechaAlta: '2025-06-10', avatar: 'JP' },
];

export interface FichaTecnica {
  id: number;
  producto: string;
  categoria: string;
  descripcion: string;
  proveedor: string;
  costoUnitario: number;
  ultimaActualizacion: string;
}

export const FICHAS_TECNICAS: FichaTecnica[] = [
  { id: 1, producto: 'Asado', categoria: 'CARNE ROJA', descripcion: 'Corte vacuno premium, ideal para parrilla. Procedencia nacional certificada.', proveedor: 'Frigorífico Norte S.A.', costoUnitario: 4500, ultimaActualizacion: '2026-02-20' },
  { id: 2, producto: 'Salmón', categoria: 'PESCADO', descripcion: 'Salmón fresco del Atlántico Sur. Porción de 200g por unidad.', proveedor: 'Pesquera Austral', costoUnitario: 8200, ultimaActualizacion: '2026-02-18' },
  { id: 3, producto: 'Mozzarella', categoria: 'LÁCTEOS', descripcion: 'Queso mozzarella fresco artesanal. Ideal para pizzas y ensaladas.', proveedor: 'Lácteos del Sur', costoUnitario: 3200, ultimaActualizacion: '2026-02-22' },
  { id: 4, producto: 'Pechuga', categoria: 'POLLO', descripcion: 'Pechuga de pollo deshuesada. Sin piel, lista para cocinar.', proveedor: 'Avícola Central', costoUnitario: 2800, ultimaActualizacion: '2026-02-25' },
  { id: 5, producto: 'Tomate', categoria: 'VERDURAS', descripcion: 'Tomate redondo orgánico de huerta local. Calibre medio.', proveedor: 'Huerta Verde', costoUnitario: 800, ultimaActualizacion: '2026-02-26' },
  { id: 6, producto: 'Manzana', categoria: 'FRUTAS', descripcion: 'Manzana roja deliciosa del Valle de Río Negro. Temporada 2026.', proveedor: 'Frutícola Patagonia', costoUnitario: 600, ultimaActualizacion: '2026-02-24' },
];
