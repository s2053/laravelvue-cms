export interface Role {
    id: number;
    name: string;
    permissions?: Permission[];
}

export interface Permission {
    id: number;
    name: string;
    permission_group_id?: number | null;
    group?: PermissionGroup;
}

export interface PermissionGroup {
    id: number;
    name: string;
    permissions?: Permission[];
}
