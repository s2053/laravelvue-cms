<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PermissionResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'permission_group_id' => $this->permission_group_id,
            'permission_group' => $this->whenLoaded('group', function () {
                return [
                    'id' => $this->group?->id,
                    'name' => $this->group?->name,
                ];
            }),
'created_at' => $this->created_at->format('Y-m-d H:i:s'),
        ];
    }
}
