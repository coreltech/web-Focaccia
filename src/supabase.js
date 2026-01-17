import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabaseUrl = 'https://tjikujrwabmbazvjsdmv.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRqaWt1anJ3YWJtYmF6dmpzZG12Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY2OTkxOTQsImV4cCI6MjA4MjI3NTE5NH0.N-yNlmAcVr0-XxV-v-Xc67obYD7ethmLlHZNM4AIBW8'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function getProducts() {
    try {
        const { data, error } = await supabase
            .from('sales_prices')
            .select('*')
            .eq('esta_activo', true) // Only active products
            .order('categoria', { ascending: true })

        if (error) throw error

        // Map database columns to application properties
        return data.map(p => ({
            ...p,
            category: p.categoria,
            name: p.product_name || 'Sin nombre',
            price: p.precio_venta_final || 0
        }))
    } catch (error) {
        console.error('Error fetching products:', error)

        // Specific error handling
        if (error.code === 'PGRST116') {
            throw new Error('No hay productos disponibles en este momento')
        }
        if (!navigator.onLine) {
            throw new Error('Sin conexión a internet. Verifica tu red.')
        }

        throw new Error(`Error al cargar productos: ${error.message}`)
    }
}

export async function getExchangeRate() {
    try {
        const { data, error } = await supabase
            .from('exchange_rates')
            .select('currency_code, rate_to_ves')
            .eq('currency_code', 'USD')
            .single()

        if (error) throw error

        // Return standardized rate object
        return { rate: data.rate_to_ves }
    } catch (error) {
        console.error('Error fetching exchange rate:', error)

        if (!navigator.onLine) {
            throw new Error('Sin conexión para obtener tasa de cambio')
        }

        // Return default rate as fallback
        console.warn('Using default exchange rate: 1')
        return { rate: 1 }
    }
}
// Register ATOMIC order in ERP (V3)
export async function registerOrderV3(items, exchangeRate, metadata = {}) {
    const payload = {
        p_items: items.map(item => ({
            id: item.id,
            qty: item.quantity,
            price: item.price,
            name: item.name
        })),
        p_metadata: {
            client: metadata.clientName,
            order_type: metadata.orderType,
            address: metadata.address,
            payment: metadata.paymentMethod
        },
        p_rate: exchangeRate
    };

    const { data, error } = await supabase.rpc('registrar_pedido_web_v3', payload);

    if (error) {
        console.error('RPC Error:', error);
        return { success: false, error: error.message };
    }

    if (data && data.success === false) {
        console.error('Logic Error:', data.error);
        return { success: false, error: data.error, message: data.message };
    }

    return { success: true, group_id: data.order_group };
}

export async function subscribeToNewsletter(email, name) {
    try {
        const { error } = await supabase
            .from('newsletter_subscribers')
            .insert([{ email, name }])

        if (error) {
            // Handle unique constraint violation (email already exists)
            if (error.code === '23505') {
                return { success: true, alreadySubscribed: true }
            }
            throw error
        }

        return { success: true }
    } catch (error) {
        console.error('Error subscribing to newsletter:', error)
        return { success: false, error: error.message }
    }
}

