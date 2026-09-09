<?php
/**
 * Optimiza los WebP de la biblioteca de WordPress sin binarios externos.
 *
 * Aplica dos tratamientos distintos según lo que sea cada fichero:
 *
 *   · WebP CON pérdida  → reescribe el contenedor RIFF quitando los
 *                         trozos XMP, ICCP y EXIF. Es manipulación de
 *                         bytes: no descomprime ni reencoda nada, así
 *                         que la calidad es idéntica. Suele bajar un
 *                         60-80%, porque WordPress copia los metadatos
 *                         del original en cada miniatura que genera.
 *
 *   · WebP SIN pérdida  → lo reencoda con GD (o Imagick) a calidad 80
 *                         conservando el canal alfa. Suele bajar ~77%.
 *
 * No renombra ningún fichero, así que no hay que regenerar miniaturas
 * ni tocar la base de datos.
 *
 * USO
 *   1. Cambia TOKEN por una cadena tuya.
 *   2. Sube el fichero a la raíz de WordPress.
 *   3. Simulación:  https://tudominio.com/optimizar-webp.php?token=LOTUYO
 *      Aplicar:     ...?token=LOTUYO&apply=1
 *      Por SSH:     php optimizar-webp.php --apply
 *   4. BÓRRALO del servidor al terminar.
 *
 * Es idempotente: se puede lanzar varias veces sin degradar las
 * imágenes. En la segunda pasada no encuentra nada que quitar y las
 * salta.
 */

// ─── Configuración ──────────────────────────────────────────────────

const TOKEN     = 'CAMBIA-ESTO-POR-ALGO-LARGO-Y-UNICO';
const CALIDAD   = 80;      // calidad del reencodado (0-100)
const LOTE      = 150;     // ficheros por ejecución, para no agotar el
                           // tiempo máximo de PHP en hosting compartido
const GANANCIA_MINIMA = 1024;  // bytes: si ahorra menos, no se toca
const HACER_COPIA = false; // true → deja un .bak de cada fichero

// ─── Arranque ───────────────────────────────────────────────────────

$esCli = (php_sapi_name() === 'cli');

if (!$esCli) {
    if (!isset($_GET['token']) || !hash_equals(TOKEN, $_GET['token'])) {
        http_response_code(403);
        exit('Token no válido.');
    }
    header('Content-Type: text/plain; charset=utf-8');
}

@set_time_limit(0);
@ini_set('memory_limit', '512M');

$aplicar = $esCli
    ? in_array('--apply', $argv ?? [], true)
    : isset($_GET['apply']);

$raiz = __DIR__ . '/wp-content/uploads';
if ($esCli && isset($argv[1]) && is_dir($argv[1])) {
    $raiz = rtrim($argv[1], '/');
}

if (!is_dir($raiz)) {
    exit("No encuentro la carpeta de subidas en: $raiz\n");
}

// ─── Manipulación del contenedor WebP ───────────────────────────────

/**
 * Descompone un fichero WebP en sus trozos (chunks).
 * Estructura: "RIFF" + tamaño(4) + "WEBP" + [id(4) + tamaño(4) + datos]…
 * Cada trozo se rellena a tamaño par.
 */
function leerChunks(string $bytes): ?array
{
    if (strlen($bytes) < 12
        || substr($bytes, 0, 4) !== 'RIFF'
        || substr($bytes, 8, 4) !== 'WEBP') {
        return null;
    }

    $chunks = [];
    $pos = 12;

    while ($pos + 8 <= strlen($bytes)) {
        $id = substr($bytes, $pos, 4);
        $tam = unpack('V', substr($bytes, $pos + 4, 4))[1];

        if ($tam < 0 || $pos + 8 + $tam > strlen($bytes)) {
            return null;   // fichero truncado o corrupto
        }

        $chunks[] = ['id' => $id, 'datos' => substr($bytes, $pos + 8, $tam)];
        $pos += 8 + $tam + ($tam % 2);   // saltar el relleno
    }

    return $chunks;
}

function esSinPerdida(array $chunks): bool
{
    foreach ($chunks as $c) {
        if ($c['id'] === 'VP8L') return true;
    }
    return false;
}

function pesoMetadatos(array $chunks): int
{
    $n = 0;
    foreach ($chunks as $c) {
        if (in_array($c['id'], ['XMP ', 'ICCP', 'EXIF'], true)) {
            $n += strlen($c['datos']);
        }
    }
    return $n;
}

/**
 * Reconstruye el fichero sin los trozos de metadatos.
 *
 * El trozo VP8X lleva un byte de banderas que declara qué contiene el
 * fichero. Si quitamos los metadatos hay que apagar sus bits, o algún
 * decodificador buscará trozos que ya no están:
 *
 *   0x20 ICC    0x10 alfa    0x08 EXIF    0x04 XMP    0x02 animación
 */
