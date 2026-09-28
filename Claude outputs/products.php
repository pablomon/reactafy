<?php

/**
 * ============================================================
 * REACTAFY - PRODUCTS API
 * ============================================================
 *
 * Las variaciones de WooCommerce se representan como Products
 * independientes para Reactafy.
 */


/**
 * ============================================================
 * 1. INICIALIZAR CONTEXTO WOOCOMMERCE
 * ============================================================
 *
 * Necesario para que ADP pueda identificar correctamente
 * al usuario autenticado y calcular sus precios.
 */
function reactafy_initialize_customer_context() {

    $user_id = get_current_user_id();

    if (!$user_id) {
        return;
    }

    if (!WC()->session) {
        WC()->initialize_session();
    }

    if (!WC()->customer) {
        WC()->customer = new WC_Customer($user_id);
    }
}


/**
 * ============================================================
 * 2. OBTENER TÉRMINOS DE UNA TAXONOMÍA
 * ============================================================
 */

function reactafy_get_terms($product_id, $taxonomy) {

    $terms = get_the_terms(
        $product_id,
        $taxonomy
    );

    if (!$terms || is_wp_error($terms)) {
        return [];
    }

    $result = [];

    foreach ($terms as $term) {

        $result[] = [
            'id'        => (int) $term->term_id,
            'slug'      => $term->slug,
            'name'      => $term->name,
            'parentId' => (int) $term->parent,
        ];
    }

    return $result;
}


/**
 * ============================================================
 * 3. OBTENER BRAND
 * ============================================================
 */

function reactafy_get_brand($product_id) {

    $brands = get_the_terms(
        $product_id,
        'product_brand'
    );

    if (!$brands || is_wp_error($brands)) {
        return null;
    }

    $brand = $brands[0];

    return [
        'id'   => (int) $brand->term_id,
        'slug' => $brand->slug,
        'name' => $brand->name,
    ];
}


/**
 * ============================================================
 * 4. NORMALIZAR ATRIBUTOS
 * ============================================================
 *
 * WooCommerce:
 *
 * pa_cantidad => 12
 * pa_envase   => tetra-pak
 * pa_volumen  => 500-ml
 *
 * Reactafy:
 *
 * cantidad
 * envase
 * volumen
 *
 * No exponemos el prefijo interno "pa_".
 */

function reactafy_normalize_attributes($product) {

    $attributes = [];

    foreach ($product->get_attributes() as $name => $value) {

        /*
         * Ignorar atributos sin valor.
         */
        if ($value === '' || $value === null) {
            continue;
        }


        /*
         * Slug público del atributo.
         *
         * pa_cantidad -> cantidad
         */
        $attribute_slug = preg_replace(
            '/^pa_/',
            '',
            $name
        );


        /*
         * Nombre legible.
         *
         * pa_volumen -> Volumen
         */
        $attribute_name = wc_attribute_label(
            $name,
            $product
        );


        /*
         * Los atributos taxonómicos de WooCommerce
         * almacenan normalmente el slug del término.
         *
         * Convertimos:
         *
         * tetra-pak -> Tetra pak
         * 500-ml    -> 500 ml
         */
        if (taxonomy_exists($name)) {

            $term = get_term_by(
                'slug',
                $value,
                $name
            );

            if ($term && !is_wp_error($term)) {
                $value = $term->name;
            }
        }


        /*
         * Convertir valores puramente numéricos:
         *
         * "12" -> 12
         * "24" -> 24
         *
         * "500 ml" permanece como string.
         */
        if (is_numeric($value)) {

            $value = strpos($value, '.') !== false
                ? (float) $value
                : (int) $value;
        }


        $attributes[] = [

            'slug' => $attribute_slug,

            'name' => $attribute_name,

            'value' => $value,
        ];
    }


    return $attributes;
}


/**
 * ============================================================
 * 5. OBTENER GRUPO
 * ============================================================
 *
 * Para una variación:
 *
 * variation 780
 *      ↓
 * parent 778
 *      ↓
 * children [779, 780]
 *
 * El propio producto está incluido.
 */

function reactafy_get_product_group($product) {

    $parent_id = $product->get_parent_id();


    if ($parent_id) {

        $group_id = $parent_id;

        $parent = wc_get_product(
            $parent_id
        );

    } else {

        $group_id = $product->get_id();

        $parent = $product;
    }


    if (!$parent) {
        return null;
    }


    $products = [];


    if ($parent->is_type('variable')) {

        foreach (
            $parent->get_children()
            as $child_id
        ) {

            $products[] = (int) $child_id;
        }

    } else {

        $products[] = (int) $product->get_id();
    }


    return [
        'id' => (int) $group_id,
        'slug' => $parent->get_slug(),
        'name' => $parent->get_name(),
        'products' => $products,
    ];
}

/**
 * ============================================================
 * 5b. SLUG DEL PRODUCTO
 * ============================================================
 *
 * Identifica al producto dentro de su grupo a partir de sus
 * atributos, en el orden en que el grupo los define:
 *
 *     cantidad=24, envase=lata, volumen=500-ml → 24-lata-500-ml
 *
 * Es único dentro del grupo: en Woo, cada producto de un grupo
 * (variación) ES su combinación de atributos.
 *
 * null si algún atributo está en "Cualquiera…": ese producto no
 * se puede identificar por su URL.
 */
