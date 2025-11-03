// src/features/widgets/widgets.types.ts

import { ContentType, WidgetType } from '@/features/widgets/widgets.enum';

export interface Widget {
    id: number;
    title: string;
    description?: string | null;
    widget_type: WidgetType | null; // menu, collection, custom
    content_type: ContentType | null; // posts, pages
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
    widget_id?: number;
    title: string;
    slug: string;
    url?: string | null;
    target?: string | null;
    icon?: string | null;
    content_type?: ContentType | null;
    content_type_id?: number | null;
    order?: number;
    parent_id?: number;
    status: boolean;
    created_at?: string;
    children?: WidgetItem[];
}

export type WidgetPayload = Omit<Widget, 'id' | 'created_at'> & { items?: WidgetItemPayload[] };
export type WidgetItemPayload = Omit<WidgetItem, 'created_at'> & { oid?: number };

export type WidgetFilters = {
    status: boolean[];
    widget_type?: WidgetType[];
    content_type?: ContentType[];
    created_at?: string[];
    global: string;
};
