<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $role1 = Role::create(['name' => 'Admin']);
        $role2 = Role::create(['name' => 'General']);
        $role3 = Role::create(['name' => 'Tecnico']);
        $role4 = Role::create(['name' => 'Coordinador']);

        Permission::create(['name' => 'documentos.index']) -> syncRoles([$role1, $role2, $role3, $role4]);
        Permission::create(['name' => 'documentos.create']) -> syncRoles([$role1, $role3, $role4]);
        Permission::create(['name' => 'documentos.destroy']) -> syncRoles([$role1, $role3, $role4]);
        Permission::create(['name' => 'documentos.edit']) -> syncRoles([$role1, $role3, $role4]);

    }
}
