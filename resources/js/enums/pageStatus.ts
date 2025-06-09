export enum PageStatus {
    DRAFT = 'draft',
    PUBLISHED = 'published',
    SCHEDULED = 'scheduled',
    ARCHIVED = 'archived',
}

export const PageStatusOptions = [
    { label: 'Draft', value: PageStatus.DRAFT },
    { label: 'Published', value: PageStatus.PUBLISHED },
    { label: 'Scheduled', value: PageStatus.SCHEDULED },
    { label: 'Archived', value: PageStatus.ARCHIVED },
];
