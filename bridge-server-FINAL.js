const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors({
    origin: process.env.STORE_A_DOMAIN,
    credentials: false
}));

// COMPLETE SKU MAPPING WITH REAL VARIANT IDs! 🚀
const SKU_MAPPING = {
    // FRAGRANCES - All map to same cologne product (MASSIVE CONSOLIDATION!)
    "VALENT1NO_SUPPLIER": {
        "storeBVariantId": "gid://shopify/ProductVariant/9042810929364",
        "displayProduct": "Valent1no",
        "realProduct": "BackedStock® Cologne"
    },
    "T0M_F0RD_SUPPLIER": {
        "storeBVariantId": "gid://shopify/ProductVariant/9042810929364", 
        "displayProduct": "T0m F0rd",
        "realProduct": "BackedStock® Cologne"
    },
    "BAKARAT_SUPPLIER": {
        "storeBVariantId": "gid://shopify/ProductVariant/9042810929364",
        "displayProduct": "Bakarat",
        "realProduct": "BackedStock® Cologne"
    },
    "CR3EED_SUPPLIER": {
        "storeBVariantId": "gid://shopify/ProductVariant/9042810929364",
        "displayProduct": "Cr3eed",
        "realProduct": "BackedStock® Cologne"
    },
    "DI0R_SUPPLIER": {
        "storeBVariantId": "gid://shopify/ProductVariant/9042810929364",
        "displayProduct": "Di0r",
        "realProduct": "BackedStock® Cologne"
    },
    "JPG1_FRAGRANCE_SUPPLIER": {
        "storeBVariantId": "gid://shopify/ProductVariant/9042810929364",
        "displayProduct": "JPG1 Fragrance",
        "realProduct": "BackedStock® Cologne"
    },
    
    // WATCHES
    "U1TRA_WATCH_SUPPLIER": {
        "storeBVariantId": "gid://shopify/ProductVariant/9042811584724",
        "displayProduct": "U1tra Watch",
        "realProduct": "BackedStock® U Watch"
    },
    "R0LEX_WATCH_SUPPLIER": {
        "storeBVariantId": "gid://shopify/ProductVariant/9042811519188",
        "displayProduct": "R0lex Watch",
        "realProduct": "BackedStock® R Watch"
    },
    "MOSSINAITE_WATCH_SUPPLIER": {
        "storeBVariantId": "gid://shopify/ProductVariant/9042811683028",
        "displayProduct": "Mossinaite Watch",
        "realProduct": "BackedStock® M Watch"
    },
    
    // CHROME HEARTS ITEMS
    "CHR0M3_BELT_SUPPLIER": {
        "storeBVariantId": "gid://shopify/ProductVariant/9042813354196",
        "displayProduct": "Chr0m3 Belt",
        "realProduct": "BackedStock® C Belt"
    },
    "CHR0M3_JEANS_SUPPLIER": {
        "storeBVariantId": "gid://shopify/ProductVariant/9042812502228",
        "displayProduct": "Chr0m3 Jeans",
        "realProduct": "BackedStock® Pants"
    },
    "CHR0M3_JERSEY_SUPPLIER": {
        "storeBVariantId": "gid://shopify/ProductVariant/9042812829908",
        "displayProduct": "Chr0m3 Jersey",
        "realProduct": "BackedStock® C Jersey"
    },
    "CHR0M3_JEWLERY_SUPPLIER": {
        "storeBVariantId": "gid://shopify/ProductVariant/9042812076244",
        "displayProduct": "Chr0m3 Jewlery",
        "realProduct": "BackedStock® C Jewelry"
    },
    "CHR0M3_T_SHIRTS_COPY_SUPPLIER": {
        "storeBVariantId": "gid://shopify/ProductVariant/9042812731604",
        "displayProduct": "Chr0m3 T-Shirts",
        "realProduct": "BackedStock® C Shirt"
    },
    "CHR0M3_TRUCKER_HAT_SUPPLIER": {
        "storeBVariantId": "gid://shopify/ProductVariant/9042812928212",
        "displayProduct": "Chr0m3 Trucker Hat",
        "realProduct": "BackedStock® C Hat"
    },
    
    // CLOTHING - MASSIVE CONSOLIDATION (3→1 hoodies, 3→1 pants)
    "DEN1M_SWEAT_PANTS_SUPPLIER": {
        "storeBVariantId": "gid://shopify/ProductVariant/9042812502228",
        "displayProduct": "Den1m Sweat Pants",
        "realProduct": "BackedStock® Pants"
    },
    "DEN1M_HOODIE_SUPPLIER": {
        "storeBVariantId": "gid://shopify/ProductVariant/9042812633300",
        "displayProduct": "Den1m hoodie",
        "realProduct": "BackedStock® Hoodie"
    },
    "ESSCENTIALS_HOODIE_SUPPLIER": {
        "storeBVariantId": "gid://shopify/ProductVariant/9042812633300",
        "displayProduct": "Esscentials Hoodie",
        "realProduct": "BackedStock® Hoodie"
    },
    "SPYDUR_SWEAT_PANTS_SUPPLIER": {
        "storeBVariantId": "gid://shopify/ProductVariant/9042812502228",
        "displayProduct": "Spydur Sweat Pants",
        "realProduct": "BackedStock® Pants"
    },
    "SPYDUR_HOODIE_SUPPLIER": {
        "storeBVariantId": "gid://shopify/ProductVariant/9042812633300",
        "displayProduct": "Spydur Hoodie",
        "realProduct": "BackedStock® Hoodie"
    },
    
    // LV ITEMS
    "LV1_BELT_SUPPLIER": {
        "storeBVariantId": "gid://shopify/ProductVariant/9042813190356",
        "displayProduct": "Lv1 Belt",
        "realProduct": "BackedStock® L Belt"
    },
    "LV1_BRACELET_SUPPLIER": {
        "storeBVariantId": "gid://shopify/ProductVariant/9042811912404",
        "displayProduct": "Lv1 Bracelet",
        "realProduct": "BackedStock® L Bracelet"
    },
    "LV1_WALLET_SUPPLIER": {
        "storeBVariantId": "gid://shopify/ProductVariant/9042813485268",
        "displayProduct": "Lv1 Wallet",
        "realProduct": "BackedStock® L Wallet"
    },
    
    // SHOES
    "J4_SHOES_SUPPLIER": {
        "storeBVariantId": "gid://shopify/ProductVariant/9042813059284",
        "displayProduct": "J4 shoes",
        "realProduct": "BackedStock® Shoes"
    },
    "MAXES_SUPPLIER": {
        "storeBVariantId": "gid://shopify/ProductVariant/9042815320276",
        "displayProduct": "Maxes",
        "realProduct": "BackedStock® Maxes"
    },
    "SLIDEZZ_SUPPLIER": {
        "storeBVariantId": "gid://shopify/ProductVariant/9042813124820",
        "displayProduct": "Slidezz",
        "realProduct": "BackedStock® Slides"
    },
    
    // TECH - CONSOLIDATION (2→1 phones, 2→1 computers)
    "J8L_SPEAKER_SUPPLIER": {
        "storeBVariantId": "gid://shopify/ProductVariant/9042814140628",
        "displayProduct": "J8L Speaker",
        "realProduct": "BackedStock® Speaker"
    },
    "PODS_3_SUPPLIER": {
        "storeBVariantId": "gid://shopify/ProductVariant/9042814042324",
        "displayProduct": "Pods 3",
        "realProduct": "BackedStock® Pods 3"
    },
    "PODS_PRO_2_SUPPLIER": {
        "storeBVariantId": "gid://shopify/ProductVariant/9042813944020",
        "displayProduct": "Pods Pro 2",
        "realProduct": "BackedStock® Pods 2"
    },
    "PHONE_16_PRO_SUPPLIER": {
        "storeBVariantId": "gid://shopify/ProductVariant/9042814501076",
        "displayProduct": "Phone 16 Pro",
        "realProduct": "BackedStock® Phone"
    },
    "PHONE_16_PRO_MAX_SUPPLIER": {
        "storeBVariantId": "gid://shopify/ProductVariant/9042814501076",
        "displayProduct": "Phone 16 Pro Max",
        "realProduct": "BackedStock® Phone"
    },
    "M4CBOOK_AIR_SUPPLIER": {
        "storeBVariantId": "gid://shopify/ProductVariant/9042814664916",
        "displayProduct": "M4cBook Air",
        "realProduct": "BackedStock® Computer"
    },
    "M4CBOOK_PRO_SUPPLIER": {
        "storeBVariantId": "gid://shopify/ProductVariant/9042814664916",
        "displayProduct": "M4cBook Pro",
        "realProduct": "BackedStock® Computer"
    },
    
    // ACCESSORIES
    "PR4DA_SUNGLASSES_SUPPLIER": {
        "storeBVariantId": "gid://shopify/ProductVariant/9042812240084",
        "displayProduct": "Pr4da Sunglasses",
        "realProduct": "BackedStock® P Glasses"
    },
    "N1KE_ELITE_BAG_SUPPLIER": {
        "storeBVariantId": "gid://shopify/ProductVariant/9042811453652",
        "displayProduct": "N1ke Elite bag",
        "realProduct": "BackedStock® N Bag"
    },
    "G0YARDDD_SUPPLIER": {
        "storeBVariantId": "gid://shopify/ProductVariant/9042811388116",
        "displayProduct": "G0yarddd",
        "realProduct": "BackedStock® G Bag"
    },
    "MOSSINAITE_T3NNIS_BRACLET_SUPPLIER": {
        "storeBVariantId": "gid://shopify/ProductVariant/9042811945172",
        "displayProduct": "Mossinaite T3nnis Braclet",
        "realProduct": "BackedStock® M Bracelet"
    },
    
    // MISC
    "LABUABABA_SUPPLIER": {
        "storeBVariantId": "gid://shopify/ProductVariant/9042815025364",
        "displayProduct": "Labuababa",
        "realProduct": "BackedStock® Plushie"
    },
    "LEGGO_SUPPLIER": {
        "storeBVariantId": "gid://shopify/ProductVariant/9042815090900",
        "displayProduct": "Leggo",
        "realProduct": "BackedStock® Bricks"
    },
    
    // BUNDLES
    "BEST_SELLER_ACCESSORIES_BUNDLE_SUPPLIER": {
        "storeBVariantId": "gid://shopify/ProductVariant/9042813780180",
        "displayProduct": "(BEST SELLER) Accessories Bundle",
        "realProduct": "BackedStock® Accessories Bundle"
    },
    "BEST_SELLER_ALL_ELECTRONICS_BUNDLE_PACK_SUPPLIER": {
        "storeBVariantId": "gid://shopify/ProductVariant/9042814763220",
        "displayProduct": "(BEST SELLER) All Electronics Bundle Pack",
        "realProduct": "BackedStock® Electronic Bundle"
    },
    "BEST_SELLER_FRAGRANCES_BUNDLE_SUPPLIER": {
        "storeBVariantId": "gid://shopify/ProductVariant/9042810994900",
        "displayProduct": "(BEST SELLER) Fragrances Bundle",
        "realProduct": "BackedStock® Cologne Bundle"
    },
    "BEST_SELLER_LV1_BUNDLE_PACK_SUPPLIER": {
        "storeBVariantId": "gid://shopify/ProductVariant/9042813681876",
        "displayProduct": "(BEST SELLER) Lv1 Bundle Pack",
        "realProduct": "BackedStock® L Bundle"
    }
};

