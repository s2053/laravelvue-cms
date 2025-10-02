<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('widgets', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('widget_type', 50); // menu,collection,custom
            $table->string('content_type', 50)->nullable(); //  posts, pages
            $table->boolean('nestable')->default(0);       // allow nested items
            $table->json('settings')->nullable(); // widget config
            $table->string('slug')->unique();
            $table->string('icon')->nullable();
            $table->boolean('is_default')->default(0); // prevent deletion
            $table->boolean('status')->default(1);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('widgets');
    }
};
