export enum PageVisibility {
    PUBLIC = 'public',
    PRIVATE = 'private',
    AUTHENTICATED = 'authenticated',
}

export const PageVisibilityOptions = [
    { label: 'Public', value: PageVisibility.PUBLIC },
    { label: 'Private', value: PageVisibility.PRIVATE },
    { label: 'Authenticated Users Only', value: PageVisibility.AUTHENTICATED },
];
