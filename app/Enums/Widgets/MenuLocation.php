<?php

namespace App\Enums\Widgets;

enum MenuLocation: string
{
    case PRIMARY = 'primary';
    case FOOTER = 'footer';
    case MOBILE = 'mobile';
    case SIDEBAR = 'sidebar';
}
