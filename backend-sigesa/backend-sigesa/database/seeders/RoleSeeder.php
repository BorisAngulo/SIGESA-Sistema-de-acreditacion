<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use App\Models\User;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // === CREAR ROLES (si no existen) ===
        $adminRole = Role::firstOrCreate(['name' => 'Admin']);
        $tecnicoRole = Role::firstOrCreate(['name' => 'Tecnico']);
        $coordinadorRole = Role::firstOrCreate(['name' => 'Coordinador']);

        // === CREAR PERMISOS ===
        
        // === PERMISOS DE AUTENTICACIÓN ===
        $authPerms = [
            'auth.login',
            'auth.logout',
            'auth.refresh',
            'auth.profile',
            'auth.update_profile',
            'auth.change_password',
        ];
        foreach ($authPerms as $perm) {
            Permission::firstOrCreate(['name' => $perm])->syncRoles([$adminRole, $tecnicoRole, $coordinadorRole]);
        }

        // === PERMISOS DE DOCUMENTOS ===
        $documentoPerms = [
            'documentos.index',
            'documentos.show',
            'documentos.store',
            'documentos.update',
            'documentos.destroy',
            'documentos.download',
            'documentos.asociaciones',
        ];
        foreach ($documentoPerms as $perm) {
            $permission = Permission::firstOrCreate(['name' => $perm]);
            $permission->assignRole([$adminRole, $tecnicoRole, $coordinadorRole]);
        }

        // === PERMISOS DE FASES ===
        $fasePerms = [
            'fases.index',
            'fases.show',
            'fases.store',
            'fases.update',
            'fases.destroy',
            'fases.documentos',
            'fases.estado',
        ];
        foreach ($fasePerms as $perm) {
            $permission = Permission::firstOrCreate(['name' => $perm]);
            $permission->assignRole([$adminRole, $tecnicoRole]);
        }

        // Permisos específicos adicionales para Coordinador en fases
        $faseCoordinadorPerms = ['fases.index', 'fases.show', 'fases.update', 'fases.documentos'];
        foreach ($faseCoordinadorPerms as $perm) {
            Permission::findByName($perm)->assignRole([$coordinadorRole]);
        }

        // === PERMISOS DE SUBFASES ===
        $subfasePerms = [
            'subfases.index',
            'subfases.show',
            'subfases.store',
            'subfases.update',
            'subfases.destroy',
            'subfases.estado',
            'subfases.documentos',
        ];
        foreach ($subfasePerms as $perm) {
            $permission = Permission::firstOrCreate(['name' => $perm]);
            $permission->assignRole([$adminRole, $tecnicoRole]);
        }

        // Permisos específicos adicionales para Coordinador en subfases
        $subfaseCoordinadorPerms = ['subfases.index', 'subfases.show', 'subfases.update', 'subfases.documentos'];
        foreach ($subfaseCoordinadorPerms as $perm) {
            Permission::findByName($perm)->assignRole([$coordinadorRole]);
        }

        // === PERMISOS DE USUARIOS ===
        $usuarioPerms = [
            'usuarios.index',
            'usuarios.show',
            'usuarios.store',
            'usuarios.update',
            'usuarios.destroy',
            'usuarios.roles',
            'usuarios.permissions',
        ];
        foreach ($usuarioPerms as $perm) {
            $permission = Permission::firstOrCreate(['name' => $perm]);
            $permission->assignRole([$adminRole]);
        }
        
        // Técnicos solo pueden ver usuarios (sin modificar)
        $usuarioTecnicoPerms = ['usuarios.index', 'usuarios.show'];
        foreach ($usuarioTecnicoPerms as $perm) {
            Permission::findByName($perm)->assignRole([$tecnicoRole]);
        }

        // === PERMISOS DE CARRERAS ===
        $carreraPerms = [
            'carreras.index',
            'carreras.show',
            'carreras.store',
            'carreras.update',
            'carreras.destroy',
            'carreras.modalidades',
        ];
        foreach ($carreraPerms as $perm) {
            $permission = Permission::firstOrCreate(['name' => $perm]);
            $permission->assignRole([$adminRole, $tecnicoRole]);
        }
        
        // Coordinador solo puede ver carreras (sin modificar)
        $carreraCoordinadorPerms = ['carreras.index', 'carreras.show'];
        foreach ($carreraCoordinadorPerms as $perm) {
            Permission::findByName($perm)->assignRole([$coordinadorRole]);
        }

        // === PERMISOS DE FACULTADES ===
        $facultadPerms = [
            'facultades.index',
            'facultades.show',
            'facultades.store',
            'facultades.update',
            'facultades.destroy',
        ];
        foreach ($facultadPerms as $perm) {
            $permission = Permission::firstOrCreate(['name' => $perm]);
            $permission->assignRole([$adminRole, $tecnicoRole]);
        }
        
        // Coordinador solo puede ver facultades (sin modificar)
        $facultadCoordinadorPerms = ['facultades.index', 'facultades.show'];
        foreach ($facultadCoordinadorPerms as $perm) {
            Permission::findByName($perm)->assignRole([$coordinadorRole]);
        }

        // === PERMISOS DE MODALIDADES ===
        $modalidadPerms = [
            'modalidades.index',
            'modalidades.show',
            'modalidades.store',
            'modalidades.update',
            'modalidades.destroy',
        ];
        foreach ($modalidadPerms as $perm) {
            $permission = Permission::firstOrCreate(['name' => $perm]);
            $permission->assignRole([$adminRole, $tecnicoRole]);
        }
        
        // Coordinador solo puede ver modalidades (sin modificar)
        $modalidadCoordinadorPerms = ['modalidades.index', 'modalidades.show'];
        foreach ($modalidadCoordinadorPerms as $perm) {
            Permission::findByName($perm)->assignRole([$coordinadorRole]);
        }

        // === PERMISOS DE CARRERA-MODALIDAD ===
        $carreraModalidadPerms = [
            'carrera_modalidades.index',
            'carrera_modalidades.show',
            'carrera_modalidades.store',
            'carrera_modalidades.update',
            'carrera_modalidades.destroy',
        ];
        foreach ($carreraModalidadPerms as $perm) {
            $permission = Permission::firstOrCreate(['name' => $perm]);
            $permission->assignRole([$adminRole, $tecnicoRole]);
        }

        // === PERMISOS DE ACTIVITY LOGS ===
        $activityLogPerms = [
            'activity_logs.index',
            'activity_logs.show',
            'activity_logs.clear',
        ];
        foreach ($activityLogPerms as $perm) {
            $permission = Permission::firstOrCreate(['name' => $perm]);
            $permission->assignRole([$adminRole]);
        }

        // === PERMISOS DE BACKUPS ===
        $backupPerms = [
            'backups.index',
            'backups.create',
            'backups.download',
            'backups.restore',
            'backups.delete',
        ];
        foreach ($backupPerms as $perm) {
            $permission = Permission::firstOrCreate(['name' => $perm]);
            $permission->assignRole([$adminRole]);
        }

        // === PERMISOS DE PROCESOS ===
        $procesoPerms = [
            'procesos.index',
            'procesos.show',
            'procesos.store',
            'procesos.update',
            'procesos.destroy',
            'procesos.iniciar',
            'procesos.finalizar',
            'procesos.estado',
        ];
        foreach ($procesoPerms as $perm) {
            $permission = Permission::firstOrCreate(['name' => $perm]);
            $permission->assignRole([$adminRole, $coordinadorRole]);
        }
        
        // Técnicos solo pueden ver procesos
        $procesoTecnicoPerms = ['procesos.index', 'procesos.show'];
        foreach ($procesoTecnicoPerms as $perm) {
            Permission::findByName($perm)->assignRole([$tecnicoRole]);
        }

        // === PERMISOS DE UTILIDADES ===
        $utilidadPerms = [
            'utilidades.file_manager',
            'utilidades.system_info',
            'utilidades.cache_clear',
            'utilidades.logs',
        ];
        foreach ($utilidadPerms as $perm) {
            $permission = Permission::firstOrCreate(['name' => $perm]);
            $permission->assignRole([$adminRole]);
        }

        // === PERMISOS ESPECIALES DE INSTITUCIONES ===
        $institucionPerms = [
            'instituciones.index',
            'instituciones.show',
            'instituciones.store',
            'instituciones.update',
            'instituciones.destroy',
            'instituciones.carreras',
            'instituciones.facultades',
        ];
        foreach ($institucionPerms as $perm) {
            $permission = Permission::firstOrCreate(['name' => $perm]);
            $permission->assignRole([$adminRole, $tecnicoRole]);
        }
        
        // Coordinador solo puede ver instituciones
        $institucionCoordinadorPerms = ['instituciones.index', 'instituciones.show'];
        foreach ($institucionCoordinadorPerms as $perm) {
            Permission::findByName($perm)->assignRole([$coordinadorRole]);
        }

        // === ASIGNAR PERMISOS ADICIONALES POR ROL ===
        
        // Admin ya tiene todos los permisos asignados arriba mediante assignRole()
        
        // Coordinador: Permisos específicos para gestión de procesos de acreditación
        // (Ya asignados arriba de manera limpia)
        
        // Técnico: Permisos específicos para soporte técnico
        // (Ya asignados arriba de manera limpia)
    }
}
