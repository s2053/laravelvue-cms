<?php

namespace App\Domains\Media\Contracts;

use Illuminate\Http\UploadedFile;

interface ImageProcessorContract
{
    /**
     * @return array{width:int|null,height:int|null,mime_type:string|null,size:int|null,extension:string|null}
     */
    public function inspect(UploadedFile $file): array;

    /**
     * @return array<string, array{contents:string,width:int,height:int,mime_type:string,extension:string,size:int}>
     */
    public function generateVariants(UploadedFile $file, array $variants): array;
}
