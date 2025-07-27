export interface LoginPayload {
    email: string;
    password: string;
    remember: boolean;
}

export interface RegisterPayload {
    username: string;
    email: string;
    password: string;
    password_confirmation: string;
}
