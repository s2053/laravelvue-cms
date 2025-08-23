<?php
namespace App\Enums\Posts;

enum PostType: string
{
    case DEFAULT = 'default';
    case LIST = 'list';
    case BLOG = 'blog';
}
