export interface PageCategory {
    id?: number;
    name: string;
    slug: string;
    description?: string | null;
    meta_title?: string | null;
    meta_description?: string | null;
    meta_keywords?: string | null;
    status: boolean;
    created_at?: string;
    updated_at?: string;
}

// Use this for create/update payloads
export type PageCategoryPayload = Omit<PageCategory, 'id' | 'created_at' | 'updated_at'>;
