import type { Role } from '@/types/rbac';

export interface User {
    id: number;
    name: string;
    email: string;
    roles: Role[];
}

export interface UserPayload {
    name: string;
    email: string;
    password?: string;
    password_confirmation?: string;
    role_ids: number[];
}
