<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateCategoriaFodasTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('categoria_fodas', function (Blueprint $table) {
            $table->id();
            $table->timestamps();
            $table->string('nombre_categoria_foda', 50)->unique();
            $table->string('codigo_categoria_foda', 1)->unique();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('categoria_fodas');
    }
}
