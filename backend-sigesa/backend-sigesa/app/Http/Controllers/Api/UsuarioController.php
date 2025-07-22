<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Models\User;
use App\Exceptions\ApiException;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Spatie\Permission\Models\Role;

/**
* @OA\Tag(
*     name="Usuario",
*     description="Operaciones relacionadas con la gestión de usuarios del sistema SIGESA",
*     externalDocs={
*         "description": "Documentación de la API",
*         "url": "https://github.com/borisangulo/Sistema-de-Acreditacion-UMSS-SIGESA/blob/main/backend-sigesa/backend-sigesa/README.md"
*     }
* )
 */
class UsuarioController extends BaseApiController
{
    /**
     * Obtener todos los usuarios
     * @OA\Get (
     *     path="/api/usuarios",
     *     tags={"Usuario"},
     *     @OA\Response(
     *         response=200,
     *         description="Usuarios obtenidos exitosamente",
     *         @OA\JsonContent(
     *             @OA\Property(property="exito", type="boolean", example=true),
     *             @OA\Property(property="estado", type="integer", example=200),
     *             @OA\Property(
     *                 property="datos",
     *                 type="array",
     *                 @OA\Items(
     *                     type="object",
     *                     @OA\Property(property="id", type="integer", example=1),
     *                     @OA\Property(property="name", type="string", example="Juan"),
     *                     @OA\Property(property="lastName", type="string", example="Pérez"),
     *                     @OA\Property(property="email", type="string", example="juan.perez@email.com"),
     *                     @OA\Property(property="email_verified_at", type="string", nullable=true),
     *                     @OA\Property(property="created_at", type="string"),
     *                     @OA\Property(property="updated_at", type="string"),
     *                     @OA\Property(property="roles", type="array", @OA\Items(type="object", @OA\Property(property="name", type="string", example="General")))
     *                 )
     *             ),
     *             @OA\Property(property="error", type="string", nullable=true, example=null)
     *         )
     *     )
     * )
     */
    public function index()
    {
        try {
            $usuarios = User::select('id', 'name', 'lastName', 'email', 'email_verified_at', 'created_at', 'updated_at', 'id_usuario_updated_fase')
                           ->with('roles:name')
                           ->get();

            if ($usuarios->isEmpty()) {
                return $this->successResponse([], 'No hay usuarios registrados', 200);
            }

            return $this->successResponse($usuarios, 'Usuarios obtenidos exitosamente');
        } catch (\Exception $e) {
            return $this->handleGeneralException($e);
        }
    }

    /**
     * Crear un nuevo usuario
     * @OA\Post (
     *     path="/api/usuarios",
     *     tags={"Usuario"},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="name", type="string", example="Juan"),
     *             @OA\Property(property="lastName", type="string", example="Pérez"),
     *             @OA\Property(property="email", type="string", example="juan.perez@email.com"),
     *             @OA\Property(property="password", type="string", example="password123"),
     *             @OA\Property(property="password_confirmation", type="string", example="password123"),
     *             @OA\Property(property="role", type="string", example="General", description="Rol del usuario: Admin, General, Tecnico, Coordinador"),
     *             @OA\Property(property="id_usuario_updated_fase", type="integer", nullable=true, example=1)
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Usuario creado exitosamente",
     *         @OA\JsonContent(
     *             @OA\Property(property="exito", type="boolean", example=true),
     *             @OA\Property(property="estado", type="integer", example=201),
     *             @OA\Property(property="datos", type="object"),
     *             @OA\Property(property="error", type="string", nullable=true, example=null)
     *         )
     *     ),
     *     @OA\Response(
     *         response=400,
     *         description="Error en la validación",
     *         @OA\JsonContent(
     *             @OA\Property(property="exito", type="boolean", example=false),
     *             @OA\Property(property="estado", type="integer", example=400),
     *             @OA\Property(property="datos", type="object", nullable=true),
     *             @OA\Property(property="error", type="string", example="El email ya está en uso")
     *         )
     *     )
     * )
     */
    public function store(Request $request)
    {
        DB::beginTransaction();
        
        try {
            // Validación de datos
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'lastName' => 'required|string|max:255',
                'email' => 'required|email|unique:users,email|max:255',
                'password' => 'required|string|min:8|confirmed',
                'role' => 'required|string|in:Admin,General,Tecnico,Coordinador',
                'id_usuario_updated_fase' => 'nullable|integer',
            ]);

