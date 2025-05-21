export interface Role {
    id: number;
    name: string;
    permissions?: Permission[];
}

export interface Permission {
    id: number;
    name: string;
}

export interface PermissionGroup {
    id: number;
    name: string;
    permissions?: Permission[];
}
