<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * The Artisan commands provided by your application.
     *
     * @var array
     */
    protected $commands = [
        Commands\TestActivityLog::class,
    ];

    /**
     * Define the application's command schedule.
     *
     * @param  \Illuminate\Console\Scheduling\Schedule  $schedule
     * @return void
     */
    protected function schedule(Schedule $schedule)
    {
        // Backup semanal automático los domingos a las 2:00 AM
        $schedule->command('backup:run')
            ->weekly()
            ->sundays()
            ->at('02:00')
            ->emailOutputOnFailure(config('mail.from.address'))
            ->appendOutputTo(storage_path('logs/backup.log'));

        // Limpiar backups antiguos los lunes a las 3:00 AM (mantener últimas 8 semanas)
        $schedule->command('backup:clean')
            ->weekly()
            ->mondays()
            ->at('03:00')
            ->appendOutputTo(storage_path('logs/backup-clean.log'));
    }

    /**
     * Register the commands for the application.
     *
     * @return void
     */
    protected function commands()
    {
        $this->load(__DIR__.'/Commands');

        require base_path('routes/console.php');
    }
}
