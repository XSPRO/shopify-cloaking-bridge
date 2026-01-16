const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Ensure fetch exists (Railway / Node)
if (!global.fetch) {
  global.fetch = require('node-fetch');
}

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(express.json());
app.use(cors({ origin: '*', credentials: false }));

/**
 * Root (Railway sanity check)
 */
app.get('/', (req, res) => {
  res.json({
    status: '🚀 Shopify Cloaking Bridge is LIVE!',
    timestamp: new Date().toISOString()
  });
});

/**
 * =============================
 * SKU → VARIANT MAPPING
 * =============================
 * (unchanged from your setup)
 */
const SKU_MAPPING = {
  "BAKARAT_SUPPLIER": {
    storeBVariantId: "gid://shopify/ProductVariant/9042810929364",
    displayProduct: "Bakarat",
    realProduct: "BackedStock® Cologne"
  },
  // ⚠️ KEEP ALL YOUR OTHER SKUs HERE (UNCHANGED)
};

/**
 * Shopify Storefront API
 */
const STOREFRONT_API_URL = `https://${process.env.STORE_B_DOMAIN}/api/2024-01/graphql.json`;
const STOREFRONT_TOKEN = process.env.STOREFRONT_ACCESS_TOKEN;

/**
 * ==================================
 * ✅ CREATE CHECKOUT (ALLOWED)
 * ==================================
 */
async function createShopifyCheckout(items) {
  const checkoutCreateMutation = `
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
    if (!mapping) throw new Error(`No mapping for SKU: ${item.sku}`);

    console.log(`🔄 Mapping ${item.sku} → ${mapping.realProduct}`);

    return {
      variantId: mapping.storeBVariantId,
      quantity: item.quantity
    };
  });

  const response = await fetch(STOREFRONT_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': STOREFRONT_TOKEN
    },
    body: JSON.stringify({
      query: checkoutCreateMutation,
      variables: { input: { lineItems } }
    })
  });

  const data = await response.json();

  if (data.errors) {
    throw new Error(`GraphQL error: ${JSON.stringify(data.errors)}`);
  }

  if (data.data.checkoutCreate.checkoutUserErrors.length > 0) {
    throw new Error(
      `Checkout errors: ${JSON.stringify(data.data.checkoutCreate.checkoutUserErrors)}`
    );
  }

  return data.data.checkoutCreate.checkout;
}

/**
 * =============================
 * 🌉 MAIN BRIDGE ENDPOINT
 * =============================
 */
app.post('/checkout-bridge', async (req, res) => {
  try {
    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'No cart items provided' });
    }

    console.log('🌉 Incoming bridge request:', items);

    const checkout = await createShopifyCheckout(items);

    res.set({
      'Referrer-Policy': 'no-referrer',
      'Cache-Control': 'no-store'
    });

    console.log('✅ Checkout created:', checkout.webUrl);

    res.json({
      success: true,
      checkoutUrl: checkout.webUrl,
      checkoutId: checkout.id
    });
  } catch (err) {
    console.error('❌ Bridge error:', err);
    res.status(500).json({
      error: 'Checkout creation failed',
      message: err.message
    });
  }
});

/**
 * Health check
 */
app.get('/health', (req, res) => {
  res.json({
    status: '🚀 BRIDGE IS LIVE!',
    environment: {
      storeBDomain: process.env.STORE_B_DOMAIN,
      hasStorefrontToken: !!STOREFRONT_TOKEN
    }
  });
});

/**
 * 404
 */
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not found',
    available: ['/', '/health', '/checkout-bridge']
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Bridge running on port ${PORT}`);
});
