export interface PostTag {
    id?: number;
    title: string;
    slug: string;
    description?: string | null;
    status: boolean;
    created_at?: string;
    updated_at?: string;
}

export type PostTagPayload = Omit<PostTag, 'id' | 'created_at' | 'updated_at'>;