            // Crear el usuario
            $usuario = User::create([
                'name' => $validated['name'],
                'lastName' => $validated['lastName'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'id_usuario_updated_fase' => $validated['id_usuario_updated_fase'] ?? null,
            ]);

            if (!$usuario) {
                throw ApiException::creationFailed('usuario');
            }

            // Asignar rol al usuario
            $usuario->assignRole($validated['role']);

            DB::commit();

            // Eliminar la contraseña de la respuesta y cargar roles
            $usuario->makeHidden(['password']);
            $usuario->load('roles');

            return $this->successResponse($usuario, 'Usuario creado exitosamente', 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            DB::rollBack();
            return $this->handleValidationException($e);
        } catch (ApiException $e) {
            DB::rollBack();
            return $this->handleApiException($e);
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->handleGeneralException($e);
        }
    }

    /**
     * Obtener un usuario específico
     * @OA\Get (
     *     path="/api/usuarios/{id}",
     *     tags={"Usuario"},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer"),
     *         description="ID del usuario"
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Usuario encontrado",
     *         @OA\JsonContent(
     *             @OA\Property(property="exito", type="boolean", example=true),
     *             @OA\Property(property="estado", type="integer", example=200),
     *             @OA\Property(
     *                 property="datos",
     *                 type="object",
     *                 @OA\Property(property="id", type="integer", example=1),
     *                 @OA\Property(property="name", type="string", example="Juan"),
     *                 @OA\Property(property="lastName", type="string", example="Pérez"),
     *                 @OA\Property(property="email", type="string", example="juan.perez@email.com"),
     *                 @OA\Property(property="roles", type="array", @OA\Items(type="object", @OA\Property(property="name", type="string", example="General")))
     *             ),
     *             @OA\Property(property="error", type="string", nullable=true, example=null)
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Usuario no encontrado"
     *     )
     * )
     */
    public function show($id)
    {
        try {
            $usuario = User::select('id', 'name', 'lastName', 'email', 'email_verified_at', 'created_at', 'updated_at', 'id_usuario_updated_fase')
                          ->with('roles:name')
                          ->find($id);

            if (!$usuario) {
                throw ApiException::notFound('usuario', $id);
            }

            return $this->successResponse($usuario, 'Usuario encontrado');
        } catch (ApiException $e) {
            return $this->handleApiException($e);
        } catch (\Exception $e) {
            return $this->handleGeneralException($e);
        }
    }

