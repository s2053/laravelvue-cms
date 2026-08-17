export interface Role {
    id: number;
    name: string;
    slug: string;
    permissions?: Permission[];
    permissions_count?: number;
    created_at?: string | null;
    updated_at?: string | null;
}
export type RolePayload = {
    name: string;
    slug: string;
    permissions: number[];
};
export type RoleFilters = {
    created_at: string[];
    global: string;
};

export interface Permission {
    id: number;
    name: string;
    permission_group_id?: number | null;
    permission_group?: PermissionGroup | null;
    created_at?: string | null;
    group?: PermissionGroup;
}
export type PermissionPayload = {
    name: string;
    permission_group_id: number | null;
};
export type PermissionFilters = {
    created_at: string[];
    global: string;
};

export interface PermissionGroup {
    id: number;
    name: string;
    permissions_count?: number;
    permissions?: Permission[];
}
export type PermissionGroupPayload = Omit<PermissionGroup, 'id' | 'permissions' | 'permissions_count'>;
export type PermissionGroupFilters = {
    created_at: string[];
    global: string;
};
