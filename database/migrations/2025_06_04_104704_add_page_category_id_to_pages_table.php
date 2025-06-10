<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('pages', function (Blueprint $table) {
            $table->unsignedBigInteger('page_category_id')->nullable()->after('id'); // or wherever it fits
            $table->foreign('page_category_id')->references('id')->on('page_categories')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('pages', function (Blueprint $table) {
            $table->dropForeign(['page_category_id']);
            $table->dropColumn('page_category_id');
        });
    }
};
