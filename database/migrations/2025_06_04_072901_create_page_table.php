<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {

    public function up(): void
    {
        Schema::create('pages', function (Blueprint $table) {
            $table->id();

            // Basic
            $table->string('title');
            $table->string('slug')->unique();
            $table->string('page_type')->nullable(); // e.g. default, contact, etc.
            $table->boolean('is_commentable')->default(true);

            // Content
            $table->text('excerpt')->nullable();
            $table->longText('body')->nullable();

            // Featured Media
            $table->string('thumbnail')->nullable(); // For cards/listing view
            $table->string('featured_media_type')->nullable(); // image, video, gallery
            $table->string('featured_media_url')->nullable();  // URL or embed link
            $table->string('media_source')->nullable(); // upload, media, external

            // SEO
            $table->string('meta_title')->nullable();
            $table->text('meta_description')->nullable();
            $table->text('meta_keywords')->nullable();

            // Status & Publishing
            $table->string('status')->default('draft'); // draft, pending, private, scheduled, published
            $table->timestamp('scheduled_at')->nullable(); // when it's scheduled to publish
            $table->timestamp('published_at')->nullable(); // when it was actually published

            // Author tracking
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
        Schema::dropIfExists('pages');
    }
};