function reactafy_get_product_slug($product, $group_parent) {

    if (!$product->is_type('variation')) {
        return null;
    }

    $values = $product->get_attributes();
    $parts = [];

    foreach ($group_parent->get_attributes() as $name => $attribute) {

        // Solo los atributos que distinguen productos del grupo
        if (!$attribute->get_variation()) {
            continue;
        }

        $value = $values[$name] ?? '';

        if ($value === '') {
            return null;
        }

        $parts[] = sanitize_title($value);
    }

    return $parts ? implode('-', $parts) : null;
}

/**
 * ============================================================
 * 6. STOCK
 * ============================================================
 */

function reactafy_get_stock($product) {

    $status = $product->get_stock_status();


    switch ($status) {

        case 'instock':

            $status = 'in_stock';

            break;


        case 'outofstock':

            $status = 'out_of_stock';

            break;


        case 'onbackorder':

            $status = 'on_backorder';

            break;


        default:

            $status = 'unknown';
    }


    return [

        'status' => $status,
    ];
}


/**
 * ============================================================
 * 7. PRICING ADP
 * ============================================================
 *
 * price:     precio de 1 caja según ADP (con el rol del usuario).
 * fromPrice: precio del último tramo, si es menor que price
 *            (las tarjetas muestran "Desde X").
 * tiers:     tramos de la regla de volumen, para la tabla de la
 *            ficha. Vacío si el producto no tiene regla o solo
 *            tiene un tramo.
 *            [{ from: 1, to: 5, price }, { from: 6, to: null, price }]
 *
 * Todos los precios salen de getDiscountedProductPrice(): son
 * exactamente los que cobrará el carrito. Las reglas de Aguafy son
 * de precio fijo y siempre empiezan en 1 caja.
 */
function reactafy_get_product_pricing($product) {

    $currency = get_woocommerce_currency();

    $price = adp_functions()->getDiscountedProductPrice($product, 1, true);

    $tiers = [];

    $rules = adp_functions()->getActiveRulesForProduct(
        $product->get_id(),
        1,
        true
    );

    foreach ($rules as $rule) {

        $handler = $rule->getProductRangeAdjustmentHandler();

        if (!$handler) {
            continue;
        }

        $ranges = $handler->getRanges();

        if (!$ranges) {
            continue;
        }

        foreach ($ranges as $range) {

            $from = (int) $range->getFrom();
            $to   = $range->getTo();

            // El último tramo es abierto ("6 o más"): ADP lo guarda
            // vacío o como INF.
            $to = is_numeric($to) && is_finite((float) $to)
                ? (int) $to
                : null;

            $tiers[] = [
                'from'  => $from,
                'to'    => $to,
                'price' => reactafy_money(
                    adp_functions()->getDiscountedProductPrice($product, $from, true),
                    $currency
                ),
            ];
        }

        // Por ahora respetamos la primera regla aplicable.
        break;
    }

    // Un solo tramo no es una tabla.
    if (count($tiers) < 2) {
        $tiers = [];
    }

    // "Desde": el último tramo, solo si es más barato que 1 caja.
    $from_price = null;

    if ($tiers) {
        $last = end($tiers);
        $last_amount = adp_functions()->getDiscountedProductPrice($product, $last['from'], true);

        if ($last_amount < $price) {
            $from_price = reactafy_money($last_amount, $currency);
        }
    }

    return [
        'price'     => reactafy_money($price, $currency),
        'fromPrice' => $from_price,
        'tiers'     => $tiers,
    ];
}


/**
 * ============================================================
 * 8. PRODUCT SUMMARY
 * ============================================================
 *
 * Este es el mapper central.
 *
 * Tanto:
 *
 * GET /products/{id}
 *
 * como:
 *
 * GET /products
 *
 * utilizan esta función.
 */

