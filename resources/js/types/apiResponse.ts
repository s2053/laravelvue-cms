export interface ApiResponse<T> {
    data: T;
}

export interface PaginatedResponse<T> {
    data: T[];
    meta: any;
}
