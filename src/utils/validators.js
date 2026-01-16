// ============================================
// FORM VALIDATORS
// ============================================

/**
 * Validate checkout form data
 * @param {Object} data - Form data
 * @param {string} data.clientName - Customer name
 * @param {string} data.orderType - 'pickup' or 'delivery'
 * @param {string} data.address - Delivery address (required if delivery)
 * @returns {Object} { valid: boolean, errors: string[] }
 */
export function validateCheckoutForm(data) {
    const errors = []

    if (!data.clientName || !data.clientName.trim()) {
        errors.push('Por favor, indica tu nombre para el pedido.')
    }

    if (data.orderType === 'delivery' && (!data.address || !data.address.trim())) {
        errors.push('Por favor, indica la dirección de entrega.')
    }

    return {
        valid: errors.length === 0,
        errors
    }
}

/**
 * Validate cart has items
 * @param {Array} cart - Cart items
 * @returns {Object} { valid: boolean, error: string }
 */
export function validateCart(cart) {
    if (!cart || cart.length === 0) {
        return {
            valid: false,
            error: 'El carrito está vacío'
        }
    }

    return { valid: true }
}

/**
 * Validate product has stock
 * @param {Object} product - Product object
 * @returns {boolean} True if product has stock
 */
export function hasStock(product) {
    return (product.stock_disponible || 0) > 0
}
