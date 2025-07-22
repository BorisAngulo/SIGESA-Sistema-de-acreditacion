<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

use App\Models\User;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        User::create([
            'name' => 'Admin',
            'lastName' => 'User',
            'email' => 'admin@gmail.com',
            'password' => bcrypt('123456789'),
            'id_usuario_updated_fase' => 1,
        ])->assignRole('Admin');
    }
}