function reactafy_get_product_summary($product_id) {

    reactafy_initialize_customer_context();

    $product = wc_get_product($product_id);

    if (!$product) {
        return null;
    }

    /*
     * --------------------------------------------------------
     * PADRE / GRUPO
     * --------------------------------------------------------
     */

    $parent_id =
        $product->get_parent_id();

    if ($parent_id) {
        $parent = wc_get_product($parent_id);
    } else {
        $parent = $product;
    }

    if (!$parent) {
        return null;
    }


    /*
     * --------------------------------------------------------
     * ACF
     * --------------------------------------------------------
     */

    $acf = [];

    if (function_exists('get_fields')) {
        $acf =
            get_fields(
                $product->get_id()
            ) ?: [];
    }



    /*
     * --------------------------------------------------------
     * TITLE
     * --------------------------------------------------------
     */

    if (
        !array_key_exists(
            'nombre_de_producto',
            $acf
        )
    ) {
        return new WP_Error(
            'product_missing_title',
            'El producto no tiene nombre_de_producto en ACF.',
            [
                'status' => 500,
                'product_id' =>
                    $product->get_id(),
            ]
        );
    }

    $title =
        $acf['nombre_de_producto'];


    /*
     * --------------------------------------------------------
     * EDITORIAL
     * --------------------------------------------------------
     */

    $editorial = [
        'isFeatured' =>
            !empty($acf['destacado']),

        'isNew' =>
            !empty($acf['producto_nuevo']),

        'isLowStock' =>
            !empty($acf['ultimas_unidades']),
    ];


    /*
     * --------------------------------------------------------
     * IMAGE
     * --------------------------------------------------------
     */

    $image_id =
        $product->get_image_id();

    $image = null;

    if ($image_id) {
        $image =
            wp_get_attachment_image_url(
                $image_id,
                'full'
            );
    }


    /*
     * --------------------------------------------------------
     * ACTIVE
     * --------------------------------------------------------
     */

    $is_active =
        get_post_status(
            $product->get_id()
        ) === 'publish';


    /*
     * --------------------------------------------------------
     * CATEGORIES
     * --------------------------------------------------------
     */


    $categories =
        reactafy_get_terms(
            $parent->get_id(),
            'product_cat'
        );



    /*
     * --------------------------------------------------------
     * TAGS
     * --------------------------------------------------------
     */


    $tags =
        reactafy_get_terms(
            $parent->get_id(),
            'product_tag'
        );



    /*
     * --------------------------------------------------------
     * BRAND
     * --------------------------------------------------------
     */


    $brand =
        reactafy_get_brand(
            $parent->get_id()
        );



    /*
     * --------------------------------------------------------
     * ATTRIBUTES
     * --------------------------------------------------------
     */


    $attributes =
        reactafy_normalize_attributes(
            $product
        );



    /*
     * --------------------------------------------------------
     * STOCK
     * --------------------------------------------------------
     */


    $stock =
        reactafy_get_stock(
            $product
        );



    /*
     * --------------------------------------------------------
     * GROUP
     * --------------------------------------------------------
     */


    $group =
        reactafy_get_product_group(
            $product
        );



    return [

        'id' =>
            (int) $product->get_id(),

        'slug' =>
            reactafy_get_product_slug(
                $product,
                $parent
            ),

        'sku' =>
            $product->get_sku(),

        'title' =>
            $title,

        'image' =>
            $image,

        'isActive' =>
            $is_active,

        'group' =>
            $group,

        'categories' =>
            $categories,

        'brand' =>
            $brand,

        'tags' =>
            $tags,

        'editorial' =>
            $editorial,

        'attributes' =>
            $attributes,

        'stock' =>
            $stock,

    ];
}

/**
 * ============================================================
 * 9. ENDPOINT - PRODUCT PRICING
 * ============================================================
 *
 * GET:
 *
 * /wp-json/reactafy/v1/products/pricing?guest=1&ids=123,456,789
 * /wp-json/reactafy/v1/products/pricing?ids=123,456,789
 *
 * Devuelve únicamente los precios de los productos solicitados.
 *
 * guest=1 → precio de invitado, igual para todos.
 * LiteSpeed lo cachea (Force Cache URIs en el panel). Por eso
 * guest=1 debe ir SIEMPRE como primer parámetro.
 * Se ignora cualquier JWT: si se calculara con el rol del
 * usuario, ese precio quedaría cacheado para todos.
 *
 * Sin guest=1 → precio del usuario autenticado. Nunca se
 * cachea, lo diga o no el panel de LiteSpeed.
 *
 * El cliente no puede elegir el rol que determina el precio:
 * como mucho puede pedir el de invitado.
 */
add_action('rest_api_init', function () {

    register_rest_route(
        'reactafy/v1',
        '/products/pricing',
        [
            'methods' => 'GET',

            'callback' =>
                function (WP_REST_Request $request) {

                    $is_guest =
                        $request->get_param('guest') === '1';

                    if ($is_guest) {

                        wp_set_current_user(0);

                    } else {

                        reactafy_initialize_customer_context();

                        do_action('litespeed_control_set_nocache');
                    }

                    $ids_param =
                        $request->get_param('ids');

                    if (!$ids_param) {
                        return new WP_Error(
                            'missing_product_ids',
                            'Product IDs are required.',
                            ['status' => 400]
                        );
                    }

                    $ids = array_values(
                        array_filter(
                            array_map(
                                'intval',
                                explode(',', $ids_param)
                            ),
                            fn($id) => $id > 0
                        )
                    );

                    $ids = array_values(array_unique($ids));

                    if (!$ids) {
                        return new WP_Error(
                            'invalid_product_ids',
                            'No valid product IDs were provided.',
                            ['status' => 400]
                        );
                    }

                    /*
                     * Limitar el número de productos por petición.
                     */
                    $ids = array_slice($ids, 0, 100);

                    $prices = [];

                    foreach ($ids as $product_id) {

                        $product =
                            wc_get_product($product_id);

                        if (!$product) {
                            continue;
                        }

                        $prices[(string) $product_id] =
                            reactafy_get_product_pricing(
                                $product
                            );
                    }

                    $response =
                        rest_ensure_response($prices);

                    if (!$is_guest) {
                        $response->header(
                            'Cache-Control',
                            'private, no-store'
                        );
                    }

                    return $response;
                },

            /*
             * Público porque también necesitamos precio de guest.
             *
             * Si llega JWT, WordPress ya habrá identificado al usuario
             * antes de ejecutar el callback (salvo con guest=1, que
             * lo descarta).
             */
            'permission_callback' =>
                '__return_true',
        ]
    );

});
/**
 * ============================================================
 * 10. ENDPOINT - PRODUCT INDIVIDUAL
 * ============================================================
 *
 * GET:
 *
 * /wp-json/reactafy/v1/products/{id}
 */

