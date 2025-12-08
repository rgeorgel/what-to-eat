/**
 * Media.net Ad Integration
 * Handles ad initialization, lazy loading, and cookie consent
 */

// Configuration
const MEDIANET_CONFIG = {
    // IMPORTANT: Replace with your actual Media.net Customer ID (CID)
    customerId: 'XXXXXXXX',  // Format: 8 digits (e.g., 12345678)

    // Ad unit IDs - Replace with your actual ad unit IDs from Media.net
    adUnits: {
        topBanner: 'XXXXXXXXXX',       // Top banner ad unit ID
        horizontalBanner: 'XXXXXXXXXX', // Horizontal banner ad unit ID
        sidebar: 'XXXXXXXXXX',          // Sidebar ad unit ID
        bottomBanner: 'XXXXXXXXXX',     // Bottom banner ad unit ID
        inFeed: 'XXXXXXXXXX'            // In-feed ad unit ID
    },

    // Ad formats (Media.net standard sizes)
    adFormats: {
        topBanner: { width: 728, height: 90 },        // Leaderboard
        horizontalBanner: { width: 728, height: 90 }, // Leaderboard
        sidebar: { width: 300, height: 600 },         // Half Page
        bottomBanner: { width: 728, height: 90 },     // Leaderboard
        inFeed: { width: 336, height: 280 }           // Large Rectangle
    }
};

// Cookie consent state
let cookieConsentGiven = false;

/**
 * Initialize ads system on page load
 */
document.addEventListener('DOMContentLoaded', () => {
    initializeCookieConsent();

    // Check if consent was previously given
    if (hasConsentCookie()) {
        cookieConsentGiven = true;
        initializeAds();
    } else {
        showCookieConsent();
    }
});

/**
 * Check if user has previously given consent
 */
function hasConsentCookie() {
    return localStorage.getItem('cookieConsent') === 'accepted';
}

/**
 * Set cookie consent in localStorage
 */
function setConsentCookie(accepted) {
    localStorage.setItem('cookieConsent', accepted ? 'accepted' : 'declined');
    localStorage.setItem('cookieConsentDate', new Date().toISOString());
}

/**
 * Show cookie consent banner
 */
function showCookieConsent() {
    const banner = document.getElementById('cookieConsent');
    if (banner) {
        banner.classList.remove('hidden');
    }
}

/**
 * Hide cookie consent banner
 */
function hideCookieConsent() {
    const banner = document.getElementById('cookieConsent');
    if (banner) {
        banner.classList.add('hidden');
    }
}

/**
 * Initialize cookie consent event listeners
 */
function initializeCookieConsent() {
    const acceptBtn = document.getElementById('acceptCookies');
    const declineBtn = document.getElementById('declineCookies');
    const privacyLink = document.getElementById('privacyPolicyLink');

    if (acceptBtn) {
        acceptBtn.addEventListener('click', () => {
            cookieConsentGiven = true;
            setConsentCookie(true);
            hideCookieConsent();
            initializeAds();
        });
    }

    if (declineBtn) {
        declineBtn.addEventListener('click', () => {
            cookieConsentGiven = false;
            setConsentCookie(false);
            hideCookieConsent();
            showAdPlaceholders();
        });
    }

    if (privacyLink) {
        privacyLink.addEventListener('click', (e) => {
            e.preventDefault();
            showPrivacyInfo();
        });
    }
}

/**
 * Show privacy information
 */
function showPrivacyInfo() {
    alert('Privacy Policy:\n\nWe use cookies and third-party advertising services (Media.net) to:\n' +
          '- Improve your browsing experience\n' +
          '- Show personalized advertisements\n' +
          '- Analyze site traffic\n\n' +
          'You can change your consent preferences at any time by clearing your browser localStorage.');
}

/**
 * Initialize all Media.net ads
 */
function initializeAds() {
    if (!cookieConsentGiven) {
        console.log('Ads not initialized - cookie consent required');
        return;
    }

    // Load Media.net script
    loadMediaNetScript();

    // Initialize static ads with lazy loading
    initializeLazyAds();

    // Initialize in-feed ads (inserted between restaurant cards)
    setTimeout(() => {
        insertInFeedAds();
    }, 2000); // Wait for content to load
}

/**
 * Load Media.net script dynamically
 */
function loadMediaNetScript() {
    // Check if script is already loaded
    if (window._mNHandle) {
        return;
    }

    const script = document.createElement('script');
    script.id = 'media-net-script';
    script.type = 'text/javascript';
    script.async = true;
    script.src = '//contextual.media.net/dmedianet.js?cid=' + MEDIANET_CONFIG.customerId;

    script.onerror = () => {
        console.error('Failed to load Media.net script');
        showAdPlaceholders();
    };

    document.body.appendChild(script);
}

/**
 * Initialize ads with lazy loading (load when visible)
 */
function initializeLazyAds() {
    const adContainers = [
        { id: 'ad-top-banner', unitId: MEDIANET_CONFIG.adUnits.topBanner, format: 'topBanner' },
        { id: 'ad-horizontal-banner', unitId: MEDIANET_CONFIG.adUnits.horizontalBanner, format: 'horizontalBanner' },
        { id: 'ad-sidebar', unitId: MEDIANET_CONFIG.adUnits.sidebar, format: 'sidebar' },
        { id: 'ad-bottom-banner', unitId: MEDIANET_CONFIG.adUnits.bottomBanner, format: 'bottomBanner' }
    ];

    // Use Intersection Observer for lazy loading
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const adConfig = adContainers.find(ad => ad.id === entry.target.id);
                    if (adConfig && !entry.target.dataset.adLoaded) {
                        loadMediaNetAd(adConfig);
                        entry.target.dataset.adLoaded = 'true';
                        observer.unobserve(entry.target);
                    }
                }
            });
        }, {
            rootMargin: '200px' // Start loading 200px before the ad becomes visible
        });

        adContainers.forEach(adConfig => {
            const element = document.getElementById(adConfig.id);
            if (element) {
                observer.observe(element);
            }
        });
    } else {
        // Fallback: load all ads immediately if Intersection Observer not supported
        adContainers.forEach(loadMediaNetAd);
    }
}

