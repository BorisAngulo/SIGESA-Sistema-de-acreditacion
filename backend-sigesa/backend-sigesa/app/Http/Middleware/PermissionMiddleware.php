<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PermissionMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Illuminate\Http\Response|\Illuminate\Http\RedirectResponse)  $next
     * @param  string  $permission
     * @return \Illuminate\Http\Response|\Illuminate\Http\RedirectResponse
     */
    public function handle(Request $request, Closure $next, $permission)
    {
        if (!Auth::check()) {
            return response()->json([
                'exito' => false,
                'estado' => 401,
                'mensaje' => 'No autenticado',
                'datos' => null,
                'error' => 'Debe iniciar sesión para acceder a este recurso'
            ], 401);
        }

        if (!Auth::user()->can($permission)) {
            return response()->json([
                'exito' => false,
                'estado' => 403,
                'mensaje' => 'Sin permisos suficientes',
                'datos' => null,
                'error' => 'No tiene permisos para realizar esta acción'
            ], 403);
        }

        return $next($request);
    }
}
