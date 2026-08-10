import { createRoot } from 'react-dom/client'
import { CheckoutFooter } from './components/CheckoutFooter'
import { CheckoutHeader } from './components/CheckoutHeader'

const headerContainer = document.querySelector(
  '.reactafy-checkout-header',
)

const footerContainer = document.querySelector(
  '.reactafy-checkout-footer',
)

if (headerContainer) {
  createRoot(headerContainer).render(
    <CheckoutHeader storeHref="/tienda" />,
  )
}

if (footerContainer) {
  createRoot(footerContainer).render(
    <CheckoutFooter />,
  )
}
