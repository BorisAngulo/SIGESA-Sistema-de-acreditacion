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
            Permission::firstOrCreate(['name' => $perm])->syncRoles([$adminRole, $tecnicoRole, $coordinadorRole]);
        }

        Permission::findByName('documentos.index')->givePermissionTo([$coordinadorRole]);
        Permission::findByName('documentos.show')->givePermissionTo([$coordinadorRole]);
        Permission::findByName('documentos.store')->givePermissionTo([$coordinadorRole]);
        Permission::findByName('documentos.download')->givePermissionTo([$coordinadorRole]);
        Permission::findByName('documentos.asociaciones')->givePermissionTo([$coordinadorRole]);

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
            Permission::firstOrCreate(['name' => $perm])->syncRoles([$adminRole, $tecnicoRole]);
        }

        Permission::findByName('fases.index')->givePermissionTo([$coordinadorRole]);
        Permission::findByName('fases.show')->givePermissionTo([$coordinadorRole]);
        Permission::findByName('fases.update')->givePermissionTo([$coordinadorRole]);
        Permission::findByName('fases.documentos')->givePermissionTo([$coordinadorRole]);

        // === PERMISOS DE SUBFASES ===
        $subfasePerms = [
            'subfases.index',
            'subfases.show',
            'subfases.store',
            'subfases.update',
            'subfases.destroy',
            'subfases.documentos',
            'subfases.estado',
        ];
        foreach ($subfasePerms as $perm) {
            Permission::firstOrCreate(['name' => $perm])->syncRoles([$adminRole, $tecnicoRole]);
        }

        Permission::findByName('subfases.index')->givePermissionTo([$coordinadorRole]);
        Permission::findByName('subfases.show')->givePermissionTo([$coordinadorRole]);
        Permission::findByName('subfases.update')->givePermissionTo([$coordinadorRole]);
        Permission::findByName('subfases.documentos')->givePermissionTo([$coordinadorRole]);

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
            Permission::firstOrCreate(['name' => $perm])->syncRoles([$adminRole]);
        }
        // Técnicos solo pueden ver usuarios
        Permission::findByName('usuarios.index')->givePermissionTo([ $tecnicoRole]);
        Permission::findByName('usuarios.show')->givePermissionTo([ $tecnicoRole]);

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
            Permission::firstOrCreate(['name' => $perm])->syncRoles([$adminRole, $tecnicoRole]);
        }
        // Técnicos solo pueden ver carreras
        Permission::findByName('carreras.index')->givePermissionTo([$coordinadorRole]);
        Permission::findByName('carreras.show')->givePermissionTo([$coordinadorRole]);

        // === PERMISOS DE FACULTADES ===
        $facultadPerms = [
            'facultades.index',
            'facultades.show',
            'facultades.store',
            'facultades.update',
            'facultades.destroy',
        ];
        foreach ($facultadPerms as $perm) {
            Permission::firstOrCreate(['name' => $perm])->syncRoles([$adminRole, $tecnicoRole]);
        }
        // Técnicos solo pueden ver facultades
        Permission::findByName('facultades.index')->givePermissionTo([$coordinadorRole]);
        Permission::findByName('facultades.show')->givePermissionTo([$coordinadorRole]);

        // === PERMISOS DE MODALIDADES ===
        $modalidadPerms = [
            'modalidades.index',
            'modalidades.show',
            'modalidades.store',
            'modalidades.update',
            'modalidades.destroy',
        ];
        foreach ($modalidadPerms as $perm) {
            Permission::firstOrCreate(['name' => $perm])->syncRoles([$adminRole, $tecnicoRole]);
        }
        // Técnicos solo pueden ver modalidades
        Permission::findByName('modalidades.index')->givePermissionTo([$coordinadorRole]);
        Permission::findByName('modalidades.show')->givePermissionTo([$coordinadorRole]);

        // === PERMISOS DE CARRERA-MODALIDAD ===
        $carreraModalidadPerms = [
            'carrera_modalidades.index',
            'carrera_modalidades.show',
            'carrera_modalidades.store',
            'carrera_modalidades.update',
            'carrera_modalidades.destroy',
        ];
        foreach ($carreraModalidadPerms as $perm) {
            Permission::firstOrCreate(['name' => $perm])->syncRoles([$adminRole, $tecnicoRole]);
        }

        // === PERMISOS DE ACTIVITY LOGS ===
        $activityLogPerms = [
            'activity_logs.index',
            'activity_logs.show',
            'activity_logs.clear',
        ];
        foreach ($activityLogPerms as $perm) {
            Permission::firstOrCreate(['name' => $perm])->syncRoles([$adminRole]);
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
            Permission::firstOrCreate(['name' => $perm])->syncRoles([$adminRole]);
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
            Permission::firstOrCreate(['name' => $perm])->syncRoles([$adminRole, $coordinadorRole]);
        }
        // Técnicos solo pueden ver procesos
        Permission::findByName('procesos.index')->syncRoles([$adminRole, $tecnicoRole, $coordinadorRole]);
        Permission::findByName('procesos.show')->syncRoles([$adminRole, $tecnicoRole, $coordinadorRole]);

        // === PERMISOS DE UTILIDADES ===
        $utilidadPerms = [
            'utilidades.file_manager',
            'utilidades.system_info',
            'utilidades.cache_clear',
            'utilidades.logs',
        ];
        foreach ($utilidadPerms as $perm) {
            Permission::firstOrCreate(['name' => $perm])->syncRoles([$adminRole]);
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
            Permission::firstOrCreate(['name' => $perm])->syncRoles([$adminRole, $tecnicoRole]);
        }
        // Técnicos solo pueden ver instituciones
        Permission::findByName('instituciones.index')->syncRoles([$adminRole, $tecnicoRole, $coordinadorRole]);
        Permission::findByName('instituciones.show')->syncRoles([$adminRole, $tecnicoRole, $coordinadorRole]);

        // === ASIGNAR PERMISOS ADICIONALES POR ROL ===
        
        // El Admin tiene todos los permisos (ya asignados arriba)
        
        // El Coordinador puede gestionar su institución
        $coordinadorRole->givePermissionTo([
            'fases.update',
            'subfases.update',
            'documentos.store',
            'documentos.update',
        ]);
        
        // El Técnico puede trabajar con documentos y procesos
        $tecnicoRole->givePermissionTo([
            'documentos.store',
            'documentos.update',
            'fases.update',
            'subfases.update',
        ]);
    }
}
