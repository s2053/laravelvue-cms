// Enum defining post types
export enum ContentType {
    DEFAULT = 'default',
    BLOG = 'blog',
    LIST = 'list',
}

// Options for UI selects matching post types
export const ContentTypeOptions = [
    { label: 'Default', value: ContentType.DEFAULT },
    { label: 'Blog', value: ContentType.BLOG },
    { label: 'List', value: ContentType.LIST },
];

export enum WidgetType {
    DEFAULT = 'default',
    BLOG = 'blog',
    LIST = 'list',
}

// Options for UI selects matching widget types
export const WidgetTypeOptions = [
    { label: 'Default', value: WidgetType.DEFAULT },
    { label: 'Blog', value: WidgetType.BLOG },
    { label: 'List', value: WidgetType.LIST },
];
