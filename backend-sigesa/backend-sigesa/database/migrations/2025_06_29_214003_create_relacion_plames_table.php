<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateRelacionPlamesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('relacion_plames', function (Blueprint $table) {
            $table->id();
            $table->timestamps();
            $table->foreignId('id_plame')
                ->constrained('plames')
                ->onDelete('cascade')->nullable();
            $table->foreignId('id_fila_plame')
                ->constrained('fila_plames')
                ->onDelete('cascade')->nullable();
            $table->foreignId('id_columna_plame')
                ->constrained('columna_plames')
                ->onDelete('cascade')->nullable();
            $table->integer('valor_relacion_plame')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('relacion_plames');
    }
}
