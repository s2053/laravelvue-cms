export enum MediaType {
    IMAGE = 'image',
    VIDEO = 'video',
    AUDIO = 'audio',
    DOCUMENT = 'document',
    FILE = 'file',
}

export enum MediaVisibility {
    PUBLIC = 'public',
    PRIVATE = 'private',
}

export enum MediaSourceType {
    UPLOAD = 'upload',
}

export const MediaTypeOptions = [
    { label: 'Image', value: MediaType.IMAGE },
    { label: 'Video', value: MediaType.VIDEO },
    { label: 'Audio', value: MediaType.AUDIO },
    { label: 'Document', value: MediaType.DOCUMENT },
    { label: 'File', value: MediaType.FILE },
];

export const MediaVisibilityOptions = [
    { label: 'Public', value: MediaVisibility.PUBLIC },
    { label: 'Private', value: MediaVisibility.PRIVATE },
];

export const MediaStatusOptions = [
    { label: 'Active', value: true },
    { label: 'Inactive', value: false },
];