// Shopify Storefront API configuration
const STOREFRONT_API_URL = `https://${process.env.STORE_B_DOMAIN}/api/2024-01/graphql.json`;
const STOREFRONT_ACCESS_TOKEN = process.env.STOREFRONT_ACCESS_TOKEN;

/**
 * Create cart on Store B using Shopify Storefront API
 */
async function createShopifyCart(items) {
    const cartCreateMutation = `
        mutation cartCreate($input: CartInput!) {
            cartCreate(input: $input) {
                cart {
                    id
                    webUrl
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
        
        console.log(`🔄 Mapping: ${item.sku} → ${mapping.realProduct} (${mapping.storeBVariantId})`);
        
        return {
            merchandiseId: mapping.storeBVariantId,
            quantity: item.quantity,
            attributes: item.properties || []
        };
    });

    const variables = {
        input: {
            lines: mappedLines
        }
    };

    try {
        const response = await fetch(STOREFRONT_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Shopify-Storefront-Access-Token': STOREFRONT_ACCESS_TOKEN,
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
 * Main bridge endpoint
 */
app.post('/checkout-bridge', async (req, res) => {
    try {
        console.log('🌉 Bridge request received:', JSON.stringify(req.body, null, 2));
        
        const { items, note, attributes } = req.body;
        
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ 
                error: 'Invalid cart data - no items found' 
            });
        }

        // Log the mapping attempt for debugging
        console.log('🗺️  Mapping items:');
        items.forEach(item => {
            const mapping = SKU_MAPPING[item.sku];
            console.log(`  ${item.sku} → ${mapping ? mapping.realProduct : '❌ NOT FOUND'}`);
        });

        // Create cart on Store B
        const cart = await createShopifyCart(items);
        
        // Set privacy headers
        res.set({
            'Referrer-Policy': 'no-referrer',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'X-Frame-Options': 'DENY'
        });

        console.log('✅ Cart created successfully:', cart.id);
        console.log('🔗 Checkout URL:', cart.checkoutUrl || cart.webUrl);
        
        // Return the checkout URL
        res.json({
            success: true,
            cartId: cart.id,
            checkoutUrl: cart.checkoutUrl || cart.webUrl,
            webUrl: cart.webUrl,
            itemsProcessed: items.length,
            message: `Successfully mapped ${items.length} items to Store B`
        });

    } catch (error) {
        console.error('❌ Bridge error:', error);
        res.status(500).json({
            error: 'Cart creation failed',
            message: error.message,
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
    res.json({ 
        status: '🚀 READY TO CLOAK!', 
        timestamp: new Date().toISOString(),
        environment: {
            storeBDomain: process.env.STORE_B_DOMAIN || '❌ NOT_SET',
            storeADomain: process.env.STORE_A_DOMAIN || '❌ NOT_SET',
            hasStorefrontToken: !!process.env.STOREFRONT_ACCESS_TOKEN,
            totalMappings: Object.keys(SKU_MAPPING).length,
            consolidationPower: {
                fragrances: '6→1',
                hoodies: '3→1', 
                pants: '3→1',
                phones: '2→1',
                computers: '2→1'
            }
        }
    });
});

/**
 * Get mapping info
 */
app.get('/mapping', (req, res) => {
    const consolidationStats = {};
    const variantCounts = {};
    
    // Count how many Store A SKUs map to each Store B variant
    Object.values(SKU_MAPPING).forEach(mapping => {
        const variantId = mapping.storeBVariantId;
        if (!variantCounts[variantId]) {
            variantCounts[variantId] = [];
        }
        variantCounts[variantId].push(mapping.displayProduct);
    });
    
    // Find consolidations (multiple → one)
    Object.entries(variantCounts).forEach(([variantId, products]) => {
        if (products.length > 1) {
            const realProduct = SKU_MAPPING[Object.keys(SKU_MAPPING).find(sku => 
                SKU_MAPPING[sku].storeBVariantId === variantId
            )].realProduct;
            
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
            realProduct: mapping.realProduct,
            hasRealVariantId: !mapping.storeBVariantId.includes('TEMP')
        }))
    });
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('💥 Unhandled error:', error);
    res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ 
        error: 'Endpoint not found',
        availableEndpoints: ['/health', '/mapping', '/checkout-bridge']
    });
});

app.listen(PORT, () => {
    console.log('🚀🎭 SHOPIFY CLOAKING BRIDGE READY!');
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`🗺️  Mapping info: http://localhost:${PORT}/mapping`);
    console.log(`🌉 Bridge endpoint: POST /checkout-bridge`);
    console.log(`🔗 Store A Domain: ${process.env.STORE_A_DOMAIN || '❌ NOT_SET'}`);
    console.log(`🏪 Store B Domain: ${process.env.STORE_B_DOMAIN || '❌ NOT_SET'}`);
    console.log(`📦 Total SKU mappings: ${Object.keys(SKU_MAPPING).length}`);
    console.log(`🎯 Consolidation power: 6 fragrances→1, 3 hoodies→1, 3 pants→1`);
    console.log('💪 READY TO PROCESS ORDERS WITH REAL VARIANT IDS!');
});

module.exports = app;
