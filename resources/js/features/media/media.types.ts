import { MediaSourceType, MediaType, MediaVisibility } from '@/features/media/media.enum';

export interface MediaVariant {
    id: number;
    variant: string;
    disk?: string | null;
    path?: string | null;
    url?: string | null;
    filename?: string | null;
    mime_type?: string | null;
    extension?: string | null;
    size?: number | null;
    width?: number | null;
    height?: number | null;
}

export interface MediaUserSummary {
    id: number;
    name: string;
    email: string;
}

export interface MediaRecord {
    id: number;
    uuid: string;
    source_type: MediaSourceType;
    type: MediaType;
    disk?: string | null;
    directory?: string | null;
    path?: string | null;
    url?: string | null;
    filename: string;
    original_name?: string | null;
    extension?: string | null;
    mime_type?: string | null;
    size?: number | null;
    width?: number | null;
    height?: number | null;
    duration?: number | null;
    title?: string | null;
    alt_text?: string | null;
    caption?: string | null;
    description?: string | null;
    visibility: MediaVisibility;
    status: boolean;
    created_by?: number | null;
    updated_by?: number | null;
    deleted_by?: number | null;
    creator?: MediaUserSummary | null;
    updater?: MediaUserSummary | null;
    variants?: MediaVariant[];
    usages_count?: number | null;
    created_at?: string;
    updated_at?: string;
    deleted_at?: string | null;
}

export type MediaPayload = {
    file?: File | null;
    disk?: string | null;
    title?: string | null;
    alt_text?: string | null;
    caption?: string | null;
    description?: string | null;
    visibility?: MediaVisibility | null;
    status?: boolean;
};

export type MediaBulkUploadPayload = {
    files: File[];
};

export type MediaFilters = {
    status: boolean[];
    type: MediaType[];
    visibility: MediaVisibility[];
    created_at: string[];
    global: string;
};
