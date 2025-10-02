<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;


return new class extends Migration {
    public function up(): void
    {
        Schema::create('widget_items', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('widget_id');
            $table->string('title')->nullable(); // Item title
            $table->string('link')->nullable();  // URL for menu item / custom block
            $table->string('content_type', 50)->nullable();  // e.g., post, page, custom
            $table->unsignedBigInteger('content_type_id')->default(0); // ID of linked content, 0 for custom
            $table->string('target', 10)->default('_self');  // Link target (_self, _blank)
            $table->boolean('status')->default(1); // Active/inactive
            $table->unsignedBigInteger('parent_id')->default(0); // For nested items
            $table->string('icon')->nullable();
            $table->string('color', 50)->nullable();
            $table->string('cssclass')->nullable();
            $table->unsignedInteger('ordernum')->default(0);

            $table->timestamps();

            // Foreign key constraint
            $table->foreign('widget_id')
                ->references('id')
                ->on('widgets')
                ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('widget_items');
    }
};
