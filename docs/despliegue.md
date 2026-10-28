# Cómo se despliega Aguafy

Esta guía explica, paso a paso, cómo subir cambios a los dos sitios del
proyecto y cómo comprobar que han llegado bien. Está escrita para consultarla
cuando algo no se ve, o cuando hace tiempo que no despliegas.

## 1. Las piezas

Hay dos programas distintos, cada uno con su repositorio:

| Qué es | Repositorio | Dónde está en tu ordenador | Dónde se publica |
|---|---|---|---|
| La tienda que ve el cliente (Next.js) | `reactafy` | `~/reactafy` (la aplicación está en la carpeta `nextjs/`) | Hostinger, en `aguafy.space` |
| El backend (WordPress + plugin propio) | `aguafy-core` | `~/aguafy-core` | `staging.aguafy.com` |

La tienda de Next no guarda datos: se los pide a WordPress. Por eso un cambio
puede estar en uno, en el otro, o en los dos.

## 2. La regla que más se olvida

Para publicar algo hay que **guardarlo en Git (commit)** y **subirlo (push)**.
Los cambios sin guardar en Git no viajan a ningún sitio.

Esto nos pasó con `deploy.sh`: lanzamos el despliegue con el cambio sin
guardar, y no se subió nada. `git add` solo no basta: hace falta `git commit`.

## 3. Desplegar la tienda (Next, en `aguafy.space`)

Hostinger vigila la rama **`main`** de GitHub. Cuando subes algo a `main`, lo
construye y lo publica solo.

```bash
cd ~/reactafy
git status                      # mira qué has cambiado
git add nextjs/app/lo-que-sea.tsx
git commit -m "Qué cambia y por qué"
git push origin main
```

Tarda uno o dos minutos. Mientras construye, el sitio sigue sirviendo la
versión anterior: no se corta.

Si el panel de Hostinger apuntara a otra rama, no se despliega nada nuevo y
no da ningún aviso. Pasó el 26 de octubre de 2026: estaba en una rama que ya
habíamos borrado y se quedó sirviendo código viejo sin queja. La rama correcta
es `main`.

## 4. Desplegar WordPress (el plugin `aguafy-core`)

```bash
cd ~/aguafy-core
git status
git add includes/backend/API/lo-que-sea.php
git commit -m "Qué cambia y por qué"
./deploy.sh
```

El script `deploy.sh` hace tres cosas: sube los commits a GitHub (`git push`),
entra por SSH a staging (con el alias `aguafy`) y trae los cambios allí
(`git pull`), y vacía la caché de LiteSpeed. Solo despliega lo que está
guardado en un commit.

Ahora mismo solo despliega a **staging**. Producción (`aguafy.com`) todavía no
tiene este plugin (ver la sección 9).

## 5. Si un cambio toca los dos lados: el orden

La regla es: **primero lo que recibe, después lo que pide o envía**.

- Un endpoint nuevo en WordPress que Next va a leer (por ejemplo
  `/categories`): primero WordPress, después Next. Si fuera al revés, Next
  pediría algo que todavía no existe y el sitemap fallaría.
- Un aviso nuevo de WordPress hacia Next (por ejemplo una etiqueta de caché
  nueva): primero Next, después WordPress. Si no, WordPress avisaría a algo
  que todavía no sabe responder.

## 6. Variables y secretos

### En Next (panel de Hostinger)

Las tres variables que lee la tienda están en la plantilla
`hostinger.env.example`:

- `NEXT_PUBLIC_WP_URL`: dónde está WordPress (hoy `https://staging.aguafy.com`).
- `NEXT_PUBLIC_SITE_URL`: la dirección pública de esta tienda. **Ojo:** solo
  cuando vale exactamente `https://aguafy.com` el sitio se deja indexar por
  Google. Con cualquier otro valor (como `https://aguafy.space`) lleva
  `noindex` y un `robots.txt` que prohíbe todo.
- `WP_SECRET`: el secreto compartido con WordPress. Nunca va al navegador.

Las dos que empiezan por `NEXT_PUBLIC_` se graban al construir. Si cambias
una, hay que volver a desplegar para que surta efecto.

El fichero `hostinger.env` de tu ordenador es solo tu copia de referencia de
lo que has puesto en el panel. Git lo ignora a propósito: tiene valores reales
y no debe subirse nunca.

### En WordPress (`wp-config.php` de staging)

El plugin espera encontrar tres constantes:

- `REACTAFY_SERVER_SECRET`: debe valer **lo mismo** que `WP_SECRET` de Next.
- `REACTAFY_NEXT_URL`: la dirección de la tienda, sin barra al final
  (`https://aguafy.space`). Sin ella, los avisos de caché no se envían.
- `JWT_AUTH_SECRET_KEY`: la clave del plugin de inicio de sesión (JWT).

### Cambiar un secreto

Un secreto vive en **cuatro sitios** y los cuatro deben coincidir:

1. `wp-config.php` de staging (`REACTAFY_SERVER_SECRET`).
2. El panel de Hostinger (`WP_SECRET`), y volver a desplegar.
3. `nextjs/.env.local` (tu entorno de pruebas).
4. `hostinger.env` (tu copia de referencia).

