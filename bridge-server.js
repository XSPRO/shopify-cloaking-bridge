// UPDATED /checkout-bridge endpoint
// This returns a 302 redirect instead of JSON response

app.post('/checkout-bridge', async (req, res) => {
    try {
        console.log('🌉 Bridge request received');
        console.log('📦 Cart items:', JSON.stringify(req.body.items, null, 2));
        
        const { items } = req.body;
        
        if (!items || !Array.isArray(items) || items.length === 0) {
            console.error('❌ No items in request');
            return res.status(400).send('Invalid cart data - no items found');
        }

        console.log(`📋 Processing ${items.length} item(s)`);
        
        // Check SKU mapping
        const missingSkus = [];
        items.forEach((item, index) => {
            console.log(`   Item ${index + 1}:`, {
                sku: item.sku,
                title: item.product_title || item.title,
                quantity: item.quantity
            });
            
            if (!item.sku) {
                missingSkus.push(`Item ${index + 1} has no SKU`);
            } else if (!SKU_MAPPING[item.sku]) {
                missingSkus.push(`SKU "${item.sku}" not found in mapping`);
            }
        });
        
        if (missingSkus.length > 0) {
            console.error('❌ SKU mapping errors:', missingSkus);
            return res.status(400).send('SKU mapping failed: ' + missingSkus.join('; '));
        }

        // Create cart on Store B
        console.log('✅ All SKUs mapped, creating cart on Store B...');
        const cart = await createShopifyCart(items);
        
        const checkoutUrl = cart.checkoutUrl || cart.webUrl;
        
        console.log('✅ Cart created successfully:', cart.id);
        console.log('🔗 Checkout URL:', checkoutUrl);
        
        // Set privacy headers and return 302 redirect
        res.set({
            'Referrer-Policy': 'no-referrer',
            'Cache-Control': 'no-cache, no-store, must-revalidate'
        });
        
        console.log('↪️  Sending 302 redirect to:', checkoutUrl);
        
        // THIS IS THE KEY CHANGE - Return 302 redirect instead of JSON
        return res.redirect(302, checkoutUrl);

    } catch (error) {
        console.error('❌ Bridge error:', error.message);
        console.error('Stack:', error.stack);
        return res.status(500).send('Cart creation failed: ' + error.message);
    }
});
