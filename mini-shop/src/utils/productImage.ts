/**
 * WordPress genera tres variantes de cada imagen de producto:
 *
 *   -150x150      ~30 KB
 *   -300x300      ~40 KB
 *   (original)   ~200 KB   600×600
 *
 * Se ofrecen las tres en un `srcset` y decide el navegador según el
 * hueco real y la densidad de la pantalla. Es lo mismo que hace
 * Aguafy, así que ante el mismo dispositivo ambos sitios descargan
 * el mismo tamaño y la comparación es limpia.
 *
 * Apaño temporal: la convención de nombres se está adivinando desde
 * el cliente. Lo correcto es que `reactafy/v1/products` devuelva los
 * tamaños disponibles y construir el srcset con esos datos.
 */

function withSize(url: string, suffix: string): string {
  return url.replace(
    /(\.[a-z0-9]+)(\?.*)?$/i,
    `${suffix}$1$2`
  )
}

export interface ImageSources {
  src: string
  srcSet: string
}

export function getImageSources(url: string): ImageSources {
  return {
    // `src` es el respaldo para navegadores sin soporte de srcset.
    src: withSize(url, '-300x300'),
    srcSet: [
      `${withSize(url, '-150x150')} 150w`,
      `${withSize(url, '-300x300')} 300w`,
      `${url} 600w`,
    ].join(', '),
  }
}

/**
 * Ancho que ocupará la imagen en cada punto de ruptura, calculado a
 * partir de la rejilla real (ver ProductGrid.module.css):
 * contenedor de 1280 con 16px de padding y 16px de separación.
 *
 * Sin esto el navegador asume 100vw y descarga siempre la más
 * grande, que es el error más común al usar srcset.
 */
export const PRODUCT_IMAGE_SIZES = [
  '(min-width: 1280px) 237px',
  '(min-width: 1024px) calc(25vw - 20px)',
  '(min-width: 640px) calc(33.33vw - 21px)',
  'calc(50vw - 24px)',
].join(', ')
