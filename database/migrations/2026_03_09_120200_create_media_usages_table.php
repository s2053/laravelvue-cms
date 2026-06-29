<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('media_usages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('media_id')->constrained('media')->cascadeOnDelete();
            $table->morphs('usable');
            $table->string('field', 100);
            $table->timestamps();

            $table->index('field');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('media_usages');
    }
};
