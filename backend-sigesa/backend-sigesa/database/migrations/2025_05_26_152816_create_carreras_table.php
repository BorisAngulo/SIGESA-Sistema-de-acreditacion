<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateCarrerasTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('carreras', function (Blueprint $table) {
            $table->id();
            $table->foreignId('facultad_id')
                  ->constrained('facultades')
                  ->onDelete('cascade');
            $table->string('codigo_carrera', )->unique();
            $table->string('nombre_carrera', 200);
            $table->string('pagina_carrera', 100)-> nullable();
            $table->integer('id_usuario_updated_carrera')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('carreras');
    }
}
