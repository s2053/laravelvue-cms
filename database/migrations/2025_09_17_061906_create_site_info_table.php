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
        Schema::create('site_info', function (Blueprint $table) {
            $table->id();

            // Branding
            $table->string('site_title')->nullable();
            $table->string('tagline')->nullable();
            $table->string('logo')->nullable();
            $table->string('favicon')->nullable();
            $table->string('footer_logo')->nullable();
            $table->string('placeholder_image')->nullable();

            // Contact
            $table->string('contact_email')->nullable();
            $table->string('contact_phone', 30)->nullable();
            $table->string('contact_mobile', 30)->nullable();
            $table->text('address')->nullable();
            $table->text('google_map_iframe')->nullable();
            $table->json('social_links')->nullable();

            // SEO
            $table->string('meta_title')->nullable();
            $table->text('meta_description')->nullable();

            // Cookies & Legal
            $table->boolean('cookies_enabled')->default(0);
            $table->text('cookies_text')->nullable();
            $table->string('copyright_text')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('site_info');
    }
};
