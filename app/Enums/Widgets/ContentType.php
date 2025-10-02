<?php
namespace App\Enums\Widgets;

enum ContentType: string
{
    case POST = 'post';
    case PAGE = 'page';
    case CUSTOM = 'custom';
}