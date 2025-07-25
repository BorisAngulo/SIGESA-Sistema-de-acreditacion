<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateSubFasesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('sub_fases', function (Blueprint $table) {
            $table->id();
            $table->foreignId('fase_id')
                    ->constrained('fases')
                    ->onDelete('cascade');
            $table->string('nombre_subfase', 50);
            $table->string('descripcion_subfase', 300)->nullable();
            $table->date('fecha_inicio_subfase')->nullable();
            $table->date('fecha_fin_subfase')->nullable();
            $table->integer('id_usuario_updated_subfase')->nullable();
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
        Schema::dropIfExists('sub_fases');
    }
}