Genéralo con `openssl rand -hex 32`. No lo pegues en chats, commits ni
capturas: si se ha visto, hay que cambiarlo.

## 7. La caché: cuándo se renueva

Next guarda en memoria los datos de WordPress para no pedirlos cada vez. Cada
dato lleva una etiqueta:

- `catalogo`: productos, marcas y categorías (y el sitemap, que se construye
  con ellos).
- `precios`: precios de invitado.
- `tienda`: ajustes de la tienda (teléfono, pedido mínimo…).

Un día es el máximo que algo puede quedarse viejo. Pero normalmente se renueva
al momento, porque WordPress avisa a Next (`/api/revalidate/`) cuando guardas
o borras un producto, cuando cambia el estado de stock, cuando tocas una
categoría o marca, o cuando cambias un ajuste de la tienda.

**Lo que no avisa solo:** las reglas de descuento del plugin ADP. Para eso, y
**después de desplegar un cambio en la API de WordPress** (como pasó con los
nombres de los Heinz), pulsa **«Vaciar caché de la web»** en la barra negra de
WordPress. Es el botón que fuerza el aviso de las tres etiquetas.

## 8. Cómo comprobar que ha ido bien

Después de desplegar la tienda:

```bash
# ¿Responde el aviso de caché? Debe dar 401 (sin secreto, rechaza)
curl -s -o /dev/null -w "%{http_code}\n" -X POST https://aguafy.space/api/revalidate/

# ¿Cuántas direcciones tiene el sitemap?
curl -s https://aguafy.space/sitemap.xml | grep -c "<loc>"

# En aguafy.space debe prohibir todo (es lo normal mientras no sea aguafy.com)
curl -s https://aguafy.space/robots.txt
```

Después de desplegar WordPress:

```bash
# Lista las rutas que ofrece la API (en staging son unas 23)
curl -s https://staging.aguafy.com/wp-json/reactafy/v1 | python3 -c "import sys,json; print(len(json.load(sys.stdin)['routes']))"

# ¿El total de productos coincide con los que se entregan? (las dos cifras deben ser iguales)
for p in 1 2; do curl -s "https://staging.aguafy.com/wp-json/reactafy/v1/products?page=$p&perPage=100"; echo; done | python3 -c "import sys,json; r=[json.loads(l) for l in sys.stdin if l.strip()]; print('declara', r[0]['pagination']['total'], '· entrega', sum(len(d['products']) for d in r))"
```

## 9. Cuando algo falla (cosas que ya nos han pasado)

**«He subido el cambio y no se ve en aguafy.space».** Comprueba, por este
orden: ¿hiciste `git push`?; ¿el panel de Hostinger apunta a `main`?; ¿han
pasado dos minutos?; y si el cambio es de datos, ¿vaciaste la caché?

**«`./deploy.sh` no ha desplegado nada».** Casi seguro faltó el `git commit`.
El script solo sube lo que está guardado.

**Los avisos de caché fallan.** Se ve en el registro de errores de WordPress,
con una línea `reactafy_cache_send: …` y un número:
- `404`: Next todavía no tiene la versión con `/api/revalidate/`.
- `401`: los secretos de WordPress y de Next no coinciden.
- `400`: WordPress envió una etiqueta que Next no conoce (revisa cómo está
  escrita en `cache.php` y en `nextjs/services/wpCache.ts`).

**Apareció un `package.json` suelto en la raíz de `reactafy`.** Ocurre si
ejecutas `npm install` fuera de `nextjs/`. Todos los comandos de `npm` van
dentro de `nextjs/`.

**Probar el build mientras `npm run dev` está abierto.** `npm run build`
borra la carpeta `.next` que usa el servidor de pruebas. Si hace falta
construir, hazlo en una copia del proyecto.

## 10. Lo que todavía no está hecho (antes de lanzar aguafy.com)

- **Producción no tiene `aguafy-core`.** `aguafy.com` solo ofrece 3 rutas de la
  API (las del snippet antiguo); staging ofrece más de 20. Hay que desplegar el
  plugin allí, y `deploy.sh` hoy solo apunta a staging.
- **`aguafy.space` está escrito a mano** en el plugin:
  `includes/backend/API/environment.php`, función `GetReactafyBaseUrl()`. De
  ahí sale la dirección a la que se devuelve al cliente tras pagar. Debería
  leer `REACTAFY_NEXT_URL`, igual que ya hace `cache.php`.
- **Variables de producción:** `NEXT_PUBLIC_WP_URL` apuntando al WordPress de
  producción y `NEXT_PUBLIC_SITE_URL=https://aguafy.com`.
- **Decidir cómo se reparten los dominios** (qué sitio ocupa `aguafy.com` y
  dónde queda WordPress).
- **Redirecciones de las URLs antiguas** de WordPress a las de Next: sin
  comprobar.
- **Productos que fallan sin darse cuenta:** en producción 42 variaciones
  Heinz no tienen el campo `nombre_de_producto`. El respaldo (usar el nombre
  del producto padre) ya está escrito, pero llega a producción solo cuando se
  despliegue `aguafy-core` allí.