/**
 * Load a specific Media.net ad
 */
function loadMediaNetAd(adConfig) {
    const container = document.getElementById(adConfig.id);
    if (!container) return;

    const format = MEDIANET_CONFIG.adFormats[adConfig.format];

    // Create Media.net ad container
    const adDiv = document.createElement('div');
    adDiv.id = `${adConfig.id}-medianet`;

    // Set responsive or fixed size based on screen width
    if (window.innerWidth <= 768) {
        // Mobile: use smaller responsive ads
        adDiv.style.width = '320px';
        adDiv.style.height = '50px';
    } else {
        // Desktop: use standard sizes
        adDiv.style.width = format.width + 'px';
        adDiv.style.height = format.height + 'px';
    }

    adDiv.style.margin = '0 auto';

    container.appendChild(adDiv);

    // Initialize Media.net ad
    try {
        window._mNDetails = window._mNDetails || {};
        window._mNDetails.loadTag = window._mNDetails.loadTag || [];

        window._mNDetails.loadTag.push({
            tag: adDiv.id,
            uid: MEDIANET_CONFIG.adUnits[adConfig.format],
            size: [[format.width, format.height]]
        });

        // Trigger Media.net to load the ad
        if (window._mNHandle && window._mNHandle.queue) {
            window._mNHandle.queue.push(() => {
                window._mNDetails.loadTag.push({
                    tag: adDiv.id,
                    uid: MEDIANET_CONFIG.adUnits[adConfig.format],
                    size: [[format.width, format.height]]
                });
            });
        }
    } catch (e) {
        console.error('Media.net ad error:', e);
        showAdPlaceholder(container);
    }
}

/**
 * Insert in-feed ads between restaurant cards
 */
function insertInFeedAds() {
    const restaurantList = document.getElementById('restaurantList');
    if (!restaurantList) return;

    const restaurantCards = restaurantList.querySelectorAll('.restaurant-card');

    // Insert ad after every 4 restaurant cards
    const adFrequency = 4;
    let adsInserted = 0;

    restaurantCards.forEach((card, index) => {
        if ((index + 1) % adFrequency === 0 && index < restaurantCards.length - 1) {
            const adContainer = createInFeedAdContainer(adsInserted);
            card.after(adContainer);

            // Load the in-feed ad
            loadInFeedMediaNetAd(adContainer.querySelector('.ad-container > div'), adsInserted);
            adsInserted++;
        }
    });
}

/**
 * Create in-feed ad container element
 */
function createInFeedAdContainer(index) {
    const container = document.createElement('div');
    container.className = 'ad-in-feed';
    container.innerHTML = `
        <div class="ad-container">
            <div class="ad-label">Advertisement</div>
            <div id="ad-in-feed-${index}"></div>
        </div>
    `;
    return container;
}

/**
 * Load an in-feed Media.net ad
 */
function loadInFeedMediaNetAd(container, index) {
    if (!container || !cookieConsentGiven) return;

    const format = MEDIANET_CONFIG.adFormats.inFeed;
    const adDivId = `ad-in-feed-${index}-medianet`;

    const adDiv = document.createElement('div');
    adDiv.id = adDivId;
    adDiv.style.width = format.width + 'px';
    adDiv.style.height = format.height + 'px';
    adDiv.style.margin = '0 auto';

    container.appendChild(adDiv);

    try {
        window._mNDetails = window._mNDetails || {};
        window._mNDetails.loadTag = window._mNDetails.loadTag || [];

        window._mNDetails.loadTag.push({
            tag: adDivId,
            uid: MEDIANET_CONFIG.adUnits.inFeed,
            size: [[format.width, format.height]]
        });

        // Trigger Media.net to load the ad
        if (window._mNHandle && window._mNHandle.queue) {
            window._mNHandle.queue.push(() => {
                window._mNDetails.loadTag.push({
                    tag: adDivId,
                    uid: MEDIANET_CONFIG.adUnits.inFeed,
                    size: [[format.width, format.height]]
                });
            });
        }
    } catch (e) {
        console.error('In-feed Media.net ad error:', e);
    }
}

/**
 * Show placeholder when ads are declined or can't load
 */
function showAdPlaceholders() {
    const adContainers = document.querySelectorAll('.ad-container > div[id^="ad-"]');
    adContainers.forEach(container => {
        showAdPlaceholder(container);
    });
}

/**
 * Show a single ad placeholder
 */
function showAdPlaceholder(container) {
    if (!container) return;
    container.innerHTML = '<p style="color: #6c757d; padding: 2rem;">Ad space</p>';
}

/**
 * Refresh ads when navigation occurs (for SPA)
 */
function refreshAdsOnNavigation() {
    // Listen for hash changes (SPA navigation)
    window.addEventListener('hashchange', () => {
        if (cookieConsentGiven) {
            // Re-insert in-feed ads after navigation
            setTimeout(() => {
                insertInFeedAds();
            }, 1000);
        }
    });
}

// Initialize navigation listener
refreshAdsOnNavigation();

// Export functions for external use if needed
window.adsManager = {
    reinitializeAds: initializeAds,
    insertInFeedAds: insertInFeedAds,
    hasConsent: () => cookieConsentGiven
};
