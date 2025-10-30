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
            $table->foreignId('id_carreraModalidad')
                ->constrained('carrera_modalidades')
                ->onDelete('cascade');
            $table->string('nombre_documento', 100)->nullable();
            $table->string('nombre_archivo_original', 255)->nullable(); // Nombre original del archivo
            $table->string('tipo_mime', 200)->nullable();
            $table->longText('contenido_archivo')->nullable(); // Contenido del archivo en base64
            $table->bigInteger('tamano_archivo')->nullable(); // Tamaño del archivo en bytes
            $table->integer('id_usuario_updated_documento')->nullable();
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
