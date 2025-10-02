<?php
namespace App\Enums\Widgets;

enum WidgetType: string
{
    case MENU = 'menu';
    case COLLECTION = 'collection';
    case CUSTOM_BLOCK = 'custom_block';
}