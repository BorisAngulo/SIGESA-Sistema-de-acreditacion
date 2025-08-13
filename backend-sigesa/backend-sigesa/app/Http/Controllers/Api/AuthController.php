<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\ActivityLog;
use App\Exceptions\ApiException;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

/**
* @OA\Tag(
*     name="Autenticación",
*     description="Operaciones de autenticación y autorización del sistema SIGESA",
*     externalDocs={
*         "description": "Documentación de la API",
*         "url": "https://github.com/borisangulo/Sistema-de-Acreditacion-UMSS-SIGESA/blob/main/backend-sigesa/backend-sigesa/README.md"
*     }
* )
 */
class AuthController extends BaseApiController
{
    /**
     * Iniciar sesión
     * @OA\Post (
     *     path="/api/auth/login",
     *     tags={"Autenticación"},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="email", type="string", example="admin@sigesa.com"),
     *             @OA\Property(property="password", type="string", example="password123"),
     *             @OA\Property(property="device_name", type="string", example="Mi dispositivo", description="Nombre del dispositivo (opcional)")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Inicio de sesión exitoso",
     *         @OA\JsonContent(
     *             @OA\Property(property="exito", type="boolean", example=true),
     *             @OA\Property(property="estado", type="integer", example=200),
     *             @OA\Property(
     *                 property="datos",
     *                 type="object",
     *                 @OA\Property(property="access_token", type="string"),
     *                 @OA\Property(property="token_type", type="string", example="Bearer"),
     *                 @OA\Property(
     *                     property="user",
     *                     type="object",
     *                     @OA\Property(property="id", type="integer", example=1),
     *                     @OA\Property(property="name", type="string", example="Juan"),
     *                     @OA\Property(property="lastName", type="string", example="Pérez"),
     *                     @OA\Property(property="email", type="string", example="admin@sigesa.com")
     *                 )
     *             ),
     *             @OA\Property(property="error", type="string", nullable=true, example=null)
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Credenciales incorrectas",
     *         @OA\JsonContent(
     *             @OA\Property(property="exito", type="boolean", example=false),
     *             @OA\Property(property="estado", type="integer", example=401),
     *             @OA\Property(property="datos", type="object", nullable=true),
     *             @OA\Property(property="error", type="string", example="Credenciales incorrectas")
     *         )
     *     )
     * )
     */
    public function login(Request $request)
    {
        try {
            // Validación de datos
            $validated = $request->validate([
                'email' => 'required|email',
                'password' => 'required|string',
                'device_name' => 'nullable|string|max:255'
            ]);

            // Verificar credenciales
            $user = User::with('roles:name')->where('email', $validated['email'])->first();

            if (!$user || !Hash::check($validated['password'], $user->password)) {
                throw new ApiException('Credenciales incorrectas', 401);
            }

            // Generar token de acceso con Sanctum
            $deviceName = $validated['device_name'] ?? 'SIGESA Device';
            $token = $user->createToken($deviceName)->plainTextToken;

            // Autenticar el usuario temporalmente para el log
            Auth::setUser($user);
            
            // Registrar el login en los logs de actividad
            ActivityLog::createLog(
                'login',
                "Usuario '{$user->name} {$user->lastName}' inició sesión",
                User::class,
                $user->id
            );

            // Preparar respuesta
            $user->makeHidden(['password']);

            return $this->successResponse([
                'access_token' => $token,
                'token_type' => 'Bearer',
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'lastName' => $user->lastName,
                    'email' => $user->email,
                    'email_verified_at' => $user->email_verified_at,
                    'id_usuario_updated_user' => $user->id_usuario_updated_user,
                    'roles' => $user->roles,
                    'created_at' => $user->created_at,
                    'updated_at' => $user->updated_at,
                ]
            ], 'Inicio de sesión exitoso');

        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->handleValidationException($e);
        } catch (ApiException $e) {
            return $this->handleApiException($e);
        } catch (\Exception $e) {
            return $this->handleGeneralException($e);
        }
    }

    /**
     * Cerrar sesión
     * @OA\Post (
     *     path="/api/auth/logout",
     *     tags={"Autenticación"},
     *     security={{"bearerAuth": {}}},
     *     @OA\Response(
     *         response=200,
     *         description="Sesión cerrada exitosamente",
     *         @OA\JsonContent(
     *             @OA\Property(property="exito", type="boolean", example=true),
     *             @OA\Property(property="estado", type="integer", example=200),
     *             @OA\Property(property="datos", type="object", nullable=true),
     *             @OA\Property(property="mensaje", type="string", example="Sesión cerrada exitosamente")
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="No autorizado"
     *     )
     * )
     */
    public function logout(Request $request)
    {
        try {
            $user = $request->user();
            
            // Registrar el logout en los logs de actividad antes de revocar el token
            ActivityLog::createLog(
                'logout',
                "Usuario '{$user->name} {$user->lastName}' cerró sesión",
                User::class,
                $user->id
            );
            
            // Revocar el token actual del usuario autenticado
            $user->currentAccessToken()->delete();

            return $this->successResponse(null, 'Sesión cerrada exitosamente');

        } catch (\Exception $e) {
            return $this->handleGeneralException($e);
        }
    }

    /**
     * Cerrar todas las sesiones
     * @OA\Post (
     *     path="/api/auth/logout-all",
     *     tags={"Autenticación"},
     *     security={{"bearerAuth": {}}},
     *     @OA\Response(
     *         response=200,
     *         description="Todas las sesiones cerradas exitosamente",
     *         @OA\JsonContent(
     *             @OA\Property(property="exito", type="boolean", example=true),
     *             @OA\Property(property="estado", type="integer", example=200),
     *             @OA\Property(property="datos", type="object", nullable=true),
     *             @OA\Property(property="mensaje", type="string", example="Todas las sesiones cerradas exitosamente")
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="No autorizado"
     *     )
     * )
     */
    public function logoutAll(Request $request)
    {
        try {
            // Revocar todos los tokens del usuario autenticado
            $request->user()->tokens()->delete();

            return $this->successResponse(null, 'Todas las sesiones cerradas exitosamente');

        } catch (\Exception $e) {
            return $this->handleGeneralException($e);
        }
    }

    /**
     * Obtener información del usuario autenticado
     * @OA\Get (
     *     path="/api/auth/me",
     *     tags={"Autenticación"},
     *     security={{"bearerAuth": {}}},
     *     @OA\Response(
     *         response=200,
     *         description="Información del usuario obtenida exitosamente",
     *         @OA\JsonContent(
     *             @OA\Property(property="exito", type="boolean", example=true),
     *             @OA\Property(property="estado", type="integer", example=200),
     *             @OA\Property(
     *                 property="datos",
     *                 type="object",
     *                 @OA\Property(property="id", type="integer", example=1),
     *                 @OA\Property(property="name", type="string", example="Juan"),
     *                 @OA\Property(property="lastName", type="string", example="Pérez"),
     *                 @OA\Property(property="email", type="string", example="admin@sigesa.com")
     *             ),
     *             @OA\Property(property="error", type="string", nullable=true, example=null)
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="No autorizado"
     *     )
     * )
     */
    public function me(Request $request)
    {
        try {
            $user = $request->user()->load('roles:name');
            
            if (!$user) {
                throw new ApiException('Usuario no autenticado', 401);
            }

            return $this->successResponse([
                'id' => $user->id,
                'name' => $user->name,
                'lastName' => $user->lastName,
                'email' => $user->email,
                'email_verified_at' => $user->email_verified_at,
                'id_usuario_updated_user' => $user->id_usuario_updated_user,
                'roles' => $user->roles,
                'created_at' => $user->created_at,
                'updated_at' => $user->updated_at,
            ], 'Información del usuario obtenida exitosamente');

        } catch (ApiException $e) {
            return $this->handleApiException($e);
        } catch (\Exception $e) {
            return $this->handleGeneralException($e);
        }
    }

    /**
     * Obtener permisos del usuario autenticado
     * @OA\Get(
     *     path="/api/user/permissions",
     *     tags={"Autenticación"},
     *     security={{"sanctum": {}}},
     *     @OA\Response(
     *         response=200,
     *         description="Permisos obtenidos exitosamente",
     *         @OA\JsonContent(
     *             @OA\Property(property="exito", type="boolean", example=true),
     *             @OA\Property(property="estado", type="integer", example=200),
     *             @OA\Property(property="datos", type="array", @OA\Items(type="string"))
     *         )
     *     )
     * )
     */
    public function getUserPermissions(Request $request)
    {
        try {
            $user = $request->user();
            $permissions = $user->getAllPermissions()->pluck('name')->toArray();
            
            return $this->successResponse($permissions, 'Permisos obtenidos exitosamente');
        } catch (\Exception $e) {
            \Log::error('Error al obtener permisos del usuario', [
                'user_id' => $request->user()->id ?? null,
                'error' => $e->getMessage()
            ]);
            
            return $this->handleGeneralException($e);
        }
    }
}
