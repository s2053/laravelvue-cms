// Enum defining page types
export enum PageType {
    DEFAULT = 'default',
    CONTACT = 'contact',
    FAQ = 'faq',
}

// Options for UI selects matching page types
export const PageTypeOptions = [
    { label: 'Default', value: PageType.DEFAULT },
    { label: 'Contact', value: PageType.CONTACT },
    { label: 'FAQ', value: PageType.FAQ },
];
