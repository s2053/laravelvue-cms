<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('media', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->string('source_type', 20)->default('upload');
            $table->string('type', 20);
            $table->string('disk', 50)->nullable();
            $table->string('directory')->nullable();
            $table->string('path')->nullable();
            $table->string('filename');
            $table->string('original_name')->nullable();
            $table->string('extension', 20)->nullable();
            $table->string('mime_type')->nullable();
            $table->unsignedBigInteger('size')->nullable();
            $table->unsignedInteger('width')->nullable();
            $table->unsignedInteger('height')->nullable();
            $table->unsignedInteger('duration')->nullable();
            $table->string('title')->nullable();
            $table->string('alt_text')->nullable();
            $table->string('caption', 500)->nullable();
            $table->text('description')->nullable();
            $table->string('visibility', 20)->default('public');
            $table->boolean('status')->default(true);
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('deleted_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->index('type');
            $table->index('visibility');
            $table->index('status');
            $table->index('disk');
            $table->index('extension');
            $table->index('mime_type');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('media');
    }
};
