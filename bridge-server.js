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
app.use(express.urlencoded({ extended: true })); // Parse form data
app.use(cors({
    origin: '*',
    credentials: false
}));

// Root route for Railway
app.get('/', (req, res) => {
    res.json({ 
        status: '🎭 Shopify Cloaking Bridge is LIVE!',
        message: 'Ready to process checkout redirects',
        timestamp: new Date().toISOString()
    });
});

// Complete SKU mapping with all 44 products + FREE GIFT
// Updated SKU mapping with correct variant IDs from Store B
const SKU_MAPPING = {
    // FRAGRANCES - All map to same cologne (6→1 consolidation)
    "VALENT1NO_SUPPLIER": {
        "storeBVariantId": "gid://shopify/ProductVariant/47454816698580",
        "displayProduct": "Valent1no",
        "realProduct": "BackedStock® Cologne"
    },
    "T0M_F0RD_SUPPLIER": {
        "storeBVariantId": "gid://shopify/ProductVariant/47454816698580", 
        "displayProduct": "T0m F0rd",
        "realProduct": "BackedStock® Cologne"
    },
    "BAKARAT_SUPPLIER": {
        "storeBVariantId": "gid://shopify/ProductVariant/47454816698580",
        "displayProduct": "Bakarat",
        "realProduct": "BackedStock® Cologne"
    },
    "CR3EED_SUPPLIER": {
        "storeBVariantId": "gid://shopify/ProductVariant/47454816698580",
        "displayProduct": "Cr3eed",
        "realProduct": "BackedStock® Cologne"
    },
    "DI0R_SUPPLIER": {
        "storeBVariantId": "gid://shopify/ProductVariant/47454816698580",
        "displayProduct": "Di0r",
        "realProduct": "BackedStock® Cologne"
    },
    "JPG1_FRAGRANCE_SUPPLIER": {
        "storeBVariantId": "gid://shopify/ProductVariant/47454816698580",
        "displayProduct": "JPG1 Fragrance",
        "realProduct": "BackedStock® Cologne"
    },
    
    // WATCHES
    "U1TRA_WATCH_SUPPLIER": {
        "storeBVariantId": "gid://shopify/ProductVariant/47454818959572",
        "displayProduct": "U1tra Watch",
        "realProduct": "BackedStock® U Watch"
    },
    "R0LEX_WATCH_SUPPLIER": {
        "storeBVariantId": "gid://shopify/ProductVariant/47454818533588",
        "displayProduct": "R0lex Watch",
        "realProduct": "BackedStock® R Watch"
    },
    "MOSSINAITE_WATCH_SUPPLIER": {
        "storeBVariantId": "gid://shopify/ProductVariant/47454819156180",
        "displayProduct": "Mossinaite Watch",
        "realProduct": "BackedStock® M Watch"
    },
    
    // CHROME HEARTS ITEMS
    "CHR0M3_BELT_SUPPLIER": {
        "storeBVariantId": "gid://shopify/ProductVariant/47454824464596",
        "displayProduct": "Chr0m3 Belt",
        "realProduct": "BackedStock® C Belt"
    },
    "CHR0M3_JEANS_SUPPLIER": {
        "storeBVariantId": "gid://shopify/ProductVariant/47454821744852",
        "displayProduct": "Chr0m3 Jeans",
        "realProduct": "BackedStock® Pants"
    },
    "CHR0M3_JERSEY_SUPPLIER": {
        "storeBVariantId": "gid://shopify/ProductVariant/47454822793428",
        "displayProduct": "Chr0m3 Jersey",
        "realProduct": "BackedStock® C Jersey"
    },
    "CHR0M3_JEWLERY_SUPPLIER": {
        "storeBVariantId": "gid://shopify/ProductVariant/47454820696276",
        "displayProduct": "Chr0m3 Jewlery",
        "realProduct": "BackedStock® C Jewelry"
    },
    "CHR0M3_T_SHIRTS_COPY_SUPPLIER": {
        "storeBVariantId": "gid://shopify/ProductVariant/47454822662356",
        "displayProduct": "Chr0m3 T-Shirts",
        "realProduct": "BackedStock® C Shirt"
    },
    "CHR0M3_TRUCKER_HAT_SUPPLIER": {
        "storeBVariantId": "gid://shopify/ProductVariant/47454823219412",
        "displayProduct": "Chr0m3 Trucker Hat",
        "realProduct": "BackedStock® C Hat"
    },
    
    // CLOTHING - CONSOLIDATION (3→1 hoodies, 3→1 pants)
    "DEN1M_SWEAT_PANTS_SUPPLIER": {
        "storeBVariantId": "gid://shopify/ProductVariant/47454821744852",
        "displayProduct": "Den1m Sweat Pants",
        "realProduct": "BackedStock® Pants"
    },
    "DEN1M_HOODIE_SUPPLIER": {
        "storeBVariantId": "gid://shopify/ProductVariant/47454822072532",
        "displayProduct": "Den1m hoodie",
        "realProduct": "BackedStock® Hoodie"
    },
    "ESSCENTIALS_HOODIE_SUPPLIER": {
        "storeBVariantId": "gid://shopify/ProductVariant/47454822072532",
        "displayProduct": "Esscentials Hoodie",
        "realProduct": "BackedStock® Hoodie"
    },
    "SPYDUR_SWEAT_PANTS_SUPPLIER": {
        "storeBVariantId": "gid://shopify/ProductVariant/47454821744852",
        "displayProduct": "Spydur Sweat Pants",
        "realProduct": "BackedStock® Pants"
    },
    "SPYDUR_HOODIE_SUPPLIER": {
        "storeBVariantId": "gid://shopify/ProductVariant/47454822072532",
        "displayProduct": "Spydur Hoodie",
        "realProduct": "BackedStock® Hoodie"
    },
    
    // LV ITEMS
    "LV1_BELT_SUPPLIER": {
        "storeBVariantId": "gid://shopify/ProductVariant/47454824235220",
        "displayProduct": "Lv1 Belt",
        "realProduct": "BackedStock® L Belt"
    },
    "LV1_BRACELET_SUPPLIER": {
        "storeBVariantId": "gid://shopify/ProductVariant/47454819549396",
        "displayProduct": "Lv1 Bracelet",
        "realProduct": "BackedStock® L Bracelet"
    },
    "LV1_WALLET_SUPPLIER": {
        "storeBVariantId": "gid://shopify/ProductVariant/47454825349332",
        "displayProduct": "Lv1 Wallet",
        "realProduct": "BackedStock® L Wallet"
    },
    
    // SHOES
    "J4_SHOES_SUPPLIER": {
        "storeBVariantId": "gid://shopify/ProductVariant/47454823579860",
        "displayProduct": "J4 shoes",
        "realProduct": "BackedStock® Shoes"
    },
    "MAXES_SUPPLIER": {
        "storeBVariantId": "gid://shopify/ProductVariant/47454830428372",
        "displayProduct": "Maxes",
        "realProduct": "BackedStock® Maxes"
    },
    "SLIDEZZ_SUPPLIER": {
        "storeBVariantId": "gid://shopify/ProductVariant/47454823645396",
        "displayProduct": "Slidezz",
        "realProduct": "BackedStock® Slides"
    },
    
    // TECH - CONSOLIDATION (2→1 phones, 2→1 computers)
    "J8L_SPEAKER_SUPPLIER": {
        "storeBVariantId": "gid://shopify/ProductVariant/47454826856660",
        "displayProduct": "J8L Speaker",
        "realProduct": "BackedStock® Speaker"
    },
    "PODS_3_SUPPLIER": {
        "storeBVariantId": "gid://shopify/ProductVariant/47454826758356",
        "displayProduct": "Pods 3",
        "realProduct": "BackedStock® Pods 3"
    },
    "PODS_PRO_2_SUPPLIER": {
        "storeBVariantId": "gid://shopify/ProductVariant/47454826627284",
        "displayProduct": "Pods Pro 2",
        "realProduct": "BackedStock® Pods 2"
    },
    "PODS_PROMOTION": {
        "storeBVariantId": "gid://shopify/ProductVariant/47486265360596",
        "displayProduct": "Free Pods Pro 3",
        "realProduct": "BackedStock® Free Pods Pro 3"
    },
    "PHONE_16_PRO_SUPPLIER": {
        "storeBVariantId": "gid://shopify/ProductVariant/47454827282644",
        "displayProduct": "Phone 16 Pro",
        "realProduct": "BackedStock® Phone"
    },
    "PHONE_16_PRO_MAX_SUPPLIER": {
        "storeBVariantId": "gid://shopify/ProductVariant/47454827282644",
        "displayProduct": "Phone 16 Pro Max",
        "realProduct": "BackedStock® Phone"
    },
    "M4CBOOK_AIR_SUPPLIER": {
        "storeBVariantId": "gid://shopify/ProductVariant/47454827446484",
        "displayProduct": "M4cBook Air",
        "realProduct": "BackedStock® Computer"
    },
    "M4CBOOK_PRO_SUPPLIER": {
        "storeBVariantId": "gid://shopify/ProductVariant/47454827446484",
        "displayProduct": "M4cBook Pro",
        "realProduct": "BackedStock® Computer"
    },

    "PODS_BUNDLE-3": {
    "storeBVariantId": "gid://shopify/ProductVariant/47499769938132",
    "displayProduct": "Pods Bundle (3-Pack)",
    "realProduct": "ProfitSupply® Pods Bundle (3-Pack)"
},
"PODS_BUNDLE-5": {
    "storeBVariantId": "gid://shopify/ProductVariant/47499769970900",
    "displayProduct": "Pods Bundle (5-Pack)",
    "realProduct": "ProfitSupply® Pods Bundle (5-Pack)"
},
"PODS_BUNDLE-10": {
    "storeBVariantId": "gid://shopify/ProductVariant/47499770003668",
    "displayProduct": "Pods Bundle (10-Pack)",
    "realProduct": "ProfitSupply® Pods Bundle (10-Pack)"
},
    
    // ACCESSORIES
    "PR4DA_SUNGLASSES_SUPPLIER": {
        "storeBVariantId": "gid://shopify/ProductVariant/47454820991188",
        "displayProduct": "Pr4da Sunglasses",
        "realProduct": "BackedStock® P Glasses"
    },
    "N1KE_ELITE_BAG_SUPPLIER": {
        "storeBVariantId": "gid://shopify/ProductVariant/47454818336980",
        "displayProduct": "N1ke Elite bag",
        "realProduct": "BackedStock® N Bag"
    },
    "G0YARDDD_SUPPLIER": {
        "storeBVariantId": "gid://shopify/ProductVariant/47454818271444",
        "displayProduct": "G0yarddd",
        "realProduct": "BackedStock® G Bag"
    },
    "MOSSINAITE_T3NNIS_BRACLET_SUPPLIER": {
        "storeBVariantId": "gid://shopify/ProductVariant/47454819582164",
        "displayProduct": "Mossinaite T3nnis Braclet",
        "realProduct": "BackedStock® M Bracelet"
    },
    
    // MISC
    "LABUABABA_SUPPLIER": {
        "storeBVariantId": "gid://shopify/ProductVariant/47454829773012",
        "displayProduct": "Labuababa",
        "realProduct": "BackedStock® Plushie"
    },
    "LEGGO_SUPPLIER": {
        "storeBVariantId": "gid://shopify/ProductVariant/47454829838548",
        "displayProduct": "Large Bricks",
        "realProduct": "BackedStock® Bricks"
    },
    
    // BUNDLES
    "BEST_SELLER_ACCESSORIES_BUNDLE_SUPPLIER": {
        "storeBVariantId": "gid://shopify/ProductVariant/47454826430676",
        "displayProduct": "(BEST SELLER) Accessories Bundle",
        "realProduct": "BackedStock® Accessories Bundle"
    },
    "BEST_SELLER_ALL_ELECTRONICS_BUNDLE_PACK_SUPPLIER": {
        "storeBVariantId": "gid://shopify/ProductVariant/47454827544788",
        "displayProduct": "(BEST SELLER) All Electronics Bundle Pack",
        "realProduct": "BackedStock® Electronic Bundle"
    },
    "BEST_SELLER_CLOTHING_BUNDLE_SUPPLIER": {
        "storeBVariantId": "gid://shopify/ProductVariant/47454822858964",
        "displayProduct": "(BEST SELLER) Clothing Bundle",
        "realProduct": "BackedStock® Clothing Bundle"
    },
    "BEST_SELLER_FRAGRANCES_BUNDLE_SUPPLIER": {
        "storeBVariantId": "gid://shopify/ProductVariant/47454816764116",
        "displayProduct": "(BEST SELLER) Fragrances Bundle",
        "realProduct": "BackedStock® Cologne Bundle"
    },
    "BEST_SELLER_LV1_BUNDLE_PACK_SUPPLIER": {
        "storeBVariantId": "gid://shopify/ProductVariant/47454825545940",
        "displayProduct": "(BEST SELLER) Lv1 Bundle Pack",
        "realProduct": "BackedStock® L Bundle"
    }
};

