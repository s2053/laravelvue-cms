export interface Role {
    id: number;
    name: string;
    permissions?: Permission[];
    permissions_count?: number;
}
export type RolePayload = Omit<Role, 'id' | 'permissions' | 'permissions_count'> & { permissions: number[] };
export type RoleFilters = {
    created_at: string[];
    global: string;
};

export interface Permission {
    id: number;
    name: string;
    permission_group_id?: number | null;
    group?: PermissionGroup;
}
export type PermissionPayload = Omit<Permission, 'id' | 'group'>;
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
