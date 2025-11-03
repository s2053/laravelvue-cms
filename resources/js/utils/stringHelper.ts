export function strTruncate(text: string, maxLength = 30): string {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
}

export function sanitizeCustomUrl(url: string): string {
    url = url.trim();

    if (/^https?:\/\//i.test(url)) return url; // external URL
    if (url.startsWith('#')) return url; // hash-only

    return (
        '/' +
        url
            .toLowerCase()
            .replace(/[^\w\-\/]/g, '') // letters, numbers, dash, slash
            .replace(/\s+/g, '-') // spaces -> dash
            .replace(/\/+/g, '/')
    ); // collapse multiple slashes
}