add_action('rest_api_init', function () {

    register_rest_route(
        'reactafy/v1',
        '/products/(?P<id>\d+)',
        [

            'methods' => 'GET',


            'callback' =>
                function (
                    WP_REST_Request $request
                ) {

                    $product_id =
                        (int) $request['id'];


                    $product =
                        reactafy_get_product_summary(
                            $product_id
                        );


                    if (!$product) {

                        return new WP_Error(

                            'product_not_found',

                            'Producto no encontrado.',

                            [
                                'status' => 404,
                            ]
                        );
                    }


                    if (is_wp_error($product)) {
                        return $product;
                    }


                    return $product;
                },


            /*
             * Público.
             *
             * Si llega JWT, WordPress ya habrá
             * identificado al usuario.
             */
            'permission_callback' =>
                '__return_true',
        ]
    );

});




add_action('rest_api_init', function () {

    register_rest_route(
        'reactafy/v1',
        '/products/resolve',
        [
            'methods' => 'GET',
            'callback' => 'reactafy_resolve_product',
            'args' => [
                'group' => [
                    'required' => true,
                    'sanitize_callback' => 'sanitize_title',
                ],
                'product' => [
                    'required' => false,
                    'sanitize_callback' => 'sanitize_title',
                ],
            ],
            'permission_callback' => '__return_true',
        ]
    );
});

/**
 * ============================================================
 * 11. FILTROS DE LA TIENDA (FACETAS)
 * ============================================================
 *
 * Una faceta es una dimensión por la que se puede filtrar el
 * catálogo (Marca, Envase, Volumen…). Nada de esto se configura
 * a mano: las facetas, sus opciones y su orden salen de Woo.
 */


/**
 * Facetas del listado, en el orden en que se muestran.
 * Clave pública (el parámetro de la URL) => definición:
 *
 *   'tipo'           => ['taxonomy' => 'product_cat', 'depth' => 1, 'label' => 'Tipo']
 *   'caracteristica' => ['taxonomy' => 'product_cat', 'depth' => 2, 'label' => 'Características']
 *   'brand'          => ['taxonomy' => 'product_brand']
 *   'envase'         => ['taxonomy' => 'pa_envase']   … (todos los atributos de Woo)
 *
 * Tipo y Características salen del árbol de categorías por NIVEL
 * (0 = Bebidas / Alimentos, 1 = Agua / Cerveza / Vino…,
 *  2 = Gasificada / Natural…): una categoría nueva en Woo aparece
 * sola en su faceta. Sus nombres van aquí porque Woo no tiene dónde
 * guardar el nombre de un nivel del árbol.
 *
 * Un atributo nuevo en Woo se convierte en faceta sin tocar código,
 * salvo los de $hidden (decisión de diseño: no se filtra por ellos).
 * Se saltan nombres que chocarían con otros parámetros del endpoint.
 */
function reactafy_facets() {

    $reserved = ['brand', 'category', 'page', 'perPage', 'orderby', 'tipo', 'caracteristica'];

    $hidden = ['cantidad', 'sabor'];

    $facets = [
        'tipo'           => ['taxonomy' => 'product_cat', 'depth' => 1, 'label' => 'Tipo'],
        'caracteristica' => ['taxonomy' => 'product_cat', 'depth' => 2, 'label' => 'Características'],
        'brand'          => ['taxonomy' => 'product_brand'],
    ];

    foreach (wc_get_attribute_taxonomies() as $attribute) {

        $name = $attribute->attribute_name;

        if (in_array($name, $reserved, true) || in_array($name, $hidden, true)) {
            continue;
        }

        $facets[$name] = ['taxonomy' => 'pa_' . $name];
    }

    return $facets;
}


/**
 * Texto con entidades HTML (WordPress guarda "&" como "&amp;")
 * → texto normal.
 */
function reactafy_decode($text) {
    return html_entity_decode($text, ENT_QUOTES | ENT_HTML5, 'UTF-8');
}


/**
 * Nombre visible de una faceta: "Envase", "Marca"…
 */
function reactafy_facet_label($taxonomy) {

    if (strpos($taxonomy, 'pa_') === 0) {
        return reactafy_decode(wc_attribute_label($taxonomy));
    }

    $tax = get_taxonomy($taxonomy);

    return $tax ? reactafy_decode($tax->labels->singular_name) : $taxonomy;
}


/**
 * Índice ligero de todos los productos publicados, con lo justo
 * para filtrar, contar y ordenar:
 *
 *   ['id' => 780, 'price' => 540.0, 'categories' => [17, 21],
 *    'brand' => ['perrier'], 'envase' => ['vidrio'], 'volumen' => ['330-ml'], …]
 *
 * Marca y categorías están en el GRUPO. Un atributo puede estar en
 * el producto (si distingue productos del grupo) o solo en el grupo:
 * manda el del producto y, si no tiene, el del grupo.
 */
