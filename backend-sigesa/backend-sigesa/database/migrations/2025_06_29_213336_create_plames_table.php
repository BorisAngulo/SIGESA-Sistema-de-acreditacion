<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreatePlamesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('plames', function (Blueprint $table) {
            $table->id();
            $table->timestamps();
            $table->foreignId('id_subfase')
                ->constrained('sub_fases')
                ->onDelete('cascade');
            $table->string('tipo_evaluacion_plame', 50)->nullable();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('plames');
    }
}
