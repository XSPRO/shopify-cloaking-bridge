const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Fix for Railway - add fetch support
if (!global.fetch) {
    const fetch = require('node-fetch');
    global.fetch = fetch;
}

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(express.json());
app.use(cors({
    origin: '*',
    credentials: false
}));

// Root route
app.get('/', (req, res) => {
    res.json({
        status: '🎭 Shopify Cloaking Bridge is LIVE!',
        message: 'Ready to process checkout redirects',
        timestamp: new Date().toISOString()
    });
});

// ================= SKU MAPPING (UNCHANGED) =================
const SKU_MAPPING = {
    "VALENT1NO_SUPPLIER": { storeBVariantId: "gid://shopify/ProductVariant/9042810929364", displayProduct: "Valent1no", realProduct: "BackedStock® Cologne" },
    "T0M_F0RD_SUPPLIER": { storeBVariantId: "gid://shopify/ProductVariant/9042810929364", displayProduct: "T0m F0rd", realProduct: "BackedStock® Cologne" },
    "BAKARAT_SUPPLIER": { storeBVariantId: "gid://shopify/ProductVariant/9042810929364", displayProduct: "Bakarat", realProduct: "BackedStock® Cologne" },
    "CR3EED_SUPPLIER": { storeBVariantId: "gid://shopify/ProductVariant/9042810929364", displayProduct: "Cr3eed", realProduct: "BackedStock® Cologne" },
    "DI0R_SUPPLIER": { storeBVariantId: "gid://shopify/ProductVariant/9042810929364", displayProduct: "Di0r", realProduct: "BackedStock® Cologne" },
    "JPG1_FRAGRANCE_SUPPLIER": { storeBVariantId: "gid://shopify/ProductVariant/9042810929364", displayProduct: "JPG1 Fragrance", realProduct: "BackedStock® Cologne" },

    "U1TRA_WATCH_SUPPLIER": { storeBVariantId: "gid://shopify/ProductVariant/9042811584724", displayProduct: "U1tra Watch", realProduct: "BackedStock® U Watch" },
    "R0LEX_WATCH_SUPPLIER": { storeBVariantId: "gid://shopify/ProductVariant/9042811519188", displayProduct: "R0lex Watch", realProduct: "BackedStock® R Watch" },
    "MOSSINAITE_WATCH_SUPPLIER": { storeBVariantId: "gid://shopify/ProductVariant/9042811683028", displayProduct: "Mossinaite Watch", realProduct: "BackedStock® M Watch" },

    "CHR0M3_BELT_SUPPLIER": { storeBVariantId: "gid://shopify/ProductVariant/9042813354196", displayProduct: "Chr0m3 Belt", realProduct: "BackedStock® C Belt" },
    "CHR0M3_JEANS_SUPPLIER": { storeBVariantId: "gid://shopify/ProductVariant/9042812502228", displayProduct: "Chr0m3 Jeans", realProduct: "BackedStock® Pants" },
    "CHR0M3_JERSEY_SUPPLIER": { storeBVariantId: "gid://shopify/ProductVariant/9042812829908", displayProduct: "Chr0m3 Jersey", realProduct: "BackedStock® C Jersey" },
    "CHR0M3_JEWLERY_SUPPLIER": { storeBVariantId: "gid://shopify/ProductVariant/9042812076244", displayProduct: "Chr0m3 Jewlery", realProduct: "BackedStock® C Jewelry" },
    "CHR0M3_T_SHIRTS_COPY_SUPPLIER": { storeBVariantId: "gid://shopify/ProductVariant/9042812731604", displayProduct: "Chr0m3 T-Shirts", realProduct: "BackedStock® C Shirt" },
    "CHR0M3_TRUCKER_HAT_SUPPLIER": { storeBVariantId: "gid://shopify/ProductVariant/9042812928212", displayProduct: "Chr0m3 Trucker Hat", realProduct: "BackedStock® C Hat" },

    "DEN1M_SWEAT_PANTS_SUPPLIER": { storeBVariantId: "gid://shopify/ProductVariant/9042812502228", displayProduct: "Den1m Sweat Pants", realProduct: "BackedStock® Pants" },
    "DEN1M_HOODIE_SUPPLIER": { storeBVariantId: "gid://shopify/ProductVariant/9042812633300", displayProduct: "Den1m hoodie", realProduct: "BackedStock® Hoodie" },
    "ESSCENTIALS_HOODIE_SUPPLIER": { storeBVariantId: "gid://shopify/ProductVariant/9042812633300", displayProduct: "Esscentials Hoodie", realProduct: "BackedStock® Hoodie" },
    "SPYDUR_SWEAT_PANTS_SUPPLIER": { storeBVariantId: "gid://shopify/ProductVariant/9042812502228", displayProduct: "Spydur Sweat Pants", realProduct: "BackedStock® Pants" },
    "SPYDUR_HOODIE_SUPPLIER": { storeBVariantId: "gid://shopify/ProductVariant/9042812633300", displayProduct: "Spydur Hoodie", realProduct: "BackedStock® Hoodie" },

    "LV1_BELT_SUPPLIER": { storeBVariantId: "gid://shopify/ProductVariant/9042813190356", displayProduct: "Lv1 Belt", realProduct: "BackedStock® L Belt" },
    "LV1_BRACELET_SUPPLIER": { storeBVariantId: "gid://shopify/ProductVariant/9042811912404", displayProduct: "Lv1 Bracelet", realProduct: "BackedStock® L Bracelet" },
    "LV1_WALLET_SUPPLIER": { storeBVariantId: "gid://shopify/ProductVariant/9042813485268", displayProduct: "Lv1 Wallet", realProduct: "BackedStock® L Wallet" },

    "J4_SHOES_SUPPLIER": { storeBVariantId: "gid://shopify/ProductVariant/9042813059284", displayProduct: "J4 shoes", realProduct: "BackedStock® Shoes" },
    "MAXES_SUPPLIER": { storeBVariantId: "gid://shopify/ProductVariant/9042815320276", displayProduct: "Maxes", realProduct: "BackedStock® Maxes" },
    "SLIDEZZ_SUPPLIER": { storeBVariantId: "gid://shopify/ProductVariant/9042813124820", displayProduct: "Slidezz", realProduct: "BackedStock® Slides" }
};