function reactafy_get_filter_index() {

    $facets = reactafy_facets();

    // Facetas de taxonomía (marca, atributos) y de nivel de categoría
    $term_facets = array_filter($facets, fn($facet) => !isset($facet['depth']));
    $level_facets = array_filter($facets, fn($facet) => isset($facet['depth']));

    $group_ids = get_posts([
        'post_type'      => 'product',
        'post_status'    => 'publish',
        'fields'         => 'ids',
        'posts_per_page' => -1,
        'no_found_rows'  => true,
    ]);

    if (!$group_ids) {
        return [];
    }

    /*
     * Posts completos (no solo ids) para tener post_parent.
     * update_post_meta_cache (true por defecto) carga la meta de
     * todos en UNA consulta: precio y attribute_pa_… salen de caché.
     */
    $variations = get_posts([
        'post_type'              => 'product_variation',
        'post_status'            => 'publish',
        'post_parent__in'        => $group_ids,
        'posts_per_page'         => -1,
        'orderby'                => 'ID',
        'order'                  => 'ASC',
        'no_found_rows'          => true,
        'update_post_term_cache' => false,
    ]);

    // Términos de todos los grupos (categorías + facetas) en UNA consulta
    $terms = wp_get_object_terms(
        $group_ids,
        array_values(array_unique(array_merge(
            ['product_cat'],
            array_column($term_facets, 'taxonomy')
        ))),
        ['fields' => 'all_with_object_id']
    );

    $facet_of = []; // 'pa_envase' => 'envase'
    foreach ($term_facets as $key => $facet) {
        $facet_of[$facet['taxonomy']] = $key;
    }

    $groups = [];

    if (!is_wp_error($terms)) {
        foreach ($terms as $term) {

            if ($term->taxonomy === 'product_cat') {
                $groups[$term->object_id]['categories'][] = (int) $term->term_id;
            } elseif (isset($facet_of[$term->taxonomy])) {
                $groups[$term->object_id][$facet_of[$term->taxonomy]][] = $term->slug;
            }
        }
    }

    /*
     * Árbol de categorías en UNA consulta, para saber de cada categoría
     * sus antepasados: Gasificada → [Bebidas, Agua, Gasificada]. La
     * posición en esa ruta es su nivel (0, 1, 2…).
     */
    $all_cats = get_terms(['taxonomy' => 'product_cat', 'hide_empty' => false]);

    $parent_of = [];
    $slug_of = [];

    if (!is_wp_error($all_cats)) {
        foreach ($all_cats as $cat) {
            $parent_of[(int) $cat->term_id] = (int) $cat->parent;
            $slug_of[(int) $cat->term_id] = $cat->slug;
        }
    }

    $paths = [];

    $path_of = function ($id) use (&$paths, $parent_of) {

        if (!isset($paths[$id])) {

            $path = [];
            $current = $id;

            // Límite de 10 niveles: por si un árbol mal formado hiciera un bucle
            while ($current && isset($parent_of[$current]) && count($path) < 10) {
                array_unshift($path, $current);
                $current = $parent_of[$current];
            }

            $paths[$id] = $path;
        }

        return $paths[$id];
    };

    // Valores de Tipo / Características de un grupo: la categoría de ese
    // nivel en la ruta de cada una de sus categorías (Gasificada → Agua)
    $levels_of = function ($categories) use ($level_facets, $path_of, $slug_of) {

        $values = [];

        foreach ($level_facets as $key => $facet) {

            $slugs = [];

            foreach ($categories as $cat_id) {
                $path = $path_of($cat_id);

                if (isset($path[$facet['depth']])) {
                    $slugs[] = $slug_of[$path[$facet['depth']]];
                }
            }

            $values[$key] = array_values(array_unique($slugs));
        }

        return $values;
    };

    $items = [];

    foreach ($variations as $variation) {

        $group = $groups[$variation->post_parent] ?? [];
        $categories = $group['categories'] ?? [];

        $item = [
            'id'         => (int) $variation->ID,
            'price'      => (float) get_post_meta($variation->ID, '_price', true),
            'categories' => $categories,
        ];

        $item += $levels_of($categories);

        foreach ($term_facets as $key => $facet) {

            $item[$key] = $group[$key] ?? [];

            if (strpos($facet['taxonomy'], 'pa_') === 0) {
                $own = get_post_meta($variation->ID, 'attribute_' . $facet['taxonomy'], true);
                if ($own !== '') {
                    $item[$key] = [$own];
                }
            }
        }

        $items[] = $item;
    }

    return $items;
}


/**
 * Categoría pedida y todas sus descendientes.
 *
 *   ''        → null  (toda la tienda)
 *   'bebidas' → ['term' => WP_Term, 'ids' => [229, 17, 21, 22, 23, …]]
 *   no existe → false
 */
function reactafy_category_scope($slug) {

    if ($slug === '') {
        return null;
    }

    $term = get_term_by('slug', $slug, 'product_cat');

    if (!$term) {
        return false;
    }

    $children = get_term_children($term->term_id, 'product_cat');

    if (is_wp_error($children)) {
        $children = [];
    }

    return [
        'term' => $term,
        'ids'  => array_merge([(int) $term->term_id], array_map('intval', $children)),
    ];
}


/**
 * Filtros pedidos:  ?brand=heineken,tecate&envase=lata
 * → ['brand' => ['heineken', 'tecate'], 'envase' => ['lata'], 'volumen' => [], …]
 */
