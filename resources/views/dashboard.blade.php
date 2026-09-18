<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        <title>{{ config('app.name', 'Laravel') }}</title>

        <script>
            (() => {
                try {
                    const preference = localStorage.getItem('vueuse-color-scheme');
                    const shouldUseDark = preference === 'dark' ||
                        (preference !== 'light' && window.matchMedia('(prefers-color-scheme: dark)').matches);

                    document.documentElement.classList.toggle('dark', shouldUseDark);

                    const preset = localStorage.getItem('cms-theme-preset');
                    if (preset) {
                        document.documentElement.dataset.themePreset = preset;
                    }
                } catch {
                    // Theme initialization can safely fall back to light mode.
                }
            })();
        </script>

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />
        <link href="https://fonts.cdnfonts.com/css/lato" rel="stylesheet">

        <!-- Scripts -->
        @vite(['resources/css/app.css', 'resources/js/app.ts'])
    </head>
    <body class="font-sans antialiased">
        <div id="app"></div>

    </body>
</html>
