/**
 * Google AdSense Integration
 * Handles ad initialization, lazy loading, and cookie consent
 */

// Configuration
const ADSENSE_CONFIG = {
    // IMPORTANT: Replace with your actual AdSense Publisher ID
    publisherId: 'ca-pub-XXXXXXXXXXXXXXXX',

    // Ad slot IDs - Replace with your actual ad slot IDs from AdSense
    adSlots: {
        topBanner: '1234567890',      // Top banner ad slot
        horizontalBanner: '2345678901', // Horizontal banner ad slot
        sidebar: '3456789012',         // Sidebar ad slot
        bottomBanner: '4567890123',    // Bottom banner ad slot
        inFeed: '5678901234'           // In-feed ad slot
    },

    // Ad formats (Google AdSense standard sizes)
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
 * Show privacy information (you can customize this)
 */
function showPrivacyInfo() {
    alert('Privacy Policy:\n\nWe use cookies and third-party advertising services (Google AdSense) to:\n' +
          '- Improve your browsing experience\n' +
          '- Show personalized advertisements\n' +
          '- Analyze site traffic\n\n' +
          'You can change your consent preferences at any time by clearing your browser localStorage.');
}

/**
 * Initialize all AdSense ads
 */
function initializeAds() {
    if (!cookieConsentGiven) {
        console.log('Ads not initialized - cookie consent required');
        return;
    }

    // Initialize static ads with lazy loading
    initializeLazyAds();

    // Initialize in-feed ads (inserted between restaurant cards)
    setTimeout(() => {
        insertInFeedAds();
    }, 2000); // Wait for content to load
}

/**
 * Initialize ads with lazy loading (load when visible)
 */
function initializeLazyAds() {
    const adContainers = [
        { id: 'ad-top-banner', slot: ADSENSE_CONFIG.adSlots.topBanner, format: 'topBanner' },
        { id: 'ad-horizontal-banner', slot: ADSENSE_CONFIG.adSlots.horizontalBanner, format: 'horizontalBanner' },
        { id: 'ad-sidebar', slot: ADSENSE_CONFIG.adSlots.sidebar, format: 'sidebar' },
        { id: 'ad-bottom-banner', slot: ADSENSE_CONFIG.adSlots.bottomBanner, format: 'bottomBanner' }
    ];

    // Use Intersection Observer for lazy loading
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const adConfig = adContainers.find(ad => ad.id === entry.target.id);
                    if (adConfig && !entry.target.dataset.adLoaded) {
                        loadAd(adConfig);
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
        adContainers.forEach(loadAd);
    }
}

/**
 * Load a specific ad
 */
function loadAd(adConfig) {
    const container = document.getElementById(adConfig.id);
    if (!container) return;

    const format = ADSENSE_CONFIG.adFormats[adConfig.format];

    // Create AdSense ad element
    const adElement = document.createElement('ins');
    adElement.className = 'adsbygoogle';
    adElement.style.display = 'block';
    adElement.setAttribute('data-ad-client', ADSENSE_CONFIG.publisherId);
    adElement.setAttribute('data-ad-slot', adConfig.slot);

    // Set responsive or fixed size
    if (window.innerWidth <= 768) {
        // Mobile: use responsive ads
        adElement.setAttribute('data-ad-format', 'auto');
        adElement.setAttribute('data-full-width-responsive', 'true');
    } else {
        // Desktop: use fixed sizes
        adElement.style.width = format.width + 'px';
        adElement.style.height = format.height + 'px';
    }

    container.appendChild(adElement);

    // Push ad to AdSense
    try {
        (adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
        console.error('AdSense error:', e);
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
            loadInFeedAd(adContainer.querySelector('.ad-container > div'));
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
 * Load an in-feed ad
 */
function loadInFeedAd(container) {
    if (!container || !cookieConsentGiven) return;

    const format = ADSENSE_CONFIG.adFormats.inFeed;

    const adElement = document.createElement('ins');
    adElement.className = 'adsbygoogle';
    adElement.style.display = 'block';
    adElement.setAttribute('data-ad-client', ADSENSE_CONFIG.publisherId);
    adElement.setAttribute('data-ad-slot', ADSENSE_CONFIG.adSlots.inFeed);
    adElement.setAttribute('data-ad-format', 'fluid');
    adElement.setAttribute('data-ad-layout', 'in-article');
    adElement.style.width = format.width + 'px';
    adElement.style.height = format.height + 'px';

    container.appendChild(adElement);

    try {
        (adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
        console.error('In-feed ad error:', e);
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