function reactafy_parse_filters(WP_REST_Request $request) {

    $filters = [];

    foreach (array_keys(reactafy_facets()) as $facet) {

        $raw = (string) $request->get_param($facet);

        $filters[$facet] = array_values(array_filter(
            array_map('sanitize_title', explode(',', $raw))
        ));
    }

    return $filters;
}


/**
 * ¿Pasa el producto los filtros?
 * Dentro de una faceta: O. Entre facetas: Y.
 * $skip ignora una faceta (para los conteos disyuntivos).
 */
function reactafy_item_matches($item, $filters, $skip = null) {

    foreach ($filters as $facet => $wanted) {

        if ($facet === $skip || !$wanted) {
            continue;
        }

        if (!array_intersect($item[$facet], $wanted)) {
            return false;
        }
    }

    return true;
}


/**
 * Facetas de la categoría actual, con el conteo de cada opción.
 *
 * $items son los productos de la categoría (sin aplicar filtros).
 *
 * - Una faceta aparece si tiene al menos 2 opciones en esta
 *   categoría, o si tiene algo marcado (para poder desmarcarlo).
 * - Conteo disyuntivo: al contar una faceta se aplican todos los
 *   filtros MENOS el suyo. count 0 = se pinta desactivada.
 * - Orden: el de Woo (menu_order) en atributos; marcas por nombre.
 */
function reactafy_get_facets($items, $filters) {

    $result = [];

    foreach (reactafy_facets() as $facet => $definition) {

        $counts = [];

        foreach ($items as $item) {

            $matches = reactafy_item_matches($item, $filters, $facet);

            foreach ($item[$facet] as $slug) {
                $counts[$slug] = ($counts[$slug] ?? 0) + ($matches ? 1 : 0);
            }
        }

        if (count($counts) < 2 && empty($filters[$facet])) {
            continue;
        }

        $args = [
            'taxonomy'   => $definition['taxonomy'],
            'slug'       => array_map('strval', array_keys($counts)),
            'hide_empty' => false,
        ];

        if ($facet === 'brand') {
            $args['orderby'] = 'name';
        }

        if ($definition['taxonomy'] === 'product_cat') {
            // El orden de categorías que pones arrastrando en Woo
            $args['menu_order'] = 'ASC';
        }

        $terms = get_terms($args);

        if (is_wp_error($terms) || !$terms) {
            continue;
        }

        $options = [];

        foreach ($terms as $term) {
            $options[] = [
                'slug'  => $term->slug,
                'name'  => reactafy_decode($term->name),
                'count' => $counts[$term->slug] ?? 0,
            ];
        }

        $result[] = [
            'slug'    => $facet,
            'name'    => $definition['label'] ?? reactafy_facet_label($definition['taxonomy']),
            'options' => $options,
        ];
    }

    return $result;
}


/**
 * Subcategorías (hijas directas) de la categoría actual, para los
 * chips de navegación. En /tienda/ son las de primer nivel.
 *
 * Solo las que tienen productos publicados: una categoría vacía
 * (Alimentos hoy) aparece sola cuando tenga algo.
 * count = productos de esa subcategoría que pasan los filtros.
 */
function reactafy_get_subcategories($parent_id, $items, $filters) {

    $children = get_terms([
        'taxonomy'   => 'product_cat',
        'parent'     => $parent_id,
        'hide_empty' => false,
    ]);

    if (is_wp_error($children)) {
        return [];
    }

    $result = [];

    foreach ($children as $child) {

        $descendants = get_term_children($child->term_id, 'product_cat');

        $ids = array_merge(
            [(int) $child->term_id],
            is_wp_error($descendants) ? [] : array_map('intval', $descendants)
        );

        $in_child = array_filter(
            $items,
            fn($item) => (bool) array_intersect($item['categories'], $ids)
        );

        if (!$in_child) {
            continue;
        }

        $result[] = [
            'slug'  => $child->slug,
            'name'  => reactafy_decode($child->name),
            'count' => count(array_filter(
                $in_child,
                fn($item) => reactafy_item_matches($item, $filters)
            )),
        ];
    }

    return $result;
}


/**
 * ============================================================
 * 11b. ENDPOINT - LISTADO DE PRODUCTOS
 * ============================================================
 *
 * GET /wp-json/reactafy/v1/products
 *     ?page=1&perPage=20
 *     &category=bebidas                (incluye sus subcategorías)
 *     &brand=heineken,tecate&envase=lata&volumen=355-ml
 *     &orderby=price | price-desc
 *
 * Devuelve: products, pagination, facets, subcategories.
 */
