<?php

return [
    'default_disk' => 'public',

    'allowed_disks' => ['public', 's3'],

    'allowed_extensions' => [
        'jpg',
        'jpeg',
        'png',
        'gif',
        'webp',
        'avif',
        'mp4',
        'webm',
        'mov',
        'mp3',
        'wav',
        'ogg',
        'm4a',
        'pdf',
        'doc',
        'docx',
        'xls',
        'xlsx',
        'ppt',
        'pptx',
        'txt',
        'rtf',
    ],

    'variants' => [
        'image' => [
            'thumb' => [150, 150],
            'small' => [300, 300],
            'medium' => [768, 768],
            'large' => [1440, 1440],
        ],
    ],
];
