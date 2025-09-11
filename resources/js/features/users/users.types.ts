import type { Role } from '@/features/rbac/rbac.types';

export interface User {
    id: number;
    name: string;
    email_verified_at?: string | null;
    email: string;
    roles: Role[];
    created_at?: string;
    status?: boolean;
    profile_img?: string | null;
}

export type UserPayload = Omit<User, 'id' | 'created_at' | 'roles'> & { password?: string; password_confirmation?: string; role_ids: number[] };

export type UserFilters = {
    status: boolean[];
    email_verified_status: boolean[];
    role_ids: number[];
    created_at?: string[];
    global: string;
};