// Shopify API configuration
const STOREFRONT_API_URL = `https://${process.env.STORE_B_DOMAIN}/api/2026-01/graphql.json`;

/**
 * Create cart on Store B using Shopify Storefront API
 */
async function createShopifyCart(items, discountCodes = []) {
    const cartCreateMutation = `
        mutation cartCreate($input: CartInput!) {
            cartCreate(input: $input) {
                cart {
                    id
                    checkoutUrl
                    lines(first: 100) {
                        edges {
                            node {
                                id
                                quantity
                                merchandise {
                                    ... on ProductVariant {
                                        id
                                        title
                                        product {
                                            title
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                userErrors {
                    field
                    message
                }
            }
        }
    `;

    // Map Store A items to Store B variant IDs
    const mappedLines = items.map(item => {
        const mapping = SKU_MAPPING[item.sku];
        if (!mapping) {
            throw new Error(`No mapping found for SKU: ${item.sku}`);
        }
        
        console.log(`🔄 Mapping: ${item.sku} → ${mapping.realProduct}`);
        
        const lineItem = {
            merchandiseId: mapping.storeBVariantId,
            quantity: item.quantity
        };
        
        // Only add attributes if they exist and are not empty
        if (item.properties && Array.isArray(item.properties) && item.properties.length > 0) {
            lineItem.attributes = item.properties;
        }
        
        return lineItem;
    });

    const variables = {
        input: {
            lines: mappedLines,
            // Add discount codes if provided
            ...(discountCodes.length > 0 && { discountCodes: discountCodes })
        }
    };

    try {
        const response = await fetch(STOREFRONT_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                query: cartCreateMutation,
                variables: variables
            })
        });

        const data = await response.json();
        
        if (data.errors) {
            throw new Error(`GraphQL errors: ${JSON.stringify(data.errors)}`);
        }

        if (data.data.cartCreate.userErrors.length > 0) {
            throw new Error(`Cart creation errors: ${JSON.stringify(data.data.cartCreate.userErrors)}`);
        }

        return data.data.cartCreate.cart;
    } catch (error) {
        console.error('❌ Cart creation failed:', error);
        throw error;
    }
}

