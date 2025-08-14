<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {

    public function up(): void
    {
        Schema::create('post_categories', function (Blueprint $table) {
            $table->id();

            // Basic
            $table->string('title');
            $table->string('slug')->unique();


            // Content
            $table->text('excerpt')->nullable();
            $table->longText('description')->nullable();

            // Featured Media
            $table->string('featured_image')->nullable(); // direct image upload


            // SEO
            $table->string('meta_title')->nullable();
            $table->text('meta_description')->nullable();

            // Status 
            $table->boolean('status')->default(value: 1);


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
        Schema::dropIfExists('post_categories');
    }
};
