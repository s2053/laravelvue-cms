<?php

namespace App\Domains\Media\Enums;

enum MediaVisibility: string
{
    case PUBLIC = 'public';
    case PRIVATE = 'private';
}
