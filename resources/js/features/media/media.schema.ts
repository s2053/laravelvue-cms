import { MediaVisibility } from '@/features/media/media.enum';
import { z } from 'zod';

const nullableText = (maxLength?: number) =>
    z.preprocess(
        (value) => (value === '' ? null : value),
        maxLength
            ? z.union([z.string().trim().max(maxLength), z.null()]).optional()
            : z.union([z.string().trim(), z.null()]).optional(),
    );

export const mediaDetailsSchema = z.object({
    title: nullableText(255),
    alt_text: nullableText(255),
    caption: nullableText(500),
    description: nullableText(),
    visibility: z.nativeEnum(MediaVisibility).nullable().optional(),
    status: z.boolean().optional(),
});

export type MediaDetailsSchema = z.infer<typeof mediaDetailsSchema>;
