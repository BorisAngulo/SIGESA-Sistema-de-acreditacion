<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Laravel\Sanctum\PersonalAccessToken;
use Illuminate\Support\Facades\Auth;

class AuthTokenQuery
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Illuminate\Http\Response|\Illuminate\Http\RedirectResponse)  $next
     * @return \Illuminate\Http\Response|\Illuminate\Http\RedirectResponse
     */
    public function handle(Request $request, Closure $next)
    {
        // Intentar autenticación por header Authorization primero
        if ($request->bearerToken()) {
            $token = PersonalAccessToken::findToken($request->bearerToken());
            if ($token && $token->tokenable) {
                // Establecer el usuario autenticado usando Sanctum
                Auth::setUser($token->tokenable);
                $request->setUserResolver(function () use ($token) {
                    return $token->tokenable;
                });
                return $next($request);
            }
        }

        // Si no hay token en header, intentar por query parameter
        $tokenFromQuery = $request->query('token');
        if ($tokenFromQuery) {
            $token = PersonalAccessToken::findToken($tokenFromQuery);
            if ($token && $token->tokenable) {
                // Establecer el usuario autenticado usando Sanctum
                Auth::setUser($token->tokenable);
                $request->setUserResolver(function () use ($token) {
                    return $token->tokenable;
                });
                return $next($request);
            }
        }

        // Si no se pudo autenticar
        return response()->json([
            'exito' => false,
            'estado' => 401,
            'mensaje' => 'Token de autenticación requerido',
            'datos' => null,
            'error' => 'Unauthenticated'
        ], 401);
    }
}
