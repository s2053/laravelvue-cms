export function slugify(text: string, maxLength = 100): string {
    const slug = text
        .toString()
        .normalize('NFKD') // Normalize accented chars
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-') // Replace spaces with -
        .replace(/[^\w\-]+/g, '') // Remove all non-word chars except dashes
        .replace(/\-\-+/g, '-') // Replace multiple dashes with single dash
        .replace(/^-+/, '') // Trim starting dashes
        .replace(/-+$/, ''); // Trim ending dashes

    return slug.length > maxLength ? slug.slice(0, maxLength) : slug;
}
