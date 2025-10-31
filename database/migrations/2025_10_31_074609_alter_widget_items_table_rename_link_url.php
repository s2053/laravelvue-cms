<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('widget_items', function (Blueprint $table) {
            $table->renameColumn('link', 'url');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('widget_items', function (Blueprint $table) {
            Schema::table('widget_items', function (Blueprint $table) {
                $table->renameColumn('url', 'link');
            });
        });
    }
};
