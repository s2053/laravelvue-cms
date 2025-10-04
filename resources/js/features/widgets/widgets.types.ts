// src/features/widgets/widgets.types.ts

import { ContentType, WidgetType } from '@/features/widgets/widgets.enum';

export interface Widget {
    id: number;
    title: string;
    description?: string | null;
    widget_type: WidgetType; // menu, collection, custom
    content_type: ContentType; // posts, pages
    nestable: boolean;
    settings: Record<string, any> | null;
    slug: string;
    icon?: string | null;
    is_default: boolean;
    status: boolean;
    created_at?: string;
    items?: WidgetItem[];
}

export interface WidgetItem {
    id: number;
    widget_id: number;
    title: string;
    slug: string;
    url?: string | null;
    order?: number;
    parent_id?: number | null;
    settings?: Record<string, any> | null;
    status: boolean;
    created_at?: string;
    children?: WidgetItem[];
}

export type WidgetPayload = Omit<Widget, 'id' | 'created_at' | 'items'>;
export type WidgetItemPayload = Omit<WidgetItem, 'id' | 'created_at' | 'children'>;

export type WidgetFilters = {
    created_at?: string[];
    global: string;
};
