<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateActivityLogsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('activity_logs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->nullable(); // Usuario que realizó la acción
            $table->string('action'); // Tipo de acción: create, update, delete, login, logout
            $table->string('model_type')->nullable(); // Tipo de modelo afectado (User, Facultad, etc.)
            $table->unsignedBigInteger('model_id')->nullable(); // ID del registro afectado
            $table->string('description'); // Descripción legible de la acción
            $table->json('old_values')->nullable(); // Valores anteriores (para updates)
            $table->json('new_values')->nullable(); // Valores nuevos (para creates y updates)
            $table->json('properties')->nullable(); // Información adicional
            $table->string('ip_address', 45)->nullable(); // IP del usuario
            $table->string('user_agent')->nullable(); // User agent del navegador
            $table->timestamps();
            
            // Índices para mejorar el rendimiento
            $table->index(['user_id', 'created_at']);
            $table->index(['model_type', 'model_id']);
            $table->index(['action', 'created_at']);
            
            // Relación con usuarios
            $table->foreign('user_id')->references('id')->on('users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('activity_logs');
    }
}
