<?php

namespace App\Domains\Media\Http\Controllers;

use App\Domains\Media\Http\Requests\BulkUpdateMediaRequest;
use App\Domains\Media\Http\Requests\StoreMediaRequest;
use App\Domains\Media\Http\Requests\UpdateMediaRequest;
use App\Domains\Media\Http\Resources\MediaResource;
use App\Domains\Media\Models\Media;
use App\Domains\Media\Services\MediaService;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class MediaController extends Controller
{
    public function __construct(protected MediaService $service)
    {
    }

    public function index(Request $request)
    {
        $params = $request->all();
        $perPage = (int) $request->input('rows', 25);
        $all = $request->boolean('all', false);

        $records = $this->service->list($params, $perPage, $all);

        return MediaResource::collection($records);
    }

    public function store(StoreMediaRequest $request)
    {
        $media = $this->service->create($request->validated());

        return (new MediaResource($media))
            ->response()
            ->setStatusCode(201);
    }

    public function show(Media $media)
    {
        $media = $this->service->show($media);

        return new MediaResource($media);
    }

    public function update(UpdateMediaRequest $request, Media $media)
    {
        $media = $this->service->update($media, $request->validated());

        return new MediaResource($media);
    }

    public function destroy(Media $media)
    {
        $this->service->delete($media);

        return response()->json(null, 204);
    }

    public function bulkUpdate(BulkUpdateMediaRequest $request)
    {
        $result = $this->service->bulkUpdate($request->validated());

        return response()->json($result);
    }
}
