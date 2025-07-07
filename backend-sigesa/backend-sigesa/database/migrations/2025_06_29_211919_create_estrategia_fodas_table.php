<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateEstrategiaFodasTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('estrategia_fodas', function (Blueprint $table) {
            $table->id();
            $table->timestamps();
            $table->foreignId('id_elemento_foda')
                ->constrained('elemento_fodas')
                ->onDelete('cascade');
            $table->string('codigo_estrategia_foda', 2)->unique();
            $table->string('descripcion_estrategia_foda', 300)->nullable();
            $table->string('nombre_estrategia_foda', 50)->unique();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('estrategia_fodas');
    }
}
