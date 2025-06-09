<?php
namespace App\Enums;

enum PageVisibility: string {
    case PUBLIC = 'public';
    case AUTHENTICATED = 'authenticated';
    case PRIVATE = 'private';
}
