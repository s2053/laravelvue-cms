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
        Schema::table('users', function (Blueprint $table) {
            // User status: active/inactive
            $table->boolean('status')->default(true)->after('password');

            // Profile image / avatar
            $table->string('profile_img')->nullable()->after('status');

            // Last login timestamp
            $table->timestamp('last_login_at')->nullable()->after('profile_img');

            // Audit fields
            $table->foreignId('created_by')->nullable()->constrained('users')->after('last_login_at');
            $table->foreignId('updated_by')->nullable()->constrained('users')->after('created_by');
            $table->foreignId('deleted_by')->nullable()->constrained('users')->after('updated_by');

            // Soft deletes
            $table->softDeletes()->after('deleted_by');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['created_by']);
            $table->dropForeign(['updated_by']);
            $table->dropForeign(['deleted_by']);

            $table->dropColumn([
                'status',
                'profile_img',
                'last_login_at',
                'created_by',
                'updated_by',
                'deleted_by',
                'deleted_at',
            ]);
        });
    }
};
