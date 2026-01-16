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

/**
 * ROOT ROUTE (IMPORTANT FOR RAILWAY)
 */
app.get("/", (req, res) => {
    res.status(200).send("Shopify Cloaking Bridge is LIVE");
});

// COMPLETE SKU MAPPING WITH REAL VARIANT IDs! 🚀
const SKU_MAPPING = {
    "VALENT1NO_SUPPLIER": {
        storeBVariantId: "gid://shopify/ProductVariant/9042810929364",
        displayProduct: "Valent1no",
        realProduct: "BackedStock® Cologne"
    },
    "T0M_F0RD_SUPPLIER": {
        storeBVariantId: "gid://shopify/ProductVariant/9042810929364",
        displayProduct: "T0m F0rd",
        realProduct: "BackedStock® Cologne"
    },
    "BAKARAT_SUPPLIER": {
        storeBVariantId: "gid://shopify/ProductVariant/9042810929364",
        displayProduct: "Bakarat",
        realProduct: "BackedStock® Cologne"
    },
    "CR3EED_SUPPLIER": {
        storeBVariantId: "gid://shopify/ProductVariant/9042810929364",
        displayProduct: "Cr3eed",
        realProduct: "BackedStock® Cologne"
    },
    "DI0R_SUPPLIER": {
        storeBVariantId: "gid://shopify/ProductVariant/9042810929364",
        displayProduct: "Di0r",
        realProduct: "BackedStock® Cologne"
    },
    "JPG1_FRAGRANCE_SUPPLIER": {
        storeBVariantId: "gid://shopify/ProductVariant/9042810929364",
        displayProduct: "JPG1 Fragrance",
        realProduct: "BackedStock® Cologne"
    },

    "U1TRA_WATCH_SUPPLIER": {
        storeBVariantId: "gid://shopify/ProductVariant/9042811584724",
        displayProduct: "U1tra Watch",
        realProduct: "BackedStock® U Watch"
    },
    "R0LEX_WATCH_SUPPLIER": {
        storeBVariantId: "gid://shopify/ProductVariant/9042811519188",
        displayProduct: "R0lex Watch",
        realProduct: "BackedStock® R Watch"
    },
    "MOSSINAITE_WATCH_SUPPLIER": {
        storeBVariantId: "gid://shopify/ProductVariant/9042811683028",
        displayProduct: "Mossinaite Watch",
        realProduct: "BackedStock® M Watch"
    },

    "CHR0M3_BELT_SUPPLIER": {
        storeBVariantId: "gid://shopify/ProductVariant/9042813354196",
        displayProduct: "Chr0m3 Belt",
        realProduct: "BackedStock® C Belt"
    },
    "CHR0M3_JEANS_SUPPLIER": {
        storeBVariantId: "gid://shopify/ProductVariant/9042812502228",
        displayProduct: "Chr0m3 Jeans",
        realProduct: "BackedStock® Pants"
    },
    "CHR0M3_JERSEY_SUPPLIER": {
        storeBVariantId: "gid://shopify/ProductVariant/9042812829908",
        displayProduct: "Chr0m3 Jersey",
        realProduct: "BackedStock® C Jersey"
    },
    "CHR0M3_JEWLERY_SUPPLIER": {
        storeBVariantId: "gid://shopify/ProductVariant/9042812076244",
        displayProduct: "Chr0m3 Jewlery",
        realProduct: "BackedStock® C Jewelry"
    },
    "CHR0M3_T_SHIRTS_COPY_SUPPLIER": {
        storeBVariantId: "gid://shopify/ProductVariant/9042812731604",
        displayProduct: "Chr0m3 T-Shirts",
        realProduct: "BackedStock® C Shirt"
    },
    "CHR0M3_TRUCKER_HAT_SUPPLIER": {
        storeBVariantId: "gid://shopify/ProductVariant/9042812928212",
        displayProduct: "Chr0m3 Trucker Hat",
        realProduct: "BackedStock® C Hat"
    },

    "DEN1M_SWEAT_PANTS_SUPPLIER": {
        storeBVariantId: "gid://shopify/ProductVariant/9042812502228",
        displayProduct: "Den1m Sweat Pants",
        realProduct: "BackedStock® Pants"
    },
    "DEN1M_HOODIE_SUPPLIER": {
        storeBVariantId: "gid://shopify/ProductVariant/9042812633300",
        displayProduct: "Den1m hoodie",
        realProduct: "BackedStock® Hoodie"
    },
    "ESSCENTIALS_HOODIE_SUPPLIER": {
        storeBVariantId: "gid://shopify/ProductVariant/9042812633300",
        displayProduct: "Esscentials Hoodie",
        realProduct: "BackedStock® Hoodie"
    },
    "SPYDUR_SWEAT_PANTS_SUPPLIER": {
        storeBVariantId: "gid://shopify/ProductVariant/9042812502228",
        displayProduct: "Spydur Sweat Pants",
        realProduct: "BackedStock® Pants"
    },
    "SPYDUR_HOODIE_SUPPLIER": {
        storeBVariantId: "gid://shopify/ProductVariant/9042812633300",
        displayProduct: "Spydur Hoodie",
        realProduct: "BackedStock® Hoodie"
    },

    "LV1_BELT_SUPPLIER": {
        storeBVariantId: "gid://shopify/ProductVariant/9042813190356",
        displayProduct: "Lv1 Belt",
        realProduct: "BackedStock® L Belt"
    },
    "LV1_BRACELET_SUPPLIER": {
        storeBVariantId: "gid://shopify/ProductVariant/9042811912404",
        displayProduct: "Lv1 Bracelet",
        realProduct: "BackedStock® L Bracelet"
    },
    "LV1_WALLET_SUPPLIER": {
        storeBVariantId: "gid://shopify/ProductVariant/9042813485268",
        displayProduct: "Lv1 Wallet",
        realProduct: "BackedStock® L Wallet"
    },

    "J4_SHOES_SUPPLIER": {
        storeBVariantId: "gid://shopify/ProductVariant/9042813059284",
        displayProduct: "J4 shoes",
        realProduct: "BackedStock® Shoes"
    },
    "MAXES_SUPPLIER": {
        storeBVariantId: "gid://shopify/ProductVariant/9042815320276",
        displayProduct: "Maxes",
        realProduct: "BackedStock® Maxes"
    },
    "SLIDEZZ_SUPPLIER": {
        storeBVariantId: "gid://shopify/ProductVariant/9042813124820",
        displayProduct: "Slidezz",
        realProduct: "BackedStock® Slides"
    },

    "J8L_SPEAKER_SUPPLIER": {
        storeBVariantId: "gid://shopify/ProductVariant/9042814140628",
        displayProduct: "J8L Speaker",
        realProduct: "BackedStock® Speaker"
    },
    "PODS_3_SUPPLIER": {
        storeBVariantId: "gid://shopify/ProductVariant/9042814042324",
        displayProduct: "Pods 3",
        realProduct: "BackedStock® Pods 3"
    },
    "PODS_PRO_2_SUPPLIER": {
        storeBVariantId: "gid://shopify/ProductVariant/9042813944020",
        displayProduct: "Pods Pro 2",
        realProduct: "BackedStock® Pods 2"
    },

    "PHONE_16_PRO_SUPPLIER": {
        storeBVariantId: "gid://shopify/ProductVariant/9042814501076",
        displayProduct: "Phone 16 Pro",
        realProduct: "BackedStock® Phone"
    },
    "PHONE_16_PRO_MAX_SUPPLIER": {
        storeBVariantId: "gid://shopify/ProductVariant/9042814501076",
        displayProduct: "Phone 16 Pro Max",
        realProduct: "BackedStock® Phone"
    },

    "M4CBOOK_AIR_SUPPLIER": {
        storeBVariantId: "gid://shopify/ProductVariant/9042814664916",
        displayProduct: "M4cBook Air",
        realProduct: "BackedStock® Computer"
    },
    "M4CBOOK_PRO_SUPPLIER": {
        storeBVariantId: "gid://shopify/ProductVariant/9042814664916",
        displayProduct: "M4cBook Pro",
        realProduct: "BackedStock® Computer"
    }
};

// HEALTH CHECK
app.get('/health', (req, res) => {
    res.json({
        status: '🚀 READY TO CLOAK!',
        port: PORT,
        timestamp: new Date().toISOString()
    });
});

// 404 handler (LAST)
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Endpoint not found',
        availableEndpoints: ['/', '/health', '/mapping', '/checkout-bridge']
    });
});

// 🚀 LISTEN (RAILWAY FIX)
app.listen(PORT, "0.0.0.0", () => {
    console.log('🚀 SHOPIFY CLOAKING BRIDGE READY!');
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
});

module.exports = app;
