// ============================================
// CURRENCY FORMATTERS
// ============================================

/**
 * Format amount as currency
 * @param {number} amount - Amount to format
 * @param {string} currency - 'USD' or 'VES'
 * @returns {string} Formatted currency string
 */
export function formatCurrency(amount, currency = 'USD') {
    if (currency === 'VES') {
        return amount.toLocaleString('es-VE', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })
    }
    return amount.toFixed(2)
}

/**
 * Format price in both USD and VES
 * @param {number} priceUSD - Price in USD
 * @param {number} exchangeRate - Exchange rate VES/USD
 * @returns {Object} { usd: string, ves: string }
 */
export function formatPrice(priceUSD, exchangeRate) {
    const priceBs = (priceUSD * exchangeRate).toLocaleString('es-VE', {
        minimumFractionDigits: 2
    })
    return {
        usd: priceUSD.toFixed(2),
        ves: priceBs
    }
}

/**
 * Format exchange rate for display
 * @param {number} rate - Exchange rate
 * @returns {string} Formatted rate string
 */
export function formatExchangeRate(rate) {
    return `Bs. ${rate.toFixed(2)}/USD`
}

// ============================================
// TEXT FORMATTERS
// ============================================

/**
 * Encode text for WhatsApp URL
 * @param {string} text - Text to encode
 * @returns {string} URL-encoded text
 */
export function encodeForWhatsApp(text) {
    return encodeURIComponent(text)
}

/**
 * Truncate text to max length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export function truncate(text, maxLength = 100) {
    if (!text || text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
}
