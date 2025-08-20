<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateFasesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('fases', function (Blueprint $table) {
            $table->id();
            $table->foreignId('carrera_modalidad_id')
                    ->constrained('carrera_modalidades')
                    ->onDelete('cascade');
            $table->string('nombre_fase', 50);
            $table->string('descripcion_fase', 300)->nullable();
            $table->date('fecha_inicio_fase')->nullable();
            $table->date('fecha_fin_fase')->nullable();
            $table->string('url_fase')->nullable();
            $table->string('url_fase_respuesta')->nullable();
            $table->string('observacion_fase')->nullable();
            $table->boolean('estado_fase')->default(false);
            $table->integer('id_usuario_updated_fase')->nullable();
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
        Schema::dropIfExists('fases');
    }
}
