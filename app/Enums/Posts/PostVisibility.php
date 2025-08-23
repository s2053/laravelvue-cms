<?php
namespace App\Enums\Posts;

enum PostVisibility: string {
    case PUBLIC = 'public';
    case AUTHENTICATED = 'authenticated';
    case PRIVATE = 'private';
}
