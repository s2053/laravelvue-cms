import { PostStatus, PostType, PostVisibility } from '@/features/posts/posts.enum';

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

export interface PostTagOption {
    id: number;
    title: string;
}
export interface PostCategory {
    id: number;
    title: string;
    slug: string;
    parent?: PostCategory | null;
    parent_id?: number | null;
    sort_order?: number | null;
    featured_image?: string | null;
    description?: string | null;
    meta_title?: string | null;
    meta_description?: string | null;
    status: boolean;
    created_at?: string;
    updated_at?: string;
}

export type PostCategoryPayload = Omit<PostCategory, 'id' | 'created_at' | 'updated_at'> & {
    featured_image_file?: File | null;
};

export type PostCategoryFilters = {
    status: boolean[];
    created_at: string[];
    global: string;
};

export interface PostCategoryOption {
    id: number;
    title: string;
    parent_id?: number | null;
}

export interface Post {
    id: number;
    title: string;
    slug: string;
    category_id?: number | null;
    post_type?: PostType | null;
    is_commentable: boolean;
    excerpt?: string | null;
    content?: string | null;
    thumbnail?: string | null;
    featured_media_type?: string | null;
    featured_media_url?: string | null;
    media_source?: string | null;
    meta_title?: string | null;
    meta_description?: string | null;
    status: PostStatus;
    visibility: PostVisibility;
    categories?: PostCategory[];
    tags?: PostTag[];
    scheduled_at?: string | null;
    published_at?: string | null;
    created_at?: string;
    author_id?: number | null;
    author?: { id: number; name: string; email: string } | null;
}

export type PostPayload = Omit<Post, 'id' | 'created_at' | 'updated_at' | 'deleted_at' | 'categories' | 'tags'> & {
    thumbnailFile?: File | null;
    category_ids?: number[];
    tag_ids?: number[];
};

export type PostFilters = {
    status: PostStatus[];
    post_type: PostType[];
    category_ids: number[];
    author_ids: number[];
    tag_ids: number[];
    visibility: PostVisibility[];
    created_at?: string[];
    global: string;
};
