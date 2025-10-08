// Enum defining post types
export enum ContentType {
    POST = 'post',
    PAGE = 'page',
    CUSTOM = 'custom',
}

// Options for UI selects matching post types
export const ContentTypeOptions = [
    { label: 'POST', value: ContentType.POST },
    { label: 'PAGE', value: ContentType.PAGE },
    { label: 'CUSTOM', value: ContentType.CUSTOM },
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