function quitarMetadatos(array $chunks): string
{
    $salida = '';

    foreach ($chunks as $c) {
        if (in_array($c['id'], ['XMP ', 'ICCP', 'EXIF'], true)) {
            continue;
        }

        $datos = $c['datos'];

        if ($c['id'] === 'VP8X' && strlen($datos) >= 1) {
            $banderas = ord($datos[0]);
            $banderas &= ~0x20;   // ICC
            $banderas &= ~0x08;   // EXIF
            $banderas &= ~0x04;   // XMP
            $datos[0] = chr($banderas);
        }

        $salida .= $c['id'] . pack('V', strlen($datos)) . $datos;
        if (strlen($datos) % 2) {
            $salida .= "\0";      // relleno a tamaño par
        }
    }

    return 'RIFF' . pack('V', strlen($salida) + 4) . 'WEBP' . $salida;
}

/**
 * Reencoda a modo con pérdida conservando la transparencia.
 * Ni GD ni Imagick copian los metadatos, así que desaparecen solos.
 */
function reencodar(string $origen, string $destino): bool
{
    if (function_exists('imagecreatefromwebp')) {
        $im = @imagecreatefromwebp($origen);
        if ($im === false) return false;

        imagepalettetotruecolor($im);
        imagealphablending($im, false);
        imagesavealpha($im, true);

        $ok = @imagewebp($im, $destino, CALIDAD);
        // imagedestroy() está obsoleto desde PHP 8.5 y no hace nada
        // desde la 8.0: el recolector libera la imagen solo.
        unset($im);

        return $ok && filesize($destino) > 0;
    }

    if (class_exists('Imagick')) {
        try {
            $img = new Imagick($origen);
            $img->setImageFormat('webp');
            $img->setOption('webp:lossless', 'false');
            $img->setImageCompressionQuality(CALIDAD);
            $img->stripImage();
            $ok = $img->writeImage($destino);
            $img->clear();
            return (bool) $ok;
        } catch (Throwable $e) {
            return false;
        }
    }

    return false;
}

// ─── Recorrido ──────────────────────────────────────────────────────

$motor = function_exists('imagecreatefromwebp') ? 'GD'
       : (class_exists('Imagick') ? 'Imagick' : 'ninguno');

echo str_repeat('─', 68) . "\n";
echo $aplicar ? "  APLICANDO CAMBIOS\n" : "  SIMULACIÓN — no se modifica nada\n";
echo "  carpeta : $raiz\n";
echo "  motor   : $motor" . ($motor === 'ninguno' ? '  ← solo se podrán quitar metadatos' : '') . "\n";
echo str_repeat('─', 68) . "\n\n";

$iter = new RecursiveIteratorIterator(
    new RecursiveDirectoryIterator($raiz, FilesystemIterator::SKIP_DOTS)
);

$totalAntes = $totalDespues = 0;
$nStrip = $nReenc = $nSaltados = 0;
$procesados = 0;
$pendientes = 0;
$encontrados = 0;   // .webp vistos, se procesen o no
$ejemplos = [];     // muestras de ficheros que no se pudieron leer
$muestra = [];      // primeros .webp vistos, para confirmar la carpeta
$razones = [
    'no_legible'          => 0,
    'riff_no_reconocido'  => 0,
    'reencodado_falla'    => 0,
    'sin_metadatos'       => 0,
    'ganancia_pequena'    => 0,
    'salida_invalida'     => 0,
];

foreach ($iter as $fichero) {
    if (!$fichero->isFile()) continue;
    if (strtolower($fichero->getExtension()) !== 'webp') continue;

    $encontrados++;
    if (count($muestra) < 3) {
        $muestra[] = sprintf('%s (%d KB)',
            str_replace($raiz . '/', '', $fichero->getPathname()),
            intdiv($fichero->getSize(), 1024));
    }

    if ($procesados >= LOTE) { $pendientes++; continue; }

    $ruta = $fichero->getPathname();
    $bytes = @file_get_contents($ruta);
    if ($bytes === false) { $nSaltados++; $razones['no_legible']++; continue; }

    $chunks = leerChunks($bytes);
    if ($chunks === null) {
        $nSaltados++; $razones['riff_no_reconocido']++;
        if (count($ejemplos) < 3) {
            $ejemplos[] = sprintf('%s → cabecera: %s / %s, %d bytes',
                str_replace($raiz . '/', '', $ruta),
                bin2hex(substr($bytes, 0, 4)), bin2hex(substr($bytes, 8, 4)), strlen($bytes));
        }
        continue;
    }

    $antes = strlen($bytes);
    $sinPerdida = esSinPerdida($chunks);
    $accion = null;
    $nuevo = false;

    if ($sinPerdida && $motor !== 'ninguno') {
        $tmp = $ruta . '.tmp';
        if (reencodar($ruta, $tmp)) {
            $nuevo = @file_get_contents($tmp);
            $accion = 'reencodar';
        } else {
            $razones['reencodado_falla']++;
        }
        @unlink($tmp);
    }

    // Si no se pudo reencodar (o el fichero ya era con pérdida),
    // al menos se le quitan los metadatos.
    if ($nuevo === false) {
        if (pesoMetadatos($chunks) === 0) {
            $nSaltados++; $razones['sin_metadatos']++; continue;
        }
        $nuevo = quitarMetadatos($chunks);
        $accion = 'metadatos';
    }

    // Comprobación: la salida tiene que seguir siendo un WebP legible.
    if ($nuevo === false || leerChunks($nuevo) === null) {
        $nSaltados++; $razones['salida_invalida']++;
        continue;
    }

    $despues = strlen($nuevo);

    if ($despues > $antes - GANANCIA_MINIMA) {
        $nSaltados++; $razones['ganancia_pequena']++; continue;
    }

    $procesados++;
    $totalAntes += $antes;
    $totalDespues += $despues;
    $accion === 'reencodar' ? $nReenc++ : $nStrip++;

    printf("  %-10s %6d KB → %6d KB  %s\n",
        $accion,
        intdiv($antes, 1024),
        intdiv($despues, 1024),
        str_replace($raiz . '/', '', $ruta)
    );

    if ($aplicar) {
        if (HACER_COPIA) @copy($ruta, $ruta . '.bak');

        // Escribir a un temporal y renombrar: el reemplazo es atómico,
        // nunca queda un fichero a medio escribir.
        $tmp = $ruta . '.nuevo';
        if (@file_put_contents($tmp, $nuevo) === strlen($nuevo)) {
            @rename($tmp, $ruta);
        } else {
            @unlink($tmp);
            echo "  ⚠  no se pudo escribir: $ruta\n";
        }
    }
}