/**
 * Main checkout bridge endpoint - Returns 302 redirect
 */
app.post('/checkout-bridge', async (req, res) => {
    try {
        console.log('🌉 Bridge request received');
        console.log('📦 Request body:', req.body);
        
        // Parse items from form submission
        let items;
        if (typeof req.body.items === 'string') {
            // Form submission - items is a JSON string
            items = JSON.parse(req.body.items);
        } else {
            // Direct JSON - items is already an array
            items = req.body.items;
        }
        
        // Extract discount codes from request
        let discountCodes = [];
        if (req.body.discount_codes && Array.isArray(req.body.discount_codes)) {
            discountCodes = req.body.discount_codes;
        } else if (req.body.discount_code) {
            discountCodes = [req.body.discount_code];
        }
        
        console.log('🎯 Discount codes to transfer:', discountCodes);
        console.log('📦 Items parsed:', items ? items.length : 0);
        
        if (!items || !Array.isArray(items) || items.length === 0) {
            console.error('❌ No items in request');
            return res.status(400).send('Invalid cart data - no items found');
        }

        // Log each item's SKU
        items.forEach((item, index) => {
            console.log(`   Item ${index + 1}: SKU="${item.sku}", Qty=${item.quantity}`);
        });

        // Create cart on Store B with discount transfer
        console.log('⚙️  Creating cart on Store B...');
        const cart = await createShopifyCart(items, discountCodes);
        
        const checkoutUrl = cart.checkoutUrl;
        
        console.log('✅ Cart created successfully:', cart.id);
        console.log('🔗 Checkout URL:', checkoutUrl);
        
        // Set privacy headers
        res.set({
            'Referrer-Policy': 'no-referrer',
            'Cache-Control': 'no-cache, no-store, must-revalidate'
        });
        
        // Return 302 redirect to Store B checkout
        console.log('↪️  Sending 302 redirect...');
        // Discord notification AFTER redirect
setImmediate(() => {
    try {
        const productList = items.map(i => {
            const mapping = SKU_MAPPING[i.sku];
            return mapping ? `${mapping.displayProduct} → ${mapping.realProduct} (x${i.quantity})` : i.sku;
        }).join('\n');
        
        fetch('https://discord.com/api/webhooks/1462766339734245450/tvQamu299eAdNOGw3jEWI97J0g4nAEvJVaXTLcJifK_v86Z0lgSu2mEJ1vJtCI9J-t0k', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                content: '🛒 **Checkout Started**\nItems: ' + items.length + '\n\n' + productList
            })
        }).catch(() => {});
    } catch(e) {}
});
        return res.redirect(302, checkoutUrl);

    } catch (error) {
        console.error('❌ Bridge error:', error.message);
        console.error('Stack:', error.stack);
        return res.status(500).send(`Cart creation failed: ${error.message}`);
    }
});

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
    res.json({ 
        status: '🚀 BRIDGE IS LIVE!', 
        timestamp: new Date().toISOString(),
        environment: {
            storeBDomain: process.env.STORE_B_DOMAIN || '❌ NOT_SET',
            storeADomain: process.env.STORE_A_DOMAIN || '❌ NOT_SET',
            hasStorefrontToken: !!process.env.STOREFRONT_ACCESS_TOKEN,
            totalMappings: Object.keys(SKU_MAPPING).length
        }
    });
});

