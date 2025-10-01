<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\SiteInfoRequest;
use App\Http\Resources\SiteInfoResource;
use App\Services\SiteInfoService;
use Illuminate\Http\Request;

class SiteInfoController extends Controller
{
        protected SiteInfoService $service;

    public function __construct(SiteInfoService $service)
    {
        $this->service = $service;
    }

    /**
     * Display the site info.
     */
    public function show()
    {
        $record = $this->service->show();

        return new SiteInfoResource($record);
    }

    /**
     * Update the site info.
     */
    public function update(SiteInfoRequest $request)
    {
        $record = $this->service->update($request->validated());

        return new SiteInfoResource($record);
    }
}
