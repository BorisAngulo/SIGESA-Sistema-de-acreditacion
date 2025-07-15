<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateDocumentosTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('documentos', function (Blueprint $table) {
            $table->id();
            $table->timestamps();
            $table->string('nombre_documento', 100)->nullable();
            $table->string('descripcion_documento', 255)->nullable();
            $table->string('nombre_archivo_original', 255)->nullable(); // Nombre original del archivo
            $table->string('tipo_mime', 50)->nullable();
            $table->longText('contenido_archivo')->nullable(); // Contenido del archivo en base64
            $table->bigInteger('tamano_archivo')->nullable(); // Tamaño del archivo en bytes
            $table->string('tipo_documento', 2);// '01' para especificos, '02' para generales
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
        Schema::dropIfExists('documentos');
    }
}
