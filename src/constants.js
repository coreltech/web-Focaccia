// ============================================
// CONFIGURATION CONSTANTS
// ============================================

export const CACHE_CONFIG = {
    KEY: 'focaccia_products_cache',
    TTL: 5 * 60 * 1000 // 5 minutes
}

export const TOAST_DURATION = {
    SHORT: 2000,
    NORMAL: 5000,
    LONG: 8000
}

export const ANIMATION_DURATION = {
    TOAST_REMOVE: 300,
    BADGE_PULSE: 200,
    CART_SCALE: 200
}

// ============================================
// BUSINESS CONSTANTS
// ============================================

export const WHATSAPP_NUMBER = '584145828186'

export const DEFAULT_IMAGES = {
    FOCACCIA: 'https://images.unsplash.com/photo-1599321955419-7853b2a9746b?auto=format&fit=crop&q=80&w=800',
    SALSA: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&q=80&w=200'
}

export const CATEGORIES = {
    FOCACCIA: 'Focaccias',
    SALSAS: 'Salsas y Toppings',
    TOPPINGS: 'Toppings',
    BEVERAGES: 'Bebidas',
    COFFEE: 'Cafetería'
}

export const ORDER_TYPES = {
    PICKUP: 'pickup',
    DELIVERY: 'delivery'
}

export const PAYMENT_METHODS = {
    EFECTIVO_USD: 'Efectivo $',
    PAGO_MOVIL: 'Pago Móvil Bs',
    ZELLE: 'Zelle $',
    EFECTIVO_BS: 'Efectivo Bs'
}
