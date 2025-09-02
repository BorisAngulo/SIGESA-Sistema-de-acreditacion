<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateCarreraModalidadesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('carrera_modalidades', function (Blueprint $table) {
            $table->id();
            $table->foreignId('carrera_id')
                  ->constrained('carreras')
                  ->onDelete('cascade');
            $table->foreignId('modalidad_id')
                  ->constrained('modalidades')
                  ->onDelete('cascade');
            $table->boolean('estado_modalidad')->default(false);
            $table->dateTime('fecha_ini_proceso')->nullable();
            $table->dateTime('fecha_fin_proceso')->nullable();
            $table->integer('id_usuario_updated_carrera_modalidad')->nullable();

            $table->dateTime('fecha_ini_aprobacion')->nullable();
            $table->dateTime('fecha_fin_aprobacion')->nullable();
            $table->longText('certificado')->nullable(); 
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
        Schema::dropIfExists('carrera_modalidades');
    }
}
