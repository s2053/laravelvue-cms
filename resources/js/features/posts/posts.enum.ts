// Enum defining post types
export enum PostType {
    DEFAULT = 'default',
    BLOG = 'blog',
    LIST = 'list',
}

// Options for UI selects matching post types
export const PostTypeOptions = [
    { label: 'Default', value: PostType.DEFAULT },
    { label: 'Blog', value: PostType.BLOG },
    { label: 'List', value: PostType.LIST },
];

// Enum for post visibility types
export enum PostVisibility {
    PUBLIC = 'public',
    PRIVATE = 'private',
    AUTHENTICATED = 'authenticated',
}

// UI options for post visibility
export const PostVisibilityOptions = [
    { label: 'Public', value: PostVisibility.PUBLIC },
    { label: 'Private', value: PostVisibility.PRIVATE },
    { label: 'Authenticated Users Only', value: PostVisibility.AUTHENTICATED },
];

// Enum representing possible post status
export enum PostStatus {
    DRAFT = 'draft',
    PUBLISHED = 'published',
    SCHEDULED = 'scheduled',
    ARCHIVED = 'archived',
}

// Options for UI paired with labels
export const PostStatusOptions = [
    { label: 'Draft', value: PostStatus.DRAFT },
    { label: 'Published', value: PostStatus.PUBLISHED },
    { label: 'Scheduled', value: PostStatus.SCHEDULED },
    { label: 'Archived', value: PostStatus.ARCHIVED },
];
