<?php
/*
 * products.php · sección 11 (facetas): Tipo y Características desde el
 * árbol de categorías, y sin Cantidad ni Sabor.
 *
 * Sustituye estas 4 funciones por las de abajo (el resto de la sección
 * 11 no cambia):
 *
 *   1. reactafy_facet_taxonomies()  → se RENOMBRA a reactafy_facets()
 *      (bórrala y pega la nueva)
 *   2. reactafy_get_filter_index()
 *   3. reactafy_parse_filters()     (solo cambia la llamada a reactafy_facets)
 *   4. reactafy_get_facets()
 *
 * Después: wp litespeed-purge all
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
