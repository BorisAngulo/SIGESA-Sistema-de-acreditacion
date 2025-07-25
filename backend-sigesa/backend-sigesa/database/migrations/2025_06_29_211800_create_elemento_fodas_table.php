<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateElementoFodasTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('elemento_fodas', function (Blueprint $table) {
            $table->id();
            $table->timestamps();
            $table->foreignId('id_categoria_foda')
                ->constrained('categoria_fodas')
                ->onDelete('cascade');
            $table->foreignId('id_subfase')
                ->constrained('sub_fases')
                ->onDelete('cascade');
            $table->string('descripcion_elemento_foda', 300)->nullable();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('elemento_fodas');
    }
}