add_action('rest_api_init', function () {

    register_rest_route(
        'reactafy/v1',
        '/products',
        [
            'methods' => 'GET',

            'callback' => function (WP_REST_Request $request) {

                $page = max(1, (int) $request->get_param('page'));

                $per_page = (int) $request->get_param('perPage');
                if ($per_page <= 0) {
                    $per_page = 24;
                }
                $per_page = min($per_page, 100);

                /*
                 * Categoría
                 */
                $scope = reactafy_category_scope(
                    sanitize_title((string) $request->get_param('category'))
                );

                if ($scope === false) {
                    return new WP_Error(
                        'category_not_found',
                        'Categoría no encontrada.',
                        ['status' => 404]
                    );
                }

                $index = reactafy_get_filter_index();

                $in_category = $scope
                    ? array_values(array_filter(
                        $index,
                        fn($item) => (bool) array_intersect($item['categories'], $scope['ids'])
                    ))
                    : $index;

                /*
                 * Filtros
                 */
                $filters = reactafy_parse_filters($request);

                $matching = array_values(array_filter(
                    $in_category,
                    fn($item) => reactafy_item_matches($item, $filters)
                ));

                /*
                 * Orden. usort es estable en PHP 8: a igual precio
                 * se mantiene el orden por ID.
                 */
                $orderby = $request->get_param('orderby');

                if ($orderby === 'price') {
                    usort($matching, fn($a, $b) => $a['price'] <=> $b['price']);
                } elseif ($orderby === 'price-desc') {
                    usort($matching, fn($a, $b) => $b['price'] <=> $a['price']);
                }

                /*
                 * Página
                 */
                $total = count($matching);

                $page_items = array_slice(
                    $matching,
                    ($page - 1) * $per_page,
                    $per_page
                );

                // Solo ahora, y solo para esta página, el summary completo
                $products = [];

                foreach ($page_items as $item) {

                    $product = reactafy_get_product_summary($item['id']);

                    if (!$product || is_wp_error($product)) {
                        continue;
                    }

                    $products[] = $product;
                }

                return [
                    'products'      => $products,
                    'pagination'    => [
                        'page'       => $page,
                        'perPage'    => $per_page,
                        'total'      => $total,
                        'totalPages' => (int) ceil($total / $per_page),
                    ],
                    'facets'        => reactafy_get_facets($in_category, $filters),
                    'subcategories' => reactafy_get_subcategories(
                        $scope ? $scope['term']->term_id : 0,
                        $in_category,
                        $filters
                    ),
                ];
            },

            'permission_callback' => '__return_true',
        ]
    );

});


/**
 * ============================================================
 * 12a. FICHA DE PRODUCTO: DATOS EXTRA
 * ============================================================
 *
 * Solo los usa /products/resolve (la ficha). El listado de la
 * tienda no los necesita y así no se hace más pesado.
 */


/**
 * Producto por defecto de un grupo: el que Woo muestra sin
 * parámetros (atributos por defecto) o, si no hay, el primero
 * publicado. 0 si el grupo no tiene ninguno publicado.
 */
function reactafy_get_default_product_id($group_parent) {

    $defaults = [];

    foreach ($group_parent->get_default_attributes() as $name => $value) {
        $defaults['attribute_' . $name] = $value;
    }

    if ($defaults) {
        $product_id = WC_Data_Store::load('product')->find_matching_product_variation(
            $group_parent,
            $defaults
        );

        if ($product_id && get_post_status($product_id) === 'publish') {
            return (int) $product_id;
        }
    }

    foreach ($group_parent->get_children() as $child_id) {
        if (get_post_status($child_id) === 'publish') {
            return (int) $child_id;
        }
    }

    return 0;
}


/**
 * Los productos del grupo, para los selectores de la ficha
 * ("Elige tu tamaño: 330 ml · 500 ml"). Ligero: sin ACF ni precio.
 *
 *   [['id' => 15578, 'slug' => '24-lata-330-ml',
 *     'attributes' => [...], 'stock' => ['status' => 'in_stock']], …]
 *
 * Se saltan los no publicados y los que no tienen URL propia.
 */
function reactafy_get_group_products($group_parent) {

    $items = [];

    foreach ($group_parent->get_children() as $child_id) {

        $child = wc_get_product($child_id);

        if (!$child || $child->get_status() !== 'publish') {
            continue;
        }

        $slug = reactafy_get_product_slug($child, $group_parent);

        if ($slug === null) {
            continue;
        }

        $items[] = [
            'id'         => (int) $child_id,
            'slug'       => $slug,
            'attributes' => reactafy_normalize_attributes($child),
            'stock'      => reactafy_get_stock($child),
        ];
    }

    return $items;
}


/**
 * "Te puede interesar": los upsells.
 *
 * Primero los asignados a ESTE producto (meta de la variación,
 * snippet "Variation Related Products"); si no tiene, los del
 * grupo (upsells normales de Woo).
 *
 * Cada id puede ser un producto concreto (variación: se usa tal
 * cual) o un grupo (producto variable: se usa su producto por
 * defecto). Devuelve summaries, como las tarjetas de la tienda.
 */
function reactafy_get_upsells($product_id, $group_parent, $limit = 12) {

    $ids = get_post_meta($product_id, '_upsell_variation_products', true);

    if (empty($ids)) {
        $ids = $group_parent->get_upsell_ids();
    }

    $result = [];
    $seen = [(int) $product_id => true];

    foreach ((array) $ids as $id) {

        $item = wc_get_product((int) $id);

        if (!$item || $item->get_status() !== 'publish') {
            continue;
        }

        if ($item->is_type('variable')) {
            $id = reactafy_get_default_product_id($item);
        } elseif ($item->is_type('variation')) {
            // Su grupo también tiene que estar publicado
            if (get_post_status($item->get_parent_id()) !== 'publish') {
                continue;
            }
            $id = $item->get_id();
        } else {
            continue;
        }

        if (!$id || isset($seen[$id])) {
            continue;
        }

        $summary = reactafy_get_product_summary($id);

        if (!$summary || is_wp_error($summary)) {
            continue;
        }

        $seen[$id] = true;
        $result[] = $summary;

        if (count($result) >= $limit) {
            break;
        }
    }

    return $result;
}


