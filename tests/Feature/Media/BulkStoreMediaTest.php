<?php

namespace Tests\Feature\Media;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class BulkStoreMediaTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_uploads_multiple_media_files_in_one_request(): void
    {
        Storage::fake('public');

        Sanctum::actingAs(User::factory()->create());

        $response = $this->post('/api/media/bulk-store', [
            'status' => true,
            'visibility' => 'public',
            'files' => [
                UploadedFile::fake()->create('document-one.pdf', 120, 'application/pdf'),
                UploadedFile::fake()->create('document-two.txt', 60, 'text/plain'),
            ],
        ]);

        $response->assertCreated();
        $response->assertJsonCount(2, 'data');

        $this->assertDatabaseCount('media', 2);
        $this->assertCount(2, Storage::disk('public')->allFiles('media'));
    }

    public function test_it_rejects_files_with_disallowed_extensions(): void
    {
        Storage::fake('public');

        Sanctum::actingAs(User::factory()->create());

        $response = $this->post('/api/media/bulk-store', [
            'files' => [
                UploadedFile::fake()->create('malware.exe', 20, 'application/octet-stream'),
            ],
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['files.0']);
    }
}