echo "\n" . str_repeat('─', 68) . "\n";
printf("  .webp encontrados  : %d\n", $encontrados);
foreach ($muestra as $m) printf("      p.ej. %s\n", $m);
printf("  metadatos quitados : %d\n", $nStrip);
printf("  reencodados        : %d\n", $nReenc);
printf("  sin cambios        : %d\n", $nSaltados);

if ($totalAntes > 0) {
    printf("  peso               : %d KB → %d KB\n",
        intdiv($totalAntes, 1024), intdiv($totalDespues, 1024));
    printf("  ahorro             : %d KB (%d%%)\n",
        intdiv($totalAntes - $totalDespues, 1024),
        intdiv(($totalAntes - $totalDespues) * 100, $totalAntes));
}
echo str_repeat('─', 68) . "\n";

if ($nSaltados > 0) {
    $etiquetas = [
        'no_legible'         => 'no se pudieron leer (permisos)',
        'riff_no_reconocido' => 'no parecen WebP válidos',
        'reencodado_falla'   => 'GD/Imagick no pudo reencodarlos',
        'sin_metadatos'      => 'ya limpios, nada que quitar',
        'ganancia_pequena'   => 'el ahorro era menor de 1 KB',
        'salida_invalida'    => 'la salida no era un WebP válido',
    ];
    echo "\n  Motivo de los que se saltaron:\n";
    foreach ($razones as $clave => $n) {
        if ($n > 0) printf("    %-34s %d\n", $etiquetas[$clave], $n);
    }
    $suma = array_sum($razones);
    if ($suma < $nSaltados) {
        printf("    %-34s %d\n", 'sin motivo registrado', $nSaltados - $suma);
    }
    foreach ($ejemplos as $e) echo "    ejemplo: $e\n";
}

// Los PNG y JPEG no se tocan: convertirlos a .webp cambiaría el nombre
// del fichero y WordPress seguiría pidiendo el antiguo. Se listan para
// tratarlos aparte, reemplazando el medio desde el panel.
$pesados = [];
foreach (new RecursiveIteratorIterator(
    new RecursiveDirectoryIterator($raiz, FilesystemIterator::SKIP_DOTS)) as $f) {
    if (!$f->isFile()) continue;
    if (!in_array(strtolower($f->getExtension()), ['png', 'jpg', 'jpeg'], true)) continue;
    if ($f->getSize() < 100 * 1024) continue;
    $pesados[] = $f;
}

if ($pesados) {
    $suma = array_sum(array_map(fn($f) => $f->getSize(), $pesados));
    printf("\n  Además hay %d PNG/JPEG de más de 100 KB (%d KB en total).\n",
        count($pesados), intdiv($suma, 1024));
    echo "  No se tocan: renombrarlos a .webp rompería las URLs que\n";
    echo "  WordPress tiene guardadas. Hay que reemplazar el medio\n";
    echo "  desde el panel o usar un plugin que reescriba las peticiones.\n";
    foreach (array_slice($pesados, 0, 10) as $f) {
        printf("    %6d KB  %s\n",
            intdiv($f->getSize(), 1024),
            str_replace($raiz . '/', '', $f->getPathname()));
    }
}

if ($pendientes > 0) {
    printf("\n  Quedan %d ficheros por revisar (lote de %d).\n", $pendientes, LOTE);
    echo "  Vuelve a lanzarlo: los ya optimizados se saltan solos.\n";
}

if (!$aplicar) {
    echo "\n  Esto era una simulación. Para aplicarlo:\n";
    echo $esCli
        ? "    php " . basename(__FILE__) . " --apply\n"
        : "    añade &apply=1 a la URL\n";
}

if (!$esCli) {
    echo "\n  ⚠  BORRA ESTE FICHERO DEL SERVIDOR AL TERMINAR.\n";
}
