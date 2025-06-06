import type { Role } from '@/types/rbac';

export interface User {
    id: number;
    name: string;
    email: string;
    roles: Role[];
}

export interface UserPayload {
    id: number | null;
    name: string;
    email: string;
    password?: string;
    password_confirmation?: string;
    role_ids: number[];
}
