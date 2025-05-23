export interface User {
    id: number;
    name: string;
    email: string;
    role_id: number | null;
}

export interface UserPayload {
    name: string;
    email: string;
    password?: string;
    password_confirmation?: string;
    role_id: number | null;
}
