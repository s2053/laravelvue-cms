import { PageStatus, PageType, PageVisibility } from '@/features/pages/enums';

export interface PageCategory {
    id: number;
    title: string;
    slug: string;
    description?: string | null;
    meta_title?: string | null;
    meta_description?: string | null;
    meta_keywords?: string | null;
    status: boolean;
    created_at?: string;
    updated_at?: string;
}

export type PageCategoryPayload = Omit<PageCategory, 'id' | 'created_at' | 'updated_at'>;

export interface Page {
    id: number;
    title: string;
    slug: string;
    page_category_id?: number | null;
    category?: PageCategory | null;
    page_type?: PageType | null;
    is_commentable: boolean;
    excerpt?: string | null;
    body?: string | null;
    thumbnail?: string | null;
    featured_media_type?: string | null;
    featured_media_url?: string | null;
    media_source?: string | null;
    meta_title?: string | null;
    meta_description?: string | null;
    meta_keywords?: string | null;
    status: PageStatus;
    visibility: PageVisibility;
    scheduled_at?: string | null;
    published_at?: string | null;
    created_by?: number | null;
    updated_by?: number | null;
    deleted_by?: number | null;
    created_at?: string;
    updated_at?: string;
    deleted_at?: string | null;
}

export type PagePayload = Omit<Page, 'id' | 'created_at' | 'updated_at' | 'deleted_at' | 'category'> & {
    thumbnailFile?: File | null;
};

export type PageFilters = {
    status: PageStatus[];
    page_type: PageType[];
    page_category_id: number[];
    visibility: PageVisibility[];
    created_at?: string[];
    global: string;
};

export type PageCategoryFilters = {
    status: PageStatus[];
    created_at: string[];
    global: string;
};
