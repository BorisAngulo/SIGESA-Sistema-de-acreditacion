<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateFaseDocumentosTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('fase_documentos', function (Blueprint $table) {
            $table->id();
            $table->timestamps();
            $table->foreignId('fase_id')
                ->constrained('fases')
                ->onDelete('cascade');
            $table->foreignId('documento_id')
                ->constrained('documentos')
                ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('fase_documentos');
    }
}
