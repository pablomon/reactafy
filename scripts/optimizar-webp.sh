#!/usr/bin/env bash
#
# Optimiza los WebP de una biblioteca de WordPress sin cambiar nombres
# de fichero, así que no hay que regenerar miniaturas ni tocar la base
# de datos.
#
# Aplica dos tratamientos según lo que sea cada fichero:
#
#   · WebP con pérdida  → solo quita metadatos (XMP/ICC/EXIF).
#                         Cero pérdida de calidad. Suele bajar 60-80%
#                         porque WordPress copia los metadatos del
#                         original en cada miniatura que genera.
#
#   · WebP sin pérdida  → lo reencoda con pérdida conservando el canal
#                         alfa. Suele bajar ~77%.
#
# Por defecto NO toca nada: solo informa de lo que ahorraría.
#
#   ./optimizar-webp.sh ruta/a/uploads              # simulación
#   ./optimizar-webp.sh --apply ruta/a/uploads      # aplica
#   ./optimizar-webp.sh --apply --backup uploads    # aplica y guarda .bak
#
# Requiere libwebp: cwebp, dwebp, webpmux, webpinfo
#   macOS   → brew install webp
#   Debian  → apt install webp
#

set -euo pipefail

APLICAR=false
BACKUP=false
CALIDAD=80
CALIDAD_ALFA=90
DIRECTORIO=""

while [ $# -gt 0 ]; do
  case "$1" in
    --apply)   APLICAR=true; shift ;;
    --backup)  BACKUP=true; shift ;;
    -q)        CALIDAD="$2"; shift 2 ;;
    -h|--help) sed -n '2,30p' "$0" | sed 's/^# \{0,1\}//'; exit 0 ;;
    *)         DIRECTORIO="$1"; shift ;;
  esac
done

if [ -z "$DIRECTORIO" ] || [ ! -d "$DIRECTORIO" ]; then
  echo "Uso: $0 [--apply] [--backup] [-q 80] <directorio>" >&2
  exit 1
fi

for herramienta in cwebp dwebp webpmux webpinfo; do
  command -v "$herramienta" >/dev/null 2>&1 || {
    echo "Falta '$herramienta'. Instala libwebp (brew install webp / apt install webp)." >&2
    exit 1
  }
done

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

peso() { wc -c < "$1" | tr -d ' '; }

# Quita metadatos en pasadas sucesivas: webpmux solo acepta un -strip
# por invocación. Si un tipo no está presente falla, y se continúa.
quitar_metadatos() {
  origen="$1"; destino="$2"
  cp "$origen" "$TMP/paso.webp"
  for tipo in xmp icc exif; do
    if webpmux -strip "$tipo" "$TMP/paso.webp" -o "$TMP/salida.webp" >/dev/null 2>&1; then
      mv "$TMP/salida.webp" "$TMP/paso.webp"
    fi
  done
  mv "$TMP/paso.webp" "$destino"
}

# Reencoda a modo con pérdida. Pasa por PNG intermedio porque cwebp no
# acepta WebP de entrada; el PNG conserva el canal alfa.
reencodar() {
  origen="$1"; destino="$2"
  dwebp "$origen" -o "$TMP/inter.png" >/dev/null 2>&1 || return 1
  cwebp -q "$CALIDAD" -alpha_q "$CALIDAD_ALFA" -metadata none -quiet \
        "$TMP/inter.png" -o "$destino" >/dev/null 2>&1 || return 1
  rm -f "$TMP/inter.png"
}

total_antes=0
total_despues=0
n_strip=0
n_reenc=0
n_saltados=0

printf '%s\n' "─────────────────────────────────────────────────────────────────"
if $APLICAR; then
  printf '  APLICANDO cambios en: %s   (calidad %s)\n' "$DIRECTORIO" "$CALIDAD"
else
  printf '  SIMULACIÓN (no se modifica nada) en: %s\n' "$DIRECTORIO"
fi
printf '%s\n\n' "─────────────────────────────────────────────────────────────────"

