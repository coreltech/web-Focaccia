import { getProducts, getExchangeRate, registerOrderV3 } from './src/supabase.js'
import { CACHE_CONFIG, TOAST_DURATION, ANIMATION_DURATION, WHATSAPP_NUMBER, DEFAULT_IMAGES } from './src/constants.js'
import { formatPrice, formatExchangeRate } from './src/utils/formatters.js'
import { validateCheckoutForm, validateCart } from './src/utils/validators.js'

// Cache configuration
const CACHE_KEY = CACHE_CONFIG.KEY
const CACHE_TTL = CACHE_CONFIG.TTL

let state = {
  products: [],
  exchangeRate: 1,
  cart: [],
  categories: {
    focaccia: 'Focaccias',
    salsas: 'Salsas y Toppings',
    beverages: 'Bebidas',
    coffee: 'Cafetería'
  }
}

// Selectors
const focacciaGrid = document.getElementById('focaccia-grid')
const salsasBubbles = document.getElementById('salsas-bubbles')
const otherGrid = document.getElementById('other-grid')
const rateTicker = document.getElementById('rate-ticker')
const cartCount = document.getElementById('floating-cart-count')
const cartTotal = document.getElementById('floating-cart-total')

const cartModal = document.getElementById('cart-modal')
const cartTrigger = document.getElementById('floating-cart-btn')

async function init() {
  try {
    // Try to load from cache first for instant render
    const cached = getCachedProducts()
    if (cached) {
      state.products = cached
      renderMenu() // Render immediately with cached data
    }

    // Fetch fresh data in parallel
    const [products, rateData] = await Promise.all([
      getProducts(),
      getExchangeRate()
    ])

    state.products = products
    state.exchangeRate = rateData?.rate || 1

    // Update cache with fresh data
    setCachedProducts(products)

    // Update UI with fresh data
    if (rateTicker) {
      rateTicker.innerText = formatExchangeRate(state.exchangeRate)
    }

    // Re-render with fresh data
    renderMenu()
    updateCartUI()
  } catch (error) {
    console.error('Initialization failed:', error)
    showToast('Error al cargar datos. Revisa la consola.', 'error')
  }
}

function getCachedProducts() {
  try {
    const cached = localStorage.getItem(CACHE_KEY)
    if (!cached) return null

    const { data, timestamp } = JSON.parse(cached)
    if (Date.now() - timestamp < CACHE_TTL) {
      return data
    }
    return null
  } catch {
    return null
  }
}

function setCachedProducts(products) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      data: products,
      timestamp: Date.now()
    }))
  } catch (e) {
    console.warn('Cache failed:', e)
  }
}

