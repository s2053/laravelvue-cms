// Enum defining all content types available in menu builder or widgets
export enum ContentType {
    POST = 'post',
    POST_CATEGORY = 'post_category',
    POST_TAG = 'post_tag',
    PAGE = 'page',
    PAGE_CATEGORY = 'page_category',
    CUSTOM = 'custom',
}

// Options for UI selects (for dropdowns or selectors)
export const ContentTypeOptions = [
    { label: 'Post', value: ContentType.POST },
    { label: 'Post Category', value: ContentType.POST_CATEGORY },
    { label: 'Post Tag', value: ContentType.POST_TAG },
    { label: 'Page', value: ContentType.PAGE },
    { label: 'Page Category', value: ContentType.PAGE_CATEGORY },
    { label: 'Custom Link', value: ContentType.CUSTOM },
];

export enum WidgetType {
    MENU = 'menu',
    COLLECTION = 'collection',
    CUSTOM_BLOCK = 'custom_block',
}

// Options for UI selects matching widget types
export const WidgetTypeOptions = [
    { label: 'Menu', value: WidgetType.MENU },
    { label: 'Collection', value: WidgetType.COLLECTION },
    { label: 'Custom Block', value: WidgetType.CUSTOM_BLOCK },
];