/**
 * Descripción de la ficha: la del producto concreto y, si está
 * vacía, la del grupo. HTML limpio (solo etiquetas seguras) y con
 * párrafos (wpautop convierte los saltos de línea en <p>).
 */
function reactafy_get_product_description($product, $group_parent) {

    $text = $product->get_description();

    if (trim(wp_strip_all_tags($text)) === '') {
        $text = $group_parent->get_description();
    }

    return trim($text) !== '' ? wpautop(wp_kses_post($text)) : '';
}


/**
 * ============================================================
 * 12. ENDPOINT - RESOLVER PRODUCTO POR URL
 * ============================================================
 *
 * GET /wp-json/reactafy/v1/products/resolve?group=estrella-galicia-lata&product=24-lata-500-ml
 *
 * Traduce una URL de la tienda (/producto/{grupo}/{producto}/) al
 * producto que le corresponde. Devuelve SIEMPRE un producto del grupo
 * (el mismo summary que /products/{id}, más los datos de la ficha).
 * Lo busca por este orden:
 *
 *   1. El producto cuyo slug coincide con `product` (URL limpia).
 *   2. El que encaja con parámetros antiguos ?attribute_pa_…=…
 *      (URLs de la web actual en Google, WhatsApp, correos…).
 *   3. El producto por defecto del grupo (el que Woo muestra
 *      sin parámetros).
 *   4. El primer producto publicado del grupo.
 *
 * Si el producto devuelto no es el pedido, Next redirige (301) a su
 * URL limpia. Así, toda la lógica de "a qué URL corresponde esto"
 * vive aquí.
 *
 * Además del summary devuelve: seo, description, groupProducts,
 * upsells y brand.description.
 *
 * Nota: en Woo, el grupo es un producto variable y cada producto
 * del grupo es una de sus variaciones. "Variación" es un término
 * interno de Woo y no forma parte del contrato de la API.
 */

function reactafy_resolve_product(WP_REST_Request $request) {

    $not_found = new WP_Error(
        'product_not_found',
        'Producto no encontrado.',
        ['status' => 404]
    );

    // El grupo es el producto padre (variable) de Woo
    $post = get_page_by_path($request['group'], OBJECT, 'product');

    if (!$post || $post->post_status !== 'publish') {
        return $not_found;
    }

    $group_parent = wc_get_product($post->ID);

    if (!$group_parent || !$group_parent->is_type('variable')) {
        return $not_found;
    }

    $data_store = WC_Data_Store::load('product');
    $product_id = 0;

    // 1. URL limpia
    $wanted = $request['product'];

    if ($wanted) {
        foreach ($group_parent->get_children() as $child_id) {

            $child = wc_get_product($child_id);

            if (
                $child
                && $child->get_status() === 'publish'
                && reactafy_get_product_slug($child, $group_parent) === $wanted
            ) {
                $product_id = $child_id;
                break;
            }
        }
    }

    // 2. URL antigua: Woo busca la variación que encaja con los atributos
    if (!$product_id) {

        $legacy = [];

        foreach ($request->get_query_params() as $key => $value) {
            if (strpos($key, 'attribute_') === 0) {
                $legacy[sanitize_title($key)] = sanitize_title($value);
            }
        }

        if ($legacy) {
            $product_id = $data_store->find_matching_product_variation(
                $group_parent,
                $legacy
            );
        }
    }

    // 3 y 4. Producto por defecto del grupo (o el primero publicado)
    if (!$product_id) {
        $product_id = reactafy_get_default_product_id($group_parent);
    }

    if (!$product_id) {
        return $not_found;
    }

    $summary = reactafy_get_product_summary($product_id);

    if (!$summary) {
        return $not_found;
    }

    if (is_wp_error($summary)) {
        return $summary;
    }

    /*
     * Metadatos SEO de Yoast, los del GRUPO (Yoast guarda sus datos en
     * el post padre; las variaciones no tienen caja de Yoast).
     * Next añade el formato del producto al título y pone el canonical.
     */
    if (function_exists('YoastSEO')) {
        $summary['seo'] = reactafy_seo_from_yoast(
            YoastSEO()->meta->for_post($group_parent->get_id())
        );
    }

    /*
     * Datos que solo necesita la ficha (el listado de la tienda no
     * los pide, así no se hace más pesado).
     */
    $product = wc_get_product($product_id);

    $summary['description']   = reactafy_get_product_description($product, $group_parent);
    $summary['groupProducts'] = reactafy_get_group_products($group_parent);
    $summary['upsells']       = reactafy_get_upsells($product_id, $group_parent);

    // "Sobre la marca"
    if (!empty($summary['brand'])) {

        $term = get_term($summary['brand']['id'], 'product_brand');

        $summary['brand']['description'] = ($term && !is_wp_error($term))
            ? wpautop(wp_kses_post($term->description))
            : '';
    }

    return $summary;
}
