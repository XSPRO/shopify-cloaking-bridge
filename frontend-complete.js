/**
 * Shopify Cloaking Frontend Script - COMPLETE VERSION
 * Add this to Store A theme.liquid before </body>
 * Replace BRIDGE_URL with your actual Railway URL when deploying
 */

(function() {
    'use strict';
    
    const BRIDGE_URL = 'shopify-cloaking-bridge-production.up.railway.app'; // REPLACE WITH YOUR ACTUAL RAILWAY URL
    const DEBUG = true; // Set to false in production
    
    function log(...args) {
        if (DEBUG) console.log('[🎭 Shopify Cloaking]', ...args);
    }
    
    /**
     * Get current cart data from Shopify
     */
    async function getCurrentCart() {
        try {
            const response = await fetch('/cart.js');
            if (!response.ok) throw new Error(`Failed to fetch cart: ${response.status}`);
            const cartData = await response.json();
            log('Cart fetched:', cartData);
            return cartData;
        } catch (error) {
            log('Error fetching cart:', error);
            throw error;
        }
    }
    
    /**
     * Send cart to bridge and get checkout URL
     */
    async function sendCartToBridge(cartData) {
        try {
            log('Sending cart to bridge:', cartData);
            
            const response = await fetch(`${BRIDGE_URL}/checkout-bridge`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    items: cartData.items,
                    note: cartData.note,
                    attributes: cartData.attributes,
                    token: cartData.token
                }),
                credentials: 'omit' // Important: don't send cookies
            });
            
            log('Bridge response status:', response.status);
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Bridge responded with status: ${response.status} - ${errorText}`);
            }
            
            const result = await response.json();
            log('Bridge response data:', result);
            return result;
            
        } catch (error) {
            log('Error communicating with bridge:', error);
            throw error;
        }
    }
    
    /**
     * Show loading state on button
     */
    function setButtonLoading(button, loading) {
        if (loading) {
            button.dataset.originalText = button.textContent;
            button.textContent = 'Processing...';
            button.disabled = true;
            button.style.opacity = '0.7';
        } else {
            button.textContent = button.dataset.originalText || 'Checkout';
            button.disabled = false; 
            button.style.opacity = '1';
        }
    }
    
    /**
     * Handle checkout redirect through bridge
     */
    async function handleCheckoutRedirect(event) {
        const button = event.target;
        setButtonLoading(button, true);
        
        try {
            log('🚀 Starting checkout redirect process');
            
            // Get current cart
            const cart = await getCurrentCart();
            
            if (!cart.items || cart.items.length === 0) {
                alert('Your cart is empty. Please add some items before checking out.');
                return;
            }
            
            log('📦 Cart has', cart.items.length, 'items');
            
            // Log cart items for debugging
            cart.items.forEach((item, index) => {
                log(`Item ${index + 1}:`, {
                    sku: item.sku,
                    title: item.title || item.product_title,
                    quantity: item.quantity
                });
            });
            
            // Send to bridge
            log('🌉 Sending cart to bridge');
            const bridgeResponse = await sendCartToBridge(cart);
            
            if (bridgeResponse.success && bridgeResponse.checkoutUrl) {
                // Redirect to Store B checkout
                log('✅ Redirecting to:', bridgeResponse.checkoutUrl);
                window.location.href = bridgeResponse.checkoutUrl;
            } else {
                throw new Error(bridgeResponse.message || 'Bridge did not return a valid checkout URL');
            }
            
        } catch (error) {
            log('❌ Checkout redirect failed:', error);
            
            // Show error to user
            const errorMessage = error.message.includes('404') 
                ? 'Checkout service temporarily unavailable. Please try again.' 
                : 'There was an issue processing your checkout. Please try again or contact support.';
                
            alert(errorMessage);
            
            // Fallback to normal Shopify checkout
            log('🔄 Falling back to normal checkout');
            window.location.href = '/checkout';
            
        } finally {
            setButtonLoading(button, false);
        }
    }
    
    /**
     * Intercept checkout buttons and forms
     */
    function interceptCheckoutElements() {
        // Comprehensive list of checkout selectors
        const checkoutSelectors = [
            // Standard checkout buttons
            'input[name="add"][type="submit"]',
            'button[name="add"]',
            '.btn[href*="checkout"]',
            'a[href*="checkout"]',
            '.checkout-button',
            'button[type="submit"][name="add"]',
            
            // Cart checkout buttons
            '.cart__checkout-button',
            '.cart-drawer__checkout-button', 
            '.cart__submit-button',
            '.cart-form__checkout-button',
            
            // Common theme selectors
            '.btn--checkout',
            '.checkout-btn', 
            '.proceed-to-checkout',
            '.cart-checkout',
            
            // Drawer/popup cart buttons
            '.js-checkout-button',
            '[data-checkout-button]',
            '.ajax-cart__checkout',
            
            // Buy now buttons (if applicable)
            '.shopify-payment-button__button',
            '.dynamic-checkout__content button'
        ];
        
        let interceptedCount = 0;
        
        checkoutSelectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                // Skip if already intercepted
                if (element.hasAttribute('data-cloaked')) return;
                
                // Skip Shopify's dynamic checkout buttons (Apple Pay, etc.)
                if (element.closest('.shopify-payment-button') && 
                    !element.classList.contains('shopify-payment-button__button--unbranded')) {
                    return;
                }
                
                element.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    handleCheckoutRedirect(e);
                });
                
                // Mark as intercepted
                element.setAttribute('data-cloaked', 'true');
                interceptedCount++;
                log('🎯 Intercepted:', selector);
            });
        });
        
        if (interceptedCount > 0) {
            log(`✅ Intercepted ${interceptedCount} checkout elements`);
        }
    }
    
    /**
     * Test bridge connectivity
     */
    async function testBridge() {
        if (!DEBUG) return;
        
        try {
            const response = await fetch(`${BRIDGE_URL}/health`);
            if (response.ok) {
                const health = await response.json();
                log('🏥 Bridge health check:', health);
            } else {
                log('⚠️ Bridge health check failed:', response.status);
            }
        } catch (error) {
            log('⚠️ Cannot connect to bridge:', error.message);
        }
    }
    
    /**
     * Initialize when DOM is ready
     */
    function initialize() {
        log('🎭 Initializing Shopify cloaking system');
        log('🌉 Bridge URL:', BRIDGE_URL);
        
        // Test bridge connectivity
        testBridge();
        
        // Intercept existing elements
        interceptCheckoutElements();
        
        // Watch for dynamically added elements (AJAX carts, etc.)
        const observer = new MutationObserver(function(mutations) {
            let shouldReintercept = false;
            
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            // Check if added node contains checkout elements
                            const hasCheckoutElements = node.querySelector && (
                                node.querySelector('.checkout') || 
                                node.querySelector('[href*="checkout"]') ||
                                node.querySelector('.cart')
                            );
                            if (hasCheckoutElements) {
                                shouldReintercept = true;
                            }
                        }
                    });
                }
            });
            
            if (shouldReintercept) {
                log('🔄 Re-intercepting due to DOM changes');
                interceptCheckoutElements();
            }
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        log('✅ Shopify cloaking initialized successfully');
        
        // Show debug info
        if (DEBUG) {
            console.log('%c🎭 Shopify Cloaking Active', 'color: #ff6b6b; font-weight: bold; font-size: 14px;');
            console.log('Bridge URL:', BRIDGE_URL);
            console.log('Debug mode: ON');
        }
    }
    
    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }
    
    // Expose for debugging (only in debug mode)
    if (DEBUG) {
        window.ShopifyCloaking = {
            getCurrentCart,
            sendCartToBridge,
            handleCheckoutRedirect,
            interceptCheckoutElements,
            testBridge,
            BRIDGE_URL
        };
        
        log('🛠️ Debug tools available at window.ShopifyCloaking');
    }
    
})();