    /**
     * Actualizar un usuario
     * @OA\Put (
     *     path="/api/usuarios/{id}",
     *     tags={"Usuario"},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer"),
     *         description="ID del usuario"
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="name", type="string", example="Juan Carlos"),
     *             @OA\Property(property="lastName", type="string", example="Pérez González"),
     *             @OA\Property(property="email", type="string", example="juan.carlos@email.com"),
     *             @OA\Property(property="password", type="string", example="newpassword123", description="Opcional - solo si se quiere cambiar"),
     *             @OA\Property(property="password_confirmation", type="string", example="newpassword123", description="Requerido si se envía password"),
     *             @OA\Property(property="role", type="string", example="Coordinador", description="Opcional - Rol del usuario: Admin, General, Tecnico, Coordinador"),
     *             @OA\Property(property="id_usuario_updated_fase", type="integer", nullable=true, example=2)
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Usuario actualizado exitosamente"
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Usuario no encontrado"
     *     )
     * )
     */
    public function update(Request $request, $id)
    {
        DB::beginTransaction();
        
        try {
            $usuario = User::find($id);

            if (!$usuario) {
                throw ApiException::notFound('usuario', $id);
            }

            // Validación de datos
            $validated = $request->validate([
                'name' => 'sometimes|required|string|max:255',
                'lastName' => 'sometimes|required|string|max:255',
                'email' => [
                    'sometimes',
                    'required',
                    'email',
                    'max:255',
                    Rule::unique('users')->ignore($usuario->id)
                ],
                'password' => 'sometimes|required|string|min:8|confirmed',
                'role' => 'sometimes|required|string|in:Admin,General,Tecnico,Coordinador',
                'id_usuario_updated_fase' => 'nullable|integer',
            ]);

            // Actualizar campos
            if (isset($validated['name'])) {
                $usuario->name = $validated['name'];
            }
            
            if (isset($validated['lastName'])) {
                $usuario->lastName = $validated['lastName'];
            }
            
            if (isset($validated['email'])) {
                $usuario->email = $validated['email'];
            }
            
            if (isset($validated['password'])) {
                $usuario->password = Hash::make($validated['password']);
            }
            
            if (array_key_exists('id_usuario_updated_fase', $validated)) {
                $usuario->id_usuario_updated_fase = $validated['id_usuario_updated_fase'];
            }

            // Actualizar rol si se proporciona
            if (isset($validated['role'])) {
                // Remover todos los roles actuales y asignar el nuevo
                $usuario->syncRoles([$validated['role']]);
            }

            $updated = $usuario->save();

            if (!$updated) {
                throw ApiException::updateFailed('usuario');
            }

            DB::commit();

            // Eliminar la contraseña de la respuesta y cargar roles
            $usuario->makeHidden(['password']);
            $usuario->load('roles:name');

            return $this->successResponse($usuario, 'Usuario actualizado exitosamente');

        } catch (\Illuminate\Validation\ValidationException $e) {
            DB::rollBack();
            return $this->handleValidationException($e);
        } catch (ApiException $e) {
            DB::rollBack();
            return $this->handleApiException($e);
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->handleGeneralException($e);
        }
    }

    /**
     * Eliminar un usuario
     * @OA\Delete (
     *     path="/api/usuarios/{id}",
     *     tags={"Usuario"},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer"),
     *         description="ID del usuario"
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Usuario eliminado exitosamente"
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Usuario no encontrado"
     *     )
     * )
     */
    public function destroy($id)
    {
        DB::beginTransaction();
        
        try {
            $usuario = User::find($id);

            if (!$usuario) {
                throw ApiException::notFound('usuario', $id);
            }

            $deleted = $usuario->delete();

            if (!$deleted) {
                throw ApiException::deletionFailed('usuario');
            }

            DB::commit();

            return $this->successResponse(null, 'Usuario eliminado exitosamente', 200);

        } catch (ApiException $e) {
            DB::rollBack();
            return $this->handleApiException($e);
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->handleGeneralException($e);
        }
    }

    /**
     * Obtener roles disponibles
     * @OA\Get (
     *     path="/api/usuarios/roles",
     *     tags={"Usuario"},
     *     @OA\Response(
     *         response=200,
     *         description="Roles disponibles obtenidos exitosamente",
     *         @OA\JsonContent(
     *             @OA\Property(property="exito", type="boolean", example=true),
     *             @OA\Property(property="estado", type="integer", example=200),
     *             @OA\Property(
     *                 property="datos",
     *                 type="array",
     *                 @OA\Items(
     *                     type="object",
     *                     @OA\Property(property="id", type="integer", example=1),
     *                     @OA\Property(property="name", type="string", example="Admin"),
     *                     @OA\Property(property="guard_name", type="string", example="web")
     *                 )
     *             ),
     *             @OA\Property(property="error", type="string", nullable=true, example=null)
     *         )
     *     )
     * )
     */
    public function getRoles()
    {
        try {
            $roles = Role::select('id', 'name', 'guard_name')->get();

            return $this->successResponse($roles, 'Roles disponibles obtenidos exitosamente');
        } catch (\Exception $e) {
            return $this->handleGeneralException($e);
        }
    }
}