while IFS= read -r -d '' fichero; do
  antes=$(peso "$fichero")

  if webpinfo "$fichero" 2>/dev/null | grep -q 'Format: Lossless'; then
    accion="reencodar"
    reencodar "$fichero" "$TMP/nuevo.webp" || { n_saltados=$((n_saltados+1)); continue; }
  else
    accion="metadatos"
    quitar_metadatos "$fichero" "$TMP/nuevo.webp" || { n_saltados=$((n_saltados+1)); continue; }
  fi

  # Verificación: si el resultado no es un WebP válido, no se toca nada.
  if ! webpinfo "$TMP/nuevo.webp" 2>/dev/null | grep -q 'No error detected'; then
    printf '  ⚠  %s → salida inválida, se deja como está\n' "${fichero#$DIRECTORIO/}"
    n_saltados=$((n_saltados+1)); continue
  fi

  despues=$(peso "$TMP/nuevo.webp")

  # Nunca empeorar: si no encoge al menos 1 KB, se deja el original.
  if [ "$despues" -ge "$((antes - 1024))" ]; then
    n_saltados=$((n_saltados+1))
    continue
  fi

  total_antes=$((total_antes + antes))
  total_despues=$((total_despues + despues))
  [ "$accion" = "reencodar" ] && n_reenc=$((n_reenc+1)) || n_strip=$((n_strip+1))

  printf '  %-9s %6s KB → %6s KB  %s\n' \
    "$accion" \
    "$((antes/1024))" "$((despues/1024))" \
    "${fichero#$DIRECTORIO/}"

  if $APLICAR; then
    $BACKUP && cp "$fichero" "$fichero.bak"
    # mv dentro del mismo sistema de ficheros es atómico: o está el
    # fichero viejo o el nuevo, nunca uno a medias.
    cp "$TMP/nuevo.webp" "$fichero.tmp" && mv "$fichero.tmp" "$fichero"
  fi
done < <(find "$DIRECTORIO" -type f -iname '*.webp' ! -iname '*.bak' -print0)

echo
printf '%s\n' "─────────────────────────────────────────────────────────────────"
printf '  metadatos quitados : %d ficheros\n' "$n_strip"
printf '  reencodados        : %d ficheros\n' "$n_reenc"
printf '  sin cambios        : %d ficheros\n' "$n_saltados"
if [ "$total_antes" -gt 0 ]; then
  printf '  peso               : %d KB → %d KB\n' "$((total_antes/1024))" "$((total_despues/1024))"
  printf '  ahorro             : %d KB (%d%%)\n' \
    "$(((total_antes-total_despues)/1024))" \
    "$(((total_antes-total_despues)*100/total_antes))"
fi
printf '%s\n' "─────────────────────────────────────────────────────────────────"

# Los PNG y JPEG no se tocan: convertirlos a .webp cambiaría el nombre
# del fichero y WordPress seguiría pidiendo el antiguo. Se listan para
# tratarlos aparte (reemplazando el medio desde el panel, o con un
# plugin que reescriba las URLs).
pesados=$(find "$DIRECTORIO" -type f \( -iname '*.png' -o -iname '*.jpg' -o -iname '*.jpeg' \) -size +100k 2>/dev/null | wc -l | tr -d ' ')
if [ "$pesados" -gt 0 ]; then
  echo
  printf '  Además hay %s PNG/JPEG de más de 100 KB.\n' "$pesados"
  printf '  No se tocan: renombrarlos a .webp rompería las URLs que\n'
  printf '  WordPress tiene guardadas. Hay que reemplazar el medio o\n'
  printf '  usar un plugin que reescriba las peticiones.\n'
  find "$DIRECTORIO" -type f \( -iname '*.png' -o -iname '*.jpg' -o -iname '*.jpeg' \) -size +100k 2>/dev/null \
    | head -10 | while IFS= read -r f; do
        printf '    %6s KB  %s\n' "$(( $(peso "$f") / 1024 ))" "${f#$DIRECTORIO/}"
      done
fi

if ! $APLICAR; then
  echo
  printf '  Simulación. Para aplicarlo de verdad:  %s --apply %s\n' "$0" "$DIRECTORIO"
fi
