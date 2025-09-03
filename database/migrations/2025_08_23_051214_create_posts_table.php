<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {

    public function up(): void
    {
        Schema::create('posts', function (Blueprint $table) {
            $table->id();

            // Basic
            $table->string('title');
            $table->string('slug')->unique();
            $table->string('post_type')->default('blog'); // blog, article, list, review...
            $table->boolean('is_commentable')->default(true);

            // Content
            $table->text('excerpt')->nullable();
            $table->longText('content')->nullable();

            // Featured Media

            $table->string('thumbnail')->nullable(); // For cards/listing

            $table->string('featured_media_type')->nullable(); // image, video, gallery, embed
            $table->string('featured_media')->nullable();  // file path or embed URL
            $table->string('media_source')->nullable(); // upload, media_library, external

            // SEO
            $table->string('meta_title')->nullable();
            $table->text('meta_description')->nullable();
            $table->text('meta_keywords')->nullable();

            // Status & Publishing
            $table->string('status')->default('draft'); // draft, pending, scheduled, published
            $table->string(column: 'visibility')->default('public'); // public, private, authenticated,etc
            $table->timestamp('scheduled_at')->nullable();
            $table->timestamp('published_at')->nullable();

            // Author tracking
            $table->foreignId('author_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('deleted_by')->nullable()->constrained('users')->nullOnDelete();


            // Soft deletes and timestamps
            $table->softDeletes();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('posts');
    }
};
