export interface PostTag {
    id: number;
    title: string;
    slug: string;
    description?: string | null;
    created_at?: string;
    updated_at?: string;
}

export type PostTagPayload = Omit<PostTag, 'id' | 'created_at' | 'updated_at'>;

export type PostTagFilters = {
    created_at: string[];
    global: string;
};
export interface PostCategory {
    id: number;
    title: string;
    slug: string;
    description?: string | null;
    meta_title?: string | null;
    meta_description?: string | null;
    status: boolean;
    created_at?: string;
    updated_at?: string;
}

export type PostCategoryPayload = Omit<PostCategory, 'id' | 'created_at' | 'updated_at'>;

export type PostCategoryFilters = {
    created_at: string[];
    global: string;
};
