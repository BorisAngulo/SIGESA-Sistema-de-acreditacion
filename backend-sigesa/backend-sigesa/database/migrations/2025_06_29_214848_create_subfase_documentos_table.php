<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateSubfaseDocumentosTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('subfase_documentos', function (Blueprint $table) {
            $table->id();
            $table->timestamps();
            $table->foreignId('id_subfase')
                ->constrained('sub_fases')
                ->onDelete('cascade');
            $table->foreignId('id_documento')
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
        Schema::dropIfExists('subfase_documentos');
    }
}
