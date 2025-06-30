<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateFilaPlamesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('fila_plames', function (Blueprint $table) {
            $table->id();
            $table->timestamps();
            $table->string('nombre_fila_plame', 100)->nullable();
            $table->foreignId('id_modalidad')
                ->constrained('modalidades')
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
        Schema::dropIfExists('fila_plames');
    }
}
