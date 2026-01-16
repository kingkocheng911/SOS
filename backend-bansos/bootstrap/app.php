<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // Pengecualian CSRF untuk API agar React bisa melakukan POST, PUT, DELETE
        $middleware->validateCsrfTokens(except: [
            'api/*',
        ]);

        // Opsional: Jika Anda ingin memastikan header CORS terpasang otomatis
        // Biasanya sudah ditangani oleh config/cors.php, namun baris di atas 
        // sangat krusial untuk Laravel 11 agar tidak menolak request dari luar.
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();