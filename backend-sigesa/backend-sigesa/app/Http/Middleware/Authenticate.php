<?php

namespace App\Http\Middleware;

use Illuminate\Auth\Middleware\Authenticate as Middleware;

class Authenticate extends Middleware
{
    /**
     * Get the path the user should be redirected to when they are not authenticated.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return string|null
     */
    protected function redirectTo($request)
    {
        if (! $request->expectsJson()) {
            // Para APIs, no redirigir, devolver null para que maneje el error como JSON
            if ($request->is('api/*')) {
                return null;
            }
            // Si no es API y tienes una ruta de login, descomenta la siguiente línea:
            // return route('login');
            return null;
        }
    }
}