function showToast(message, type = 'info', duration = 5000) {
  let container = document.querySelector('.toast-container')
  if (!container) {
    container = document.createElement('div')
    container.className = 'toast-container'
    document.body.appendChild(container)
  }

  const toast = document.createElement('div')
  toast.className = `toast toast-${type}`

  let icon = '🔔'
  if (type === 'success') icon = '✅'
  if (type === 'error') icon = '❌'
  if (type === 'warning') icon = '⚠️'

  toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`
  container.appendChild(toast)

  setTimeout(() => {
    toast.classList.add('removing')
    setTimeout(() => toast.remove(), ANIMATION_DURATION.TOAST_REMOVE)
  }, duration)
}

// Modal handling
if (cartTrigger) {
  cartTrigger.addEventListener('click', () => {
    cartModal.classList.add('active')
    renderCartModal()
  })
}

window.closeModal = () => {
  if (cartModal) cartModal.classList.remove('active')
}

function renderCartModal() {
  let itemsHtml = ''
  let totalUSD = 0

  state.cart.forEach(item => {
    const subtotal = (item.price || 0) * item.quantity
    totalUSD += subtotal
    itemsHtml += `
      <div class="cart-item">
        <div style="flex-grow: 1">
          <div style="font-weight: 600">${item.name}</div>
          <small style="color: var(--text-muted)">$${(item.price || 0).toFixed(2)}</small>
        </div>
        <div class="qty-controls">
          <button class="qty-btn" 
                  onclick="changeQuantity('${item.id}', -1)"
                  aria-label="Disminuir cantidad de ${item.name}">
            -
          </button>
          <span class="qty-val" aria-label="Cantidad">${item.quantity}</span>
          <button class="qty-btn" 
                  onclick="changeQuantity('${item.id}', 1)"
                  aria-label="Aumentar cantidad de ${item.name}">
            +
          </button>
        </div>
        <div style="font-weight: 700; min-width: 60px; text-align: right">$${subtotal.toFixed(2)}</div>
        <button class="remove-item" 
                onclick="removeFromCart('${item.id}')"
                aria-label="Eliminar ${item.name} del carrito">
          ✕
        </button>
      </div>
    `
  })

  const totalBs = totalUSD * state.exchangeRate

  cartModal.innerHTML = `
    <div class="cart-modal-content">
      <button class="close-modal" onclick="closeModal()">&times;</button>
      <h3 style="font-family: var(--font-title); font-size: 2rem">Tu Pedido</h3>
      
      <div class="modal-body">
        <div class="cart-items">
          ${state.cart.length ? itemsHtml : '<p style="text-align:center; color: var(--text-muted)">Aún no has elegido ninguna delicia.</p>'}
        </div>

        ${state.cart.length ? `
        <div class="checkout-form">
          <div class="form-group">
            <label>Nombre del Cliente</label>
            <input type="text" id="cust-name" class="form-input" placeholder="Tu nombre..." required>
          </div>

          <div class="form-group">
            <label>Método de Pago Sugerido</label>
            <select id="cust-payment" class="form-input">
              <option value="Efectivo $">💵 Efectivo $</option>
              <option value="Pago Móvil Bs">📲 Pago Móvil (Bs)</option>
              <option value="Zelle $">📱 Zelle $</option>
              <option value="Efectivo Bs">💸 Efectivo (Bs)</option>
            </select>
          </div>

          <div class="form-group">
            <label>Tipo de Entrega</label>
            <div class="order-type-toggle">
              <button class="toggle-btn active" id="btn-pickup" onclick="setOrderType('pickup')">📍 Pickup</button>
              <button class="toggle-btn" id="btn-delivery" onclick="setOrderType('delivery')">🛵 Delivery</button>
            </div>
          </div>

          <div class="form-group" id="delivery-address-container">
            <label>Dirección de Entrega</label>
            <textarea id="cust-address" class="form-input address-textarea" placeholder="Calle, edificio, punto de referencia..."></textarea>
          </div>
        </div>
        ` : ''}
      </div>

      <div class="cart-total">
        <div style="display:flex; justify-content:space-between; margin-bottom: 0.5rem">
          <span>Total USD</span>
          <span style="color: var(--primary); font-weight: 800; font-size: 1.5rem">$${totalUSD.toFixed(2)}</span>
        </div>
        <div style="display:flex; justify-content:space-between; color: var(--text-muted)">
          <span>Total Bs.</span>
          <span>${totalBs.toLocaleString('es-VE', { minimumFractionDigits: 2 })}</span>
        </div>
        ${state.cart.length ? `
          <button class="checkout-btn" id="checkout-btn" onclick="checkout()">
            Confirmar y Enviar WhatsApp 🚀
          </button>
        ` : ''}
      </div>
    </div>
  `
}

window.setOrderType = (type) => {
  const isDelivery = type === 'delivery'
  document.getElementById('btn-pickup').classList.toggle('active', !isDelivery)
  document.getElementById('btn-delivery').classList.toggle('active', isDelivery)

  const addrContainer = document.getElementById('delivery-address-container')
  addrContainer.classList.toggle('active', isDelivery)
  state.orderType = type
}

function renderMenu() {
  if (!focacciaGrid) return

  focacciaGrid.innerHTML = ''
  salsasBubbles.innerHTML = ''
  otherGrid.innerHTML = ''

  state.products.forEach((product, index) => {
    const { ves: priceBs } = formatPrice(product.price || 0, state.exchangeRate)

    if (product.category === 'Focaccias') {
      const card = createFocacciaCard(product, priceBs, index)
      focacciaGrid.appendChild(card)
    } else if (product.category === 'Salsas' || product.category === 'Toppings') {
      const bubble = createBubble(product, priceBs)
      salsasBubbles.appendChild(bubble)
    } else {
      const card = createSimpleCard(product, priceBs)
      otherGrid.appendChild(card)
    }
  })
}

function createFocacciaCard(product, priceBs, index) {
  const div = document.createElement('div')
  const isOutOfStock = (product.stock_disponible || 0) <= 0
  div.className = `focaccia-card ${isOutOfStock ? 'out-of-stock' : ''}`
  div.style.animationDelay = `${index * 0.1}s`

  const imgUrl = product.image_url || DEFAULT_IMAGES.FOCACCIA

  let descriptionHTML = ''
  if (product.description && product.description.trim().length > 0) {
    descriptionHTML = '<div class="card-description-wrapper"><p class="card-description">' + product.description + '</p></div>'
  }

  div.innerHTML = `
    <div class="card-image-container">
      <img src="${imgUrl}" alt="${product.name}" class="card-image" loading="lazy">
      ${isOutOfStock ? '<div class="stock-badge">Agotado</div>' : ''}
    </div>
    <div class="card-content">
      <h4 class="card-title">${product.name}</h4>
      <div class="card-price">$${(product.price || 0).toFixed(2)} | Bs. ${priceBs}</div>
    </div>
    ${descriptionHTML}
    <div class="card-actions">
      <button class="add-btn" onclick="addToCart('${product.id}')" ${isOutOfStock ? 'disabled' : ''}>
        ${isOutOfStock ? 'No disponible' : 'Agregar al Pedido'}
      </button>
    </div>
  `
  return div
}

function createBubble(product, priceBs) {
  const div = document.createElement('div')
  div.className = 'bubble'

  const imgUrl = product.image_url || DEFAULT_IMAGES.SALSA

  div.innerHTML = `
    <div class="bubble-img-wrapper" onclick="addToCart('${product.id}')">
      <img src="${imgUrl}" alt="${product.name}" class="bubble-img" loading="lazy">
    </div>
    <div class="bubble-name">${product.name}</div>
    <div class="bubble-price">$${(product.price || 0).toFixed(2)}</div>
  `
  return div
}

function createSimpleCard(product, priceBs) {
  const div = document.createElement('div')
  const isOutOfStock = (product.stock_disponible || 0) <= 0
  div.className = 'beverage-card'
  if (isOutOfStock) div.classList.add('out-of-stock')

  // Use icon from database if available, otherwise auto-detect
  let icon = product.icon || null

  // Fallback: Auto-detect icon if not set in database
  if (!icon) {
    const iconMap = {
      'cocacola': '🥤',
      'coca cola': '🥤',
      'coca-cola': '🥤',
      'pepsi': '🥤',
      'refresco': '🥤',
      'soda': '🥤',
      'gaseosa': '🥤',
      'agua': '💧',
      'water': '💧',
      'jugo': '🧃',
      'juice': '🧃',
      'té': '🍵',
      'tea': '🍵',
      'café': '☕',
      'coffee': '☕',
      'espresso': '☕',
      'cappuccino': '☕',
      'latte': '☕'
    }

    // Find matching icon
    icon = '☕' // default
    const productName = product.name.toLowerCase()
    for (const [key, value] of Object.entries(iconMap)) {
      if (productName.includes(key)) {
        icon = value
        break
      }
    }
  }

  div.innerHTML = `
    <div class="beverage-icon">${icon}</div>
    <div class="beverage-info">
      <h4 class="beverage-name">${product.name}</h4>
      <div class="beverage-prices">
        <span class="price-usd">$${(product.price || 0).toFixed(2)}</span>
        <span class="price-divider">•</span>
        <span class="price-ves">Bs. ${priceBs}</span>
      </div>
      ${isOutOfStock ? '<span class="out-badge">Agotado</span>' : ''}
    </div>
    <button class="beverage-add-btn" 
            onclick="addToCart('${product.id}')"
            ${isOutOfStock ? 'disabled' : ''}
            aria-label="Agregar ${product.name} al carrito">
      ${isOutOfStock ? '✕' : '+'}
    </button>
  `
  return div
}

window.addToCart = (productId) => {
  const product = state.products.find(p => p.id === productId)
  if (!product) return

  // Visual feedback animation
  const clickedButton = event?.target?.closest('.add-btn')
  if (clickedButton) {
    clickedButton.classList.add('adding')
    setTimeout(() => clickedButton.classList.remove('adding'), 300)
  }

  const existing = state.cart.find(item => item.id === productId)
  if (existing) {
    existing.quantity++
  } else {
    state.cart.push({ ...product, quantity: 1 })
  }

  updateCartUI()
  showToast(`Agregado: ${product.name}`, 'success', TOAST_DURATION.SHORT)
}

window.changeQuantity = (productId, delta) => {
  const item = state.cart.find(i => i.id === productId)
  if (!item) return

  item.quantity += delta
  if (item.quantity <= 0) {
    removeFromCart(productId)
  } else {
    updateCartUI()
    renderCartModal()
  }
}

window.removeFromCart = (productId) => {
  state.cart = state.cart.filter(i => i.id !== productId)
  updateCartUI()
  renderCartModal()
}

function updateCartUI() {
  const totalItems = state.cart.reduce((sum, item) => sum + item.quantity, 0)
  if (cartCount) {
    cartCount.innerText = totalItems
    cartCount.style.display = totalItems > 0 ? 'block' : 'none'

    // Update Total in floating button
    if (cartTotal) {
      const totalUSD = state.cart.reduce((sum, item) => sum + ((item.price || 0) * item.quantity), 0)
      cartTotal.innerText = `$${totalUSD.toFixed(2)}`
    }

    // Flash animation on the badge
    cartCount.style.transform = 'scale(1.5)'
    setTimeout(() => cartCount.style.transform = 'scale(1)', ANIMATION_DURATION.BADGE_PULSE)

    // Flash animation on the button itself
    if (cartTrigger) {
      cartTrigger.classList.remove('empty')
      if (totalItems === 0) cartTrigger.classList.add('empty')

      cartTrigger.style.transform = 'scale(1.05)'
      setTimeout(() => cartTrigger.style.transform = 'scale(1)', ANIMATION_DURATION.CART_SCALE)
    }
  }
}

// Exported Checkout for WhatsApp
window.checkout = async () => {
  // Validate cart
  const cartValidation = validateCart(state.cart)
  if (!cartValidation.valid) {
    return showToast(cartValidation.error, 'warning')
  }

  const clientName = document.getElementById('cust-name').value.trim()
  const paymentMethod = document.getElementById('cust-payment').value
  const orderType = state.orderType || 'pickup'
  const address = document.getElementById('cust-address')?.value.trim() || ''

  // Validate form
  const formValidation = validateCheckoutForm({ clientName, orderType, address })
  if (!formValidation.valid) {
    return showToast(formValidation.errors[0], 'warning')
  }

  const btn = document.getElementById('checkout-btn')
  if (btn) {
    btn.disabled = true
    btn.innerText = 'Procesando... ⏳'
  }

  try {
    // 1. Register Sale in Database (ATOMIC V3)
    const result = await registerOrderV3(state.cart, state.exchangeRate, {
      clientName,
      paymentMethod,
      orderType,
      address
    })

    if (!result.success) {
      if (result.error === 'STOCK_INSUFICIENTE') {
        showToast('❌ ¡Lo sentimos! Al parecer alguien se llevó el último pan justo ahora. El pedido se canceló automáticamente.', 'error', 8000);
      } else {
        showToast('⚠️ El pedido se enviará por WhatsApp, pero hubo un detalle técnico al guardarlo. (Error: ' + (result.message || result.error) + ')', 'warning');
      }
      if (result.error === 'STOCK_INSUFICIENTE') {
        return; // Stop if it's a real stock issue
      }
    }

    // 2. Prepare WhatsApp Message
    let message = `*🍕 Nuevo Pedido Focaccia Plus*\n\n`
    message += `👤 *Cliente:* ${clientName}\n`
    message += `💳 *Pago:* ${paymentMethod}\n`
    message += `📦 *Tipo:* ${orderType === 'delivery' ? '🛵 Delivery' : '📍 Pickup'}\n`
    if (orderType === 'delivery') {
      message += `🏠 *Dirección:* ${address}\n`
    }
    message += `\n*Detalle del Pedido:*\n`

    let totalUSD = 0
    state.cart.forEach(item => {
      const subtotal = (item.price || 0) * item.quantity
      totalUSD += subtotal
      message += `• ${item.quantity}x ${item.name} ($${subtotal.toFixed(2)})\n`
    })

    const totalBs = totalUSD * state.exchangeRate

    message += `\n---`
    message += `\n*Total USD: $${totalUSD.toFixed(2)}*`
    message += `\n*Total Bs.: ${totalBs.toLocaleString('es-VE', { minimumFractionDigits: 2 })}*`
    message += `\n\n_Tasa: ${state.exchangeRate.toFixed(2)}_`
    message += `\n\n¿Podrían confirmar disponibilidad para proceder?`

    const encoded = encodeURIComponent(message)
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`, '_blank')

    // 3. Clear Cart
    state.cart = []
    state.orderType = 'pickup' // Reset
    updateCartUI()
    closeModal()

    if (result.success) {
      showToast('¡Reserva confirmada! En instantes te atenderemos por WhatsApp. 🚀', 'success')
    } else {
      showToast('Pedido procesado (Sin guardado administrativo)', 'warning')
    }

  } catch (error) {
    console.error('Error en checkout:', error)
    showToast('Hubo un error al procesar el pedido. Intenta de nuevo.', 'error')
  } finally {
    if (btn) {
      btn.disabled = false
      btn.innerText = 'Confirmar y Enviar WhatsApp 🚀'
    }
  }
}

// Keyboard support for modal
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && cartModal?.classList.contains('active')) {
    closeModal()
  }
})

init()
