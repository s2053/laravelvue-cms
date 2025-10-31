<?php
namespace App\Enums\Widgets;

enum ContentType: string
{
    case POST = 'post';
    case POST_CATEGORY = 'post_category';
    case POST_TAG = 'post_tag';
    case PAGE = 'page';
    case PAGE_CATEGORY = 'page_category';
    case CUSTOM = 'custom';
}