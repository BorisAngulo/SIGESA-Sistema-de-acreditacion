<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateRelacionCruzadaFodasTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('relacion_cruzada_fodas', function (Blueprint $table) {
            $table->id();
            $table->timestamps();
            $table->foreignId('id_elemento_foda_a')
                ->constrained('elemento_fodas')
                ->onDelete('cascade');
            $table->foreignId('id_elemento_foda_b')
                ->constrained('elemento_fodas')
                ->onDelete('cascade');
            $table->foreignId('id_estrategia_foda')
                ->constrained('estrategia_fodas')
                ->onDelete('cascade');
            $table->string('analisis_relacion_cruzada_foda', 300)->nullable();
            $table->string('accion_recomendada_relacion_cruzada_foda', 300)->nullable();
            $table->integer('prioridad_relacion_cruzada_foda')->default(0);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('relacion_cruzada_fodas');
    }
}
