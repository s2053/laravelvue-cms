<?php

return [
    'allowed_disks' => ['public', 's3'],

    'variants' => [
        'image' => [
            'thumb' => [150, 150],
            'small' => [300, 300],
            'medium' => [768, 768],
            'large' => [1440, 1440],
        ],
    ],
];
