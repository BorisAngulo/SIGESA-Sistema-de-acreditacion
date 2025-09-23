<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class FodaAnalisis extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('foda_analisis', function (Blueprint $table) {
            $table->id();
            $table->timestamps();
            $table->foreignId('id_subfase')
                ->constrained('sub_fases')
                ->onDelete('cascade');
            $table->string('nombre_analisis', 100)->nullable();
            $table->string('descripcion', 300)->nullable();
            $table->boolean('estado')->default(false); // false: borrador, true: completado
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        //
    }
}
