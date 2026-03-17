export interface Category {
    id: string | number;
    name: string;
}

export interface Product {
    id: number | string;
    producto: string;
    categoria: string;
    unidad: string;
    stockMinimo: number;
    cantidadActual: number;
    fechaConteo?: string;
    vencimiento?: string;
    responsable?: string;
}

export interface StockMovement {
    id: number | string;
    fecha: string;
    item: string;
    categoria: string;
    tipo: 'Entrada' | 'Salida' | 'Ajuste';
    cantidad: number;
    stockResultante: number;
    responsable: string;
}

export interface User {
    id?: number | string;
    nombre: string;
    name?: string; // from mock user
    email: string;
    password?: string;
    rol: 'Admin' | 'Staff';
    role?: 'Admin' | 'Staff'; // from mock user
    estado?: 'Activo' | 'Inactivo';
    fechaAlta?: string;
    avatar?: string;
}

export interface Requisition {
    id: string;
    item: string;
    categoria: string;
    cantidadSolicitada: number;
    unidad: string;
    estado: 'Pendiente' | 'Aprobado' | 'Rechazado';
    fecha: string;
    solicitadoPor: string;
}