/**
 * Mapping info endpoint
 */
app.get('/mapping', (req, res) => {
    const consolidationStats = {};
    const variantCounts = {};
    
    // Count consolidations
    Object.values(SKU_MAPPING).forEach(mapping => {
        const variantId = mapping.storeBVariantId;
        if (!variantCounts[variantId]) {
            variantCounts[variantId] = [];
        }
        variantCounts[variantId].push(mapping.displayProduct);
    });
    
    Object.entries(variantCounts).forEach(([variantId, products]) => {
        if (products.length > 1) {
            const realProduct = Object.values(SKU_MAPPING).find(m => m.storeBVariantId === variantId).realProduct;
            consolidationStats[realProduct] = {
                count: products.length,
                products: products
            };
        }
    });
    
    res.json({
        totalMappings: Object.keys(SKU_MAPPING).length,
        consolidations: consolidationStats,
        sampleMappings: Object.entries(SKU_MAPPING).slice(0, 5).map(([sku, mapping]) => ({
            storeSku: sku,
            displayProduct: mapping.displayProduct,
            realProduct: mapping.realProduct
        }))
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ 
        error: 'Endpoint not found',
        availableEndpoints: ['/', '/health', '/mapping', '/checkout-bridge']
    });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log('🚀🎭 SHOPIFY CLOAKING BRIDGE IS LIVE!');
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`🗺️  Mapping info: http://localhost:${PORT}/mapping`);
    console.log(`🌉 Bridge endpoint: POST /checkout-bridge`);
    console.log(`📦 Total SKU mappings: ${Object.keys(SKU_MAPPING).length}`);
});

module.exports = app;