// ================= SHOPIFY CONFIG =================
const STOREFRONT_API_URL = `https://${process.env.STORE_B_DOMAIN}/api/2024-01/graphql.json`;

// ================= CHECKOUT CREATE (FIX) =================
async function createShopifyCheckout(items) {
    const mutation = `
    mutation checkoutCreate($input: CheckoutCreateInput!) {
      checkoutCreate(input: $input) {
        checkout {
          id
          webUrl
        }
        checkoutUserErrors {
          field
          message
        }
      }
    }
    `;

    const lineItems = items.map(item => {
        const mapping = SKU_MAPPING[item.sku];
        if (!mapping) {
            throw new Error(`No mapping found for SKU: ${item.sku}`);
        }

        console.log(`🔄 Mapping: ${item.sku} → ${mapping.realProduct}`);

        return {
            variantId: mapping.storeBVariantId,
            quantity: item.quantity
        };
    });

    const response = await fetch(STOREFRONT_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Storefront-Access-Token': process.env.STOREFRONT_ACCESS_TOKEN
        },
        body: JSON.stringify({
            query: mutation,
            variables: { input: { lineItems } }
        })
    });

    const data = await response.json();

    if (data.errors) {
        throw new Error(JSON.stringify(data.errors));
    }

    if (data.data.checkoutCreate.checkoutUserErrors.length) {
        throw new Error(JSON.stringify(data.data.checkoutCreate.checkoutUserErrors));
    }

    return data.data.checkoutCreate.checkout;
}

// ================= MAIN BRIDGE =================
app.post('/checkout-bridge', async (req, res) => {
    try {
        const { items } = req.body;

        if (!items || !Array.isArray(items) || !items.length) {
            return res.status(400).json({ error: 'No items provided' });
        }

        const checkout = await createShopifyCheckout(items);

        res.json({
            success: true,
            checkoutId: checkout.id,
            checkoutUrl: checkout.webUrl,
            itemsProcessed: items.length
        });

    } catch (err) {
        console.error('❌ Bridge error:', err);
        res.status(500).json({ error: err.message });
    }
});

// ================= HEALTH =================
app.get('/health', (req, res) => {
    res.json({
        status: '🚀 BRIDGE IS LIVE!',
        timestamp: new Date().toISOString(),
        environment: {
            storeBDomain: process.env.STORE_B_DOMAIN,
            hasStorefrontToken: !!process.env.STOREFRONT_ACCESS_TOKEN,
            totalMappings: Object.keys(SKU_MAPPING).length
        }
    });
});

// ================= 404 =================
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Bridge running on port ${PORT}`);
});

module.exports = app;
