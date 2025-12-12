// API Base URL
const API_BASE_URL = '/api';

// Global variables
let map = null;
let markers = [];
let userLocation = null;
let allRestaurants = [];
let currentPage = 'home';
let selectedRestaurantForFavorite = null;

// City preference functions
function saveCityPreference(province) {
    if (province) {
        localStorage.setItem('preferredCity', province);
    } else {
        localStorage.removeItem('preferredCity');
    }
}

function loadCityPreference() {
    return localStorage.getItem('preferredCity') || '';
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

async function initializeApp() {
    // Initialize authentication UI
    initializeAuth();

    // Set up event listeners
    setupEventListeners();

    // Handle initial hash on page load
    handleHashChange();

    // Load filter options
    await loadFilterOptions();

    // Load and apply saved city preference
    const savedCity = loadCityPreference();
    if (savedCity) {
        document.getElementById('cityFilter').value = savedCity;
        const randomCityFilter = document.getElementById('randomCityFilter');
        if (randomCityFilter) {
            randomCityFilter.value = savedCity;
        }
    }

    // Load all restaurants initially - only if not on a share page
    if (!window.location.hash.startsWith('#/share/')) {
        // Apply province filter if a city preference is saved
        const searchParams = savedCity ? { province: savedCity } : {};
        await loadRestaurants(searchParams);
        // Initialize map
        initializeMap();
    }
}

function setupEventListeners() {
    // Search button
    document.getElementById('searchBtn').addEventListener('click', handleSearch);

    // Search input - enter key
    document.getElementById('searchInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });

    // Near me button
    document.getElementById('nearMeBtn').addEventListener('click', handleNearMe);

    // Decide for me button
    document.getElementById('decideMeBtn').addEventListener('click', showDecideForMeModal);

    // View toggle buttons
    document.getElementById('listViewBtn').addEventListener('click', () => toggleView('list'));
    document.getElementById('mapViewBtn').addEventListener('click', () => toggleView('map'));

    // Filters
    document.getElementById('cityFilter').addEventListener('change', (e) => {
        saveCityPreference(e.target.value);
        handleSearch();
    });
    document.getElementById('categoryFilter').addEventListener('change', handleSearch);
    document.getElementById('cuisineFilter').addEventListener('change', handleSearch);

    // Auth buttons
    document.getElementById('loginBtn').addEventListener('click', () => showModal('loginModal'));
    document.getElementById('signupBtn').addEventListener('click', () => showModal('signupModal'));
    document.getElementById('logoutBtn').addEventListener('click', () => authService.logout());

    // Navigation
    document.getElementById('homeLink').addEventListener('click', (e) => {
        e.preventDefault();
        navigateTo('home');
    });
    document.getElementById('guidesLink').addEventListener('click', (e) => {
        e.preventDefault();
        navigateTo('guides');
    });
    document.getElementById('myListsLink').addEventListener('click', (e) => {
        e.preventDefault();
        navigateTo('myLists');
    });
    document.getElementById('routesLink').addEventListener('click', (e) => {
        e.preventDefault();
        navigateTo('routes');
    });
    document.getElementById('followingLink').addEventListener('click', (e) => {
        e.preventDefault();
        navigateTo('following');
    });
    document.getElementById('discoverLink').addEventListener('click', (e) => {
        e.preventDefault();
        navigateTo('discover');
    });

    // Modal switches
    document.getElementById('switchToSignup').addEventListener('click', (e) => {
        e.preventDefault();
        hideModal('loginModal');
        showModal('signupModal');
    });
    document.getElementById('switchToLogin').addEventListener('click', (e) => {
        e.preventDefault();
        hideModal('signupModal');
        showModal('loginModal');
    });

    // Modal close buttons
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', () => {
            const modalId = closeBtn.getAttribute('data-modal');
            hideModal(modalId);
        });
    });

    // Click outside modal to close
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.classList.add('hidden');
        }
    });

    // Login form
    document.getElementById('loginForm').addEventListener('submit', handleLogin);

    // Signup form
    document.getElementById('signupForm').addEventListener('submit', handleSignup);

    // Add to favorites
    document.getElementById('addToListBtn').addEventListener('click', handleAddToList);
    document.getElementById('createListBtn').addEventListener('click', handleCreateListAndAdd);

    // Decide for me modal
    document.getElementById('useLocationFilter').addEventListener('change', (e) => {
        document.getElementById('radiusGroup').style.display = e.target.checked ? 'block' : 'none';
    });
    document.getElementById('pickRandomBtn').addEventListener('click', handlePickRandom);
    document.getElementById('tryAnotherBtn').addEventListener('click', handlePickRandom);
    document.getElementById('viewOnMapBtn').addEventListener('click', handleViewRandomOnMap);

    // Hash change for routing
    window.addEventListener('hashchange', handleHashChange);
}

async function loadFilterOptions() {
    try {
        // Load categories
        const categoriesResponse = await fetch(`${API_BASE_URL}/restaurants/categories`);
        const categories = await categoriesResponse.json();

        const categorySelect = document.getElementById('categoryFilter');
        const randomCategorySelect = document.getElementById('randomCategoryFilter');
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categorySelect.appendChild(option);

            const randomOption = document.createElement('option');
            randomOption.value = category;
            randomOption.textContent = category;
            randomCategorySelect.appendChild(randomOption);
        });

        // Load cuisine types
        const cuisinesResponse = await fetch(`${API_BASE_URL}/restaurants/cuisine-types`);
        const cuisines = await cuisinesResponse.json();

        const cuisineSelect = document.getElementById('cuisineFilter');
        const randomCuisineSelect = document.getElementById('randomCuisineFilter');
        cuisines.forEach(cuisine => {
            const option = document.createElement('option');
            option.value = cuisine;
            option.textContent = cuisine;
            cuisineSelect.appendChild(option);

            const randomOption = document.createElement('option');
            randomOption.value = cuisine;
            randomOption.textContent = cuisine;
            randomCuisineSelect.appendChild(randomOption);
        });
    } catch (error) {
        console.error('Error loading filter options:', error);
    }
}

async function loadRestaurants(searchParams = {}) {
    showLoading(true);
    hideError();

    try {
        let url = `${API_BASE_URL}/restaurants`;

        // Build query string
        const params = new URLSearchParams();
        if (searchParams.query) params.append('query', searchParams.query);
        if (searchParams.category) params.append('category', searchParams.category);
        if (searchParams.cuisineType) params.append('cuisineType', searchParams.cuisineType);
        if (searchParams.province) params.append('province', searchParams.province);

        if (params.toString()) {
            url = `${API_BASE_URL}/restaurants/search?${params.toString()}`;
        }

        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch restaurants');

        const restaurants = await response.json();
        allRestaurants = restaurants;

        displayRestaurants(restaurants);
        updateMap(restaurants);
        updateResultsCount(restaurants.length);
    } catch (error) {
        console.error('Error loading restaurants:', error);
        showError('Failed to load restaurants. Please try again.');
    } finally {
        showLoading(false);
    }
}

async function loadNearbyRestaurants(latitude, longitude, radius, category = '', province = '') {
    showLoading(true);
    hideError();

    try {
        const params = new URLSearchParams({
            latitude: latitude.toString(),
            longitude: longitude.toString(),
            radiusKm: radius.toString()
        });

        if (category) {
            params.append('category', category);
        }

        if (province) {
            params.append('province', province);
        }

        const response = await fetch(`${API_BASE_URL}/restaurants/nearby?${params.toString()}`);
        if (!response.ok) throw new Error('Failed to fetch nearby restaurants');

        const restaurants = await response.json();
        allRestaurants = restaurants;

        // Calculate and add distance to each restaurant
        restaurants.forEach(restaurant => {
            restaurant.distance = calculateDistance(
                latitude,
                longitude,
                restaurant.latitude,
                restaurant.longitude
            );
        });

        displayRestaurants(restaurants);
        updateMap(restaurants, { lat: latitude, lng: longitude });
        updateResultsCount(restaurants.length);
    } catch (error) {
        console.error('Error loading nearby restaurants:', error);
        showError('Failed to load nearby restaurants. Please try again.');
    } finally {
        showLoading(false);
    }
}

function handleSearch() {
    const query = document.getElementById('searchInput').value.trim();
    const category = document.getElementById('categoryFilter').value;
    const cuisineType = document.getElementById('cuisineFilter').value;
    const province = document.getElementById('cityFilter').value;

    const searchParams = {};
    if (query) searchParams.query = query;
    if (category) searchParams.category = category;
    if (cuisineType) searchParams.cuisineType = cuisineType;
    if (province) searchParams.province = province;

    loadRestaurants(searchParams);
}

function handleNearMe() {
    if (!navigator.geolocation) {
        showError('Geolocation is not supported by your browser.');
        return;
    }

    showLoading(true);
    navigator.geolocation.getCurrentPosition(
        (position) => {
            userLocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };

            const radius = parseFloat(document.getElementById('radiusFilter').value);
            const category = document.getElementById('categoryFilter').value;
            const province = document.getElementById('cityFilter').value;

            loadNearbyRestaurants(
                userLocation.lat,
                userLocation.lng,
                radius,
                category,
                province
            );
        },
        (error) => {
            showLoading(false);
            let errorMessage = 'Unable to retrieve your location.';

            switch(error.code) {
                case error.PERMISSION_DENIED:
                    errorMessage = 'Location access denied. Please enable location permissions.';
                    break;
                case error.POSITION_UNAVAILABLE:
                    errorMessage = 'Location information is unavailable.';
                    break;
                case error.TIMEOUT:
                    errorMessage = 'Location request timed out.';
                    break;
            }

            showError(errorMessage);
        }
    );
}

function displayRestaurants(restaurants) {
    const listContainer = document.getElementById('restaurantList');
    listContainer.innerHTML = '';

    if (restaurants.length === 0) {
        listContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🍽️</div>
                <div class="empty-state-text">No restaurants found</div>
                <div class="empty-state-subtext">Try adjusting your search criteria</div>
            </div>
        `;
        return;
    }

    restaurants.forEach(restaurant => {
        const card = createRestaurantCard(restaurant);
        listContainer.appendChild(card);
    });
}

function createRestaurantCard(restaurant) {
    const card = document.createElement('div');
    card.className = 'restaurant-card';

    const ratingStars = restaurant.rating ? '⭐'.repeat(Math.round(restaurant.rating)) : '';
    const distanceHtml = restaurant.distance
        ? `<span class="restaurant-distance">📍 ${restaurant.distance.toFixed(2)} km away</span>`
        : '';

    const favoriteButtonHtml = authService.isAuthenticated()
        ? `<button class="btn btn-favorite" data-restaurant-id="${restaurant.id}">❤️ Add to Favorites</button>`
        : '';

    const watchlistButtonHtml = authService.isAuthenticated()
        ? `<button class="btn btn-watchlist" data-restaurant-id="${restaurant.id}">⭐ Want to Try</button>`
        : '';

    // Escape single quotes in restaurant name for onclick handler
    const escapedName = restaurant.name.replace(/'/g, "\\'");

    card.innerHTML = `
        <img src="${restaurant.imageUrl || '/images/placeholder.svg'}"
             alt="${restaurant.name}"
             class="restaurant-image"
             loading="lazy"
             onerror="this.onerror=null; this.src='/images/placeholder.svg'">
        <div class="restaurant-info">
            <h3 class="restaurant-name">${restaurant.name}</h3>
            <div>
                <span class="restaurant-category">${restaurant.category}</span>
                <span class="restaurant-cuisine">${restaurant.cuisineType}</span>
            </div>
            <p class="restaurant-address">📍 ${restaurant.address}</p>
            ${restaurant.rating ? `<div class="restaurant-rating">${ratingStars} ${restaurant.rating}/5</div>` : ''}
            ${restaurant.description ? `<p class="restaurant-description">${restaurant.description}</p>` : ''}
            ${restaurant.phone ? `<p class="restaurant-phone">📞 ${restaurant.phone}</p>` : ''}
            ${distanceHtml}
            <div class="restaurant-actions">
                ${favoriteButtonHtml}
                ${watchlistButtonHtml}
                <button class="btn btn-small btn-directions" onclick="openDirections(${restaurant.latitude}, ${restaurant.longitude}, '${escapedName}')">
                    🧭 Get Directions
                </button>
            </div>
        </div>
    `;

    // Add event listener for favorite button
    if (authService.isAuthenticated()) {
        const favoriteBtn = card.querySelector('.btn-favorite');
        favoriteBtn.addEventListener('click', () => {
            selectedRestaurantForFavorite = restaurant;
            showAddToFavoritesModal();
        });

        const watchlistBtn = card.querySelector('.btn-watchlist');
        watchlistBtn.addEventListener('click', () => {
            selectedRestaurantForFavorite = restaurant;
            handleQuickAddToWatchlist(restaurant);
        });
    }

    return card;
}

function initializeMap() {
    // Initialize Leaflet map
    map = L.map('map').setView([40.7128, -74.0060], 12);

    // Add OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
    }).addTo(map);
}

function updateMap(restaurants, userLocationOverride = null) {
    if (!map) return;

    // Clear existing markers
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];

    if (restaurants.length === 0) {
        return;
    }

    // Add user location marker if available
    const currentUserLocation = userLocationOverride || userLocation;
    if (currentUserLocation) {
        const userMarker = L.marker([currentUserLocation.lat, currentUserLocation.lng], {
            icon: L.icon({
                iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41]
            })
        }).addTo(map);

        userMarker.bindPopup('<b>Your Location</b>');
        markers.push(userMarker);
    }

    // Add restaurant markers
    restaurants.forEach(restaurant => {
        const marker = L.marker([restaurant.latitude, restaurant.longitude]).addTo(map);

        // Escape single quotes in restaurant name for onclick handler
        const escapedName = restaurant.name.replace(/'/g, "\\'");

        const popupContent = `
            <div class="popup-name">${restaurant.name}</div>
            <div class="popup-category">${restaurant.category} - ${restaurant.cuisineType}</div>
            <div class="popup-address">${restaurant.address}</div>
            ${restaurant.rating ? `<div class="popup-rating">⭐ ${restaurant.rating}/5</div>` : ''}
            <div style="margin-top: 10px;">
                <button class="btn btn-small" onclick="openDirections(${restaurant.latitude}, ${restaurant.longitude}, '${escapedName}')" style="width: 100%;">
                    🧭 Get Directions
                </button>
            </div>
        `;

        marker.bindPopup(popupContent);
        markers.push(marker);
    });

    // Fit map bounds to show all markers
    if (markers.length > 0) {
        const group = L.featureGroup(markers);
        map.fitBounds(group.getBounds().pad(0.1));
    }
}

function toggleView(view) {
    const listView = document.getElementById('listView');
    const mapView = document.getElementById('mapView');
    const listBtn = document.getElementById('listViewBtn');
    const mapBtn = document.getElementById('mapViewBtn');

    if (view === 'list') {
        listView.classList.add('active');
        mapView.classList.remove('active');
        listBtn.classList.add('active');
        mapBtn.classList.remove('active');
    } else {
        listView.classList.remove('active');
        mapView.classList.add('active');
        listBtn.classList.remove('active');
        mapBtn.classList.add('active');

        // Invalidate map size to fix rendering issues
        setTimeout(() => {
            if (map) map.invalidateSize();
        }, 100);
    }
}

function updateResultsCount(count) {
    const resultsCount = document.getElementById('resultsCount');
    if (count === 0) {
        resultsCount.textContent = 'No restaurants found';
    } else if (count === 1) {
        resultsCount.textContent = '1 restaurant found';
    } else {
        resultsCount.textContent = `${count} restaurants found`;
    }
}

function showLoading(show) {
    const loading = document.getElementById('loading');
    if (show) {
        loading.classList.remove('hidden');
    } else {
        loading.classList.add('hidden');
    }
}

function showError(message) {
    const errorElement = document.getElementById('errorMessage');
    errorElement.textContent = message;
    errorElement.classList.remove('hidden');
}

function hideError() {
    const errorElement = document.getElementById('errorMessage');
    errorElement.classList.add('hidden');
}

function showSuccess(message) {
    const errorElement = document.getElementById('errorMessage');
    errorElement.textContent = message;
    errorElement.classList.remove('hidden');
    errorElement.style.backgroundColor = 'var(--success-color)';
    errorElement.style.color = 'white';

    // Auto-hide after 3 seconds
    setTimeout(() => {
        hideError();
        errorElement.style.backgroundColor = '';
        errorElement.style.color = '';
    }, 3000);
}

// Helper function to calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
    const earthRadiusKm = 6371;

    const dLat = degreesToRadians(lat2 - lat1);
    const dLon = degreesToRadians(lon2 - lon1);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(degreesToRadians(lat1)) * Math.cos(degreesToRadians(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return earthRadiusKm * c;
}

function degreesToRadians(degrees) {
    return degrees * (Math.PI / 180);
}

// Open directions to restaurant in native maps app
function openDirections(lat, lng, name) {
    // Use the restaurant name as the destination so Google Maps shows the actual place
    // This is better than just coordinates because:
    // 1. It shows the business name and details in Google Maps
    // 2. If the user cancels directions, they still see the restaurant info
    // 3. Google Maps can find the correct location by name
    const encodedName = encodeURIComponent(name);

    // Fallback: include coordinates to help locate the exact place
    const coordsQuery = encodeURIComponent(`${lat},${lng}`);

    // Try to search by name first, with coordinates as backup
    const url = `https://www.google.com/maps/search/?api=1&query=${encodedName}+${coordsQuery}`;

    // Open in new tab/window
    window.open(url, '_blank');
}

// =============================================================================
// Authentication Functions
// =============================================================================

function initializeAuth() {
    if (authService.isAuthenticated()) {
        showAuthenticatedUI();
    } else {
        showUnauthenticatedUI();
    }
}

function showAuthenticatedUI() {
    document.getElementById('authButtons').classList.add('hidden');
    document.getElementById('userMenu').classList.remove('hidden');
    document.getElementById('myListsLink').classList.remove('hidden');
    document.getElementById('followingLink').classList.remove('hidden');
    document.getElementById('discoverLink').classList.remove('hidden');

    const user = authService.getUser();
    if (user) {
        document.getElementById('userDisplayName').textContent = user.displayName;
    }
}

function showUnauthenticatedUI() {
    document.getElementById('authButtons').classList.remove('hidden');
    document.getElementById('userMenu').classList.add('hidden');
    document.getElementById('myListsLink').classList.add('hidden');
    document.getElementById('followingLink').classList.add('hidden');
    // Keep discover link visible for non-logged users
    document.getElementById('discoverLink').classList.remove('hidden');
}

async function handleLogin(e) {
    e.preventDefault();

    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    const errorEl = document.getElementById('loginError');

    try {
        await authService.login(username, password);
        hideModal('loginModal');
        showAuthenticatedUI();
        window.location.reload();
    } catch (error) {
        errorEl.textContent = error.message;
        errorEl.classList.remove('hidden');
    }
}

async function handleSignup(e) {
    e.preventDefault();

    const username = document.getElementById('signupUsername').value;
    const email = document.getElementById('signupEmail').value;
    const displayName = document.getElementById('signupDisplayName').value;
    const password = document.getElementById('signupPassword').value;
    const errorEl = document.getElementById('signupError');

    try {
        await authService.register(username, email, password, displayName);
        hideModal('signupModal');
        showAuthenticatedUI();
        window.location.reload();
    } catch (error) {
        errorEl.textContent = error.message;
        errorEl.classList.remove('hidden');
    }
}

// =============================================================================
// Decide For Me Functions
// =============================================================================

let lastRandomRestaurant = null;

function showDecideForMeModal() {
    // Reset modal to options view
    document.getElementById('decideForMeOptions').classList.remove('hidden');
    document.getElementById('randomResult').classList.add('hidden');
    document.getElementById('randomError').classList.add('hidden');

    showModal('decideForMeModal');
}

async function handlePickRandom() {
    const useLocation = document.getElementById('useLocationFilter').checked;
    const category = document.getElementById('randomCategoryFilter').value;
    const cuisineType = document.getElementById('randomCuisineFilter').value;
    const minRating = document.getElementById('minRatingFilter').value;
    const radiusKm = document.getElementById('randomRadiusFilter').value;
    const province = document.getElementById('randomCityFilter').value;

    const errorEl = document.getElementById('randomError');
    errorEl.classList.add('hidden');

    try {
        const params = new URLSearchParams();

        if (category) params.append('category', category);
        if (cuisineType) params.append('cuisineType', cuisineType);
        if (minRating) params.append('minRating', minRating);
        if (province) params.append('province', province);

        if (useLocation) {
            if (!navigator.geolocation) {
                throw new Error('Geolocation is not supported by your browser');
            }

            // Get user location
            const position = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject);
            });

            params.append('latitude', position.coords.latitude.toString());
            params.append('longitude', position.coords.longitude.toString());
            params.append('radiusKm', radiusKm);
        }

        const response = await fetch(`${API_BASE_URL}/restaurants/random?${params.toString()}`);

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('No restaurants found matching your criteria. Try adjusting your filters!');
            }
            throw new Error('Failed to fetch random restaurant');
        }

        const restaurant = await response.json();
        lastRandomRestaurant = restaurant;
        displayRandomRestaurant(restaurant);

    } catch (error) {
        console.error('Error fetching random restaurant:', error);
        errorEl.textContent = error.message;
        errorEl.classList.remove('hidden');
    }
}

function displayRandomRestaurant(restaurant) {
    const detailsContainer = document.getElementById('randomRestaurantDetails');

    const ratingStars = restaurant.rating ? '⭐'.repeat(Math.round(restaurant.rating)) : '';

    const favoriteButtonHtml = authService.isAuthenticated()
        ? `<button class="btn btn-favorite" onclick="addRandomToFavorites()">❤️ Add to Favorites</button>`
        : '';

    detailsContainer.innerHTML = `
        <div class="random-restaurant-image">
            <img src="${restaurant.imageUrl || '/images/placeholder.svg'}"
                 alt="${restaurant.name}"
                 onerror="this.onerror=null; this.src='/images/placeholder.svg'">
        </div>
        <h3>${restaurant.name}</h3>
        <div>
            <span class="restaurant-category">${restaurant.category}</span>
            <span class="restaurant-cuisine">${restaurant.cuisineType}</span>
        </div>
        <p class="restaurant-address">📍 ${restaurant.address}</p>
        ${restaurant.rating ? `<div class="restaurant-rating">${ratingStars} ${restaurant.rating}/5</div>` : ''}
        ${restaurant.description ? `<p class="restaurant-description">${restaurant.description}</p>` : ''}
        ${restaurant.phone ? `<p class="restaurant-phone">📞 ${restaurant.phone}</p>` : ''}
        ${favoriteButtonHtml}
    `;

    // Hide options and show result
    document.getElementById('decideForMeOptions').classList.add('hidden');
    document.getElementById('randomResult').classList.remove('hidden');
}

function handleViewRandomOnMap() {
    if (!lastRandomRestaurant) return;

    hideModal('decideForMeModal');

    // Switch to map view
    toggleView('map');

    // Center map on the restaurant
    if (map) {
        map.setView([lastRandomRestaurant.latitude, lastRandomRestaurant.longitude], 15);

        // Highlight the restaurant marker
        setTimeout(() => {
            markers.forEach(marker => {
                if (marker.restaurantId === lastRandomRestaurant.id) {
                    marker.openPopup();
                }
            });
        }, 500);
    }
}

function addRandomToFavorites() {
    if (lastRandomRestaurant) {
        selectedRestaurantForFavorite = lastRandomRestaurant;
        hideModal('decideForMeModal');
        showAddToFavoritesModal();
    }
}

// =============================================================================
// Modal Functions
// =============================================================================

function showModal(modalId) {
    document.getElementById(modalId).classList.remove('hidden');
}

function hideModal(modalId) {
    document.getElementById(modalId).classList.add('hidden');
}

// =============================================================================
// Favorites Functions
// =============================================================================

async function handleQuickAddToWatchlist(restaurant) {
    if (!authService.isAuthenticated()) {
        showModal('loginModal');
        return;
    }

    try {
        // Get or create watchlist
        let watchlists = await favoritesService.getListsByType(ListType.Watchlist);

        let watchlist;
        if (watchlists.length === 0) {
            // Create default watchlist
            watchlist = await favoritesService.createList('Want to Try', false, ListType.Watchlist);
        } else {
            // Use first watchlist
            watchlist = watchlists[0];
        }

        // Add restaurant to watchlist
        await favoritesService.addRestaurant(watchlist.id, restaurant.id, null);

        // Show success message
        showSuccess(`Added "${restaurant.name}" to your watchlist!`);
    } catch (error) {
        console.error('Error adding to watchlist:', error);
        showError(error.message || 'Failed to add to watchlist. It may already be in your list.');
    }
}

async function showAddToFavoritesModal() {
    if (!authService.isAuthenticated()) {
        showModal('loginModal');
        return;
    }

    try {
        const lists = await favoritesService.getMyLists();
        const selectList = document.getElementById('selectList');

        // Clear existing options except first
        selectList.innerHTML = '<option value="">-- Select a list --</option>';

        // Check if user has any lists
        if (lists.length === 0) {
            // Auto-create default list
            const user = authService.getUser();
            const defaultListName = `${user.displayName}'s favorites`;
            const newList = await favoritesService.createList(defaultListName, false);

            const option = document.createElement('option');
            option.value = newList.id;
            option.textContent = newList.name;
            option.selected = true;
            selectList.appendChild(option);
        } else {
            lists.forEach(list => {
                const option = document.createElement('option');
                option.value = list.id;
                option.textContent = list.name;
                selectList.appendChild(option);
            });
        }

        showModal('addToFavoritesModal');
    } catch (error) {
        console.error('Error loading lists:', error);
        showError('Failed to load your lists. Please try again.');
    }
}

async function handleAddToList() {
    const listId = document.getElementById('selectList').value;
    const notes = document.getElementById('restaurantNotes').value;
    const errorEl = document.getElementById('favoritesError');

    if (!listId) {
        errorEl.textContent = 'Please select a list';
        errorEl.classList.remove('hidden');
        return;
    }

    if (!selectedRestaurantForFavorite) {
        errorEl.textContent = 'No restaurant selected';
        errorEl.classList.remove('hidden');
        return;
    }

    try {
        await favoritesService.addRestaurant(
            parseInt(listId),
            selectedRestaurantForFavorite.id,
            notes || null
        );

        hideModal('addToFavoritesModal');
        alert('Restaurant added to your list!');

        // Clear form
        document.getElementById('restaurantNotes').value = '';
        errorEl.classList.add('hidden');
    } catch (error) {
        errorEl.textContent = error.message;
        errorEl.classList.remove('hidden');
    }
}

async function handleCreateListAndAdd() {
    const newListName = document.getElementById('newListName').value.trim();
    const isPublic = document.getElementById('newListPublic').checked;
    const notes = document.getElementById('restaurantNotes').value;
    const errorEl = document.getElementById('favoritesError');

    if (!newListName) {
        errorEl.textContent = 'Please enter a list name';
        errorEl.classList.remove('hidden');
        return;
    }

    if (!selectedRestaurantForFavorite) {
        errorEl.textContent = 'No restaurant selected';
        errorEl.classList.remove('hidden');
        return;
    }

    try {
        const newList = await favoritesService.createList(newListName, isPublic);

        await favoritesService.addRestaurant(
            newList.id,
            selectedRestaurantForFavorite.id,
            notes || null
        );

        hideModal('addToFavoritesModal');
        alert(`List "${newListName}" created and restaurant added!`);

        // Clear form
        document.getElementById('newListName').value = '';
        document.getElementById('newListPublic').checked = false;
        document.getElementById('restaurantNotes').value = '';
        errorEl.classList.add('hidden');
    } catch (error) {
        errorEl.textContent = error.message;
        errorEl.classList.remove('hidden');
    }
}

// =============================================================================
// Navigation Functions
// =============================================================================

function handleHashChange() {
    const hash = window.location.hash;

    if (hash.startsWith('#/share/')) {
        const shareUrl = hash.substring(8); // Remove '#/share/' prefix
        navigateTo('share', shareUrl);
    }
}

async function navigateTo(page, param) {
    currentPage = page;

    // Update nav active state
    document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));

    const searchSection = document.querySelector('.search-section');
    const viewToggle = document.querySelector('.view-toggle');
    const resultsSection = document.querySelector('.results-section');
    const mainContainer = document.querySelector('main .container');

    if (page === 'home') {
        document.getElementById('homeLink').classList.add('active');
        searchSection.style.display = 'block';
        viewToggle.style.display = 'flex';
        resultsSection.innerHTML = `
            <div id="resultsCount" class="results-count"></div>
            <div id="listView" class="list-view active">
                <div id="restaurantList" class="restaurant-list"></div>
            </div>
            <div id="mapView" class="map-view">
                <div id="map"></div>
            </div>
        `;
        await loadRestaurants();
        initializeMap();
    } else if (page === 'myLists') {
        document.getElementById('myListsLink').classList.add('active');
        searchSection.style.display = 'none';
        viewToggle.style.display = 'none';
        await showMyListsPage();
    } else if (page === 'following') {
        document.getElementById('followingLink').classList.add('active');
        searchSection.style.display = 'none';
        viewToggle.style.display = 'none';
        await showFollowingPage();
    } else if (page === 'discover') {
        document.getElementById('discoverLink').classList.add('active');
        searchSection.style.display = 'none';
        viewToggle.style.display = 'none';
        await showDiscoverPage();
    } else if (page === 'guides') {
        document.getElementById('guidesLink').classList.add('active');
        searchSection.style.display = 'none';
        viewToggle.style.display = 'none';
        await showGuidesPage();
    } else if (page === 'routes') {
        document.getElementById('routesLink').classList.add('active');
        searchSection.style.display = 'none';
        viewToggle.style.display = 'none';
        await showRoutesPage();
    } else if (page === 'share') {
        // Don't highlight any nav link for shared pages
        searchSection.style.display = 'none';
        viewToggle.style.display = 'none';
        await showSharedListPage(param);
    }
}

async function showMyListsPage() {
    const resultsSection = document.querySelector('.results-section');
    resultsSection.innerHTML = '<div class="page-loading">Loading your lists...</div>';

    try {
        const lists = await favoritesService.getMyLists();

        let html = `
            <div class="lists-page">
                <div class="lists-header">
                    <h2>My Favorite Lists</h2>
                    <button class="btn btn-primary" onclick="createNewList()">Create New List</button>
                </div>
        `;

        if (lists.length === 0) {
            html += `
                <div class="empty-state">
                    <div class="empty-state-icon">📋</div>
                    <div class="empty-state-text">No lists yet</div>
                    <div class="empty-state-subtext">Create your first favorite list</div>
                </div>
            `;
        } else {
            html += '<div class="lists-grid">';
            lists.forEach(list => {
                const shareInfo = list.isPublic && list.shareUrl
                    ? `<div class="list-share">
                         <input type="text" readonly value="${window.location.origin}/#/share/${list.shareUrl}" class="share-url-input" id="share-${list.id}">
                         <button class="btn btn-small" onclick="copyShareUrl('${list.id}')">Copy Link</button>
                       </div>`
                    : '';

                html += `
                    <div class="list-card">
                        <h3>${list.name}</h3>
                        <p>${list.itemCount} restaurant${list.itemCount !== 1 ? 's' : ''}</p>
                        <p>${list.followerCount} follower${list.followerCount !== 1 ? 's' : ''}</p>
                        <p>${list.isPublic ? '🌐 Public' : '🔒 Private'}</p>
                        ${shareInfo}
                        <div class="list-actions">
                            <button class="btn btn-small" onclick="viewList(${list.id})">View</button>
                            <button class="btn btn-small" onclick="toggleListVisibility(${list.id}, ${!list.isPublic})">Make ${list.isPublic ? 'Private' : 'Public'}</button>
                            <button class="btn btn-small btn-danger" onclick="deleteList(${list.id})">Delete</button>
                        </div>
                    </div>
                `;
            });
            html += '</div>';
        }

        html += '</div>';
        resultsSection.innerHTML = html;
    } catch (error) {
        resultsSection.innerHTML = '<div class="error-message">Failed to load your lists</div>';
        console.error('Error loading lists:', error);
    }
}

async function showFollowingPage() {
    const resultsSection = document.querySelector('.results-section');
    resultsSection.innerHTML = '<div class="page-loading">Loading lists you follow...</div>';

    try {
        const lists = await favoritesService.getFollowingLists();

        let html = `
            <div class="lists-page">
                <div class="lists-header">
                    <h2>Lists I'm Following</h2>
                </div>
        `;

        if (lists.length === 0) {
            html += `
                <div class="empty-state">
                    <div class="empty-state-icon">👥</div>
                    <div class="empty-state-text">Not following any lists yet</div>
                    <div class="empty-state-subtext">Discover and follow lists shared by others</div>
                </div>
            `;
        } else {
            html += '<div class="lists-grid">';
            lists.forEach(list => {
                html += `
                    <div class="list-card">
                        <h3>${list.name}</h3>
                        <p>By ${list.userDisplayName}</p>
                        <p>${list.itemCount} restaurant${list.itemCount !== 1 ? 's' : ''}</p>
                        <div class="list-actions">
                            <button class="btn btn-small" onclick="viewList(${list.id})">View</button>
                            <button class="btn btn-small btn-danger" onclick="unfollowList(${list.id})">Unfollow</button>
                        </div>
                    </div>
                `;
            });
            html += '</div>';
        }

        html += '</div>';
        resultsSection.innerHTML = html;
    } catch (error) {
        resultsSection.innerHTML = '<div class="error-message">Failed to load following lists</div>';
        console.error('Error loading following lists:', error);
    }
}

async function showDiscoverPage() {
    const resultsSection = document.querySelector('.results-section');
    resultsSection.innerHTML = '<div class="page-loading">Loading public lists...</div>';

    try {
        // Get filter and sort values if they exist
        const searchTerm = document.getElementById('discoverSearchInput')?.value || '';
        const sortBy = document.getElementById('discoverSortSelect')?.value || '';

        const lists = await favoritesService.getPublicLists(searchTerm || null, sortBy || null);

        let html = `
            <div class="lists-page">
                <div class="lists-header">
                    <h2>Discover Public Lists</h2>
                    <p class="subheader">Browse and follow lists shared by other users</p>
                </div>
                <div class="lists-filters">
                    <div class="filter-group">
                        <input type="text"
                               id="discoverSearchInput"
                               placeholder="Filter by list name..."
                               value="${searchTerm}"
                               class="filter-input">
                    </div>
                    <div class="filter-group">
                        <select id="discoverSortSelect" class="filter-select">
                            <option value="">Sort by: Followers (default)</option>
                            <option value="followers" ${sortBy === 'followers' ? 'selected' : ''}>Sort by: Followers</option>
                            <option value="oldest" ${sortBy === 'oldest' ? 'selected' : ''}>Sort by: Oldest</option>
                        </select>
                    </div>
                    <button class="btn btn-primary" onclick="applyDiscoverFilters()">Apply</button>
                    <button class="btn btn-secondary" onclick="clearDiscoverFilters()">Clear</button>
                </div>
        `;

        if (lists.length === 0) {
            html += `
                <div class="empty-state">
                    <div class="empty-state-icon">🌐</div>
                    <div class="empty-state-text">No public lists found</div>
                    <div class="empty-state-subtext">Try adjusting your filters or be the first to create a public list!</div>
                </div>
            `;
        } else {
            html += '<div class="lists-grid">';
            lists.forEach(list => {
                const currentUser = authService.getUser();
                const isOwnList = currentUser && list.userId === currentUser.userId;

                let followButton = '';
                if (authService.isAuthenticated()) {
                    followButton = isOwnList
                        ? '<span class="badge">Your List</span>'
                        : list.isFollowing
                            ? `<button class="btn btn-small btn-secondary" onclick="unfollowListFromDiscover(${list.id})">Unfollow</button>`
                            : `<button class="btn btn-small btn-primary" onclick="followListFromDiscover(${list.id})">Follow</button>`;
                } else {
                    followButton = '<span class="badge">Login to follow</span>';
                }

                html += `
                    <div class="list-card">
                        <h3>${list.name}</h3>
                        <p>By ${list.userDisplayName}</p>
                        <p>${list.itemCount} restaurant${list.itemCount !== 1 ? 's' : ''} • ${list.followerCount} follower${list.followerCount !== 1 ? 's' : ''}</p>
                        <div class="list-actions">
                            <button class="btn btn-small" onclick="viewListFromDiscover(${list.id})">View</button>
                            ${followButton}
                        </div>
                    </div>
                `;
            });
            html += '</div>';
        }

        html += '</div>';
        resultsSection.innerHTML = html;
    } catch (error) {
        resultsSection.innerHTML = '<div class="error-message">Failed to load public lists</div>';
        console.error('Error loading public lists:', error);
    }
}

// =============================================================================
// Neighborhood Guides Page Functions
// =============================================================================

async function showGuidesPage() {
    const resultsSection = document.querySelector('.results-section');
    resultsSection.innerHTML = '<div class="page-loading">Loading guides...</div>';

    try {
        const guides = await guidesService.getAllGuides();

        let html = `
            <div class="guides-page">
                <div class="page-header">
                    <h2>🗺️ Neighborhood Guides</h2>
                    <p class="subheader">Discover curated restaurant collections by neighborhood</p>
                </div>
                ${authService.isAuthenticated() ? '<button class="btn btn-primary" onclick="showCreateGuideModal()">Create Guide</button>' : ''}
        `;

        if (guides.length === 0) {
            html += `
                <div class="empty-state">
                    <div class="empty-state-icon">🗺️</div>
                    <div class="empty-state-text">No guides yet</div>
                    <div class="empty-state-subtext">Be the first to create a neighborhood guide!</div>
                </div>
            `;
        } else {
            html += '<div class="guides-grid">';
            guides.forEach(guide => {
                html += `
                    <div class="guide-card" onclick="viewGuide(${guide.id})">
                        ${guide.imageUrl ? `<img src="${guide.imageUrl}" alt="${guide.title}" class="guide-image">` : '<div class="guide-image-placeholder">🗺️</div>'}
                        <div class="guide-content">
                            <h3>${guide.title}</h3>
                            ${guide.isOfficial ? '<span class="badge badge-official">Official</span>' : ''}
                            <p class="guide-neighborhood">📍 ${guide.neighborhoodName}</p>
                            <p class="guide-description">${guide.description.substring(0, 100)}${guide.description.length > 100 ? '...' : ''}</p>
                            <p class="guide-meta">By ${guide.userDisplayName} • ${guide.restaurantCount} restaurant${guide.restaurantCount !== 1 ? 's' : ''}</p>
                        </div>
                    </div>
                `;
            });
            html += '</div>';
        }

        html += '</div>';
        resultsSection.innerHTML = html;
    } catch (error) {
        resultsSection.innerHTML = '<div class="error-message">Failed to load guides</div>';
        console.error('Error loading guides:', error);
    }
}

async function viewGuide(guideId) {
    const resultsSection = document.querySelector('.results-section');
    resultsSection.innerHTML = '<div class="page-loading">Loading guide...</div>';

    try {
        const [guide, restaurants] = await Promise.all([
            guidesService.getGuide(guideId),
            guidesService.getGuideRestaurants(guideId)
        ]);

        const currentUser = authService.getUser();
        const isOwner = currentUser && guide.userId === currentUser.userId;

        let html = `
            <div class="guide-detail-page">
                <button class="btn btn-secondary" onclick="navigateTo('guides')">← Back to Guides</button>
                <div class="guide-detail-header">
                    ${guide.imageUrl ? `<img src="${guide.imageUrl}" alt="${guide.title}" class="guide-detail-image">` : ''}
                    <h2>${guide.title}</h2>
                    ${guide.isOfficial ? '<span class="badge badge-official">Official Guide</span>' : ''}
                    <p class="guide-neighborhood">📍 ${guide.neighborhoodName}</p>
                    <p class="guide-description">${guide.description}</p>
                    <p class="guide-meta">Created by ${guide.userDisplayName}</p>
                    ${renderTags(guide.tags, isOwner, guide.id, 'Guide')}
                    ${isOwner ? `
                        <button class="btn btn-secondary" onclick="showAddRestaurantToGuideModal(${guide.id})">Add Restaurant</button>
                        <button class="btn btn-danger" onclick="deleteGuide(${guide.id})">Delete Guide</button>
                    ` : ''}
                </div>
                <h3>Restaurants in this Guide</h3>
        `;

        if (restaurants.length === 0) {
            html += `
                <div class="empty-state">
                    <div class="empty-state-text">No restaurants in this guide yet</div>
                    ${isOwner ? `<button class="btn btn-primary" onclick="showAddRestaurantToGuideModal(${guide.id})">Add First Restaurant</button>` : ''}
                </div>
            `;
        } else {
            html += '<div class="guide-restaurants">';
            restaurants.forEach(item => {
                const restaurant = item.restaurant;
                const ratingStars = restaurant.rating ? '⭐'.repeat(Math.round(restaurant.rating)) : '';

                html += `
                    <div class="restaurant-card">
                        <div class="order-badge">#${item.order}</div>
                        <img src="${restaurant.imageUrl || '/images/placeholder.svg'}"
                             alt="${restaurant.name}"
                             class="restaurant-image"
                             onerror="this.onerror=null; this.src='/images/placeholder.svg'">
                        <div class="restaurant-info">
                            <h3 class="restaurant-name">${restaurant.name}</h3>
                            <div>
                                <span class="restaurant-category">${restaurant.category}</span>
                                <span class="restaurant-cuisine">${restaurant.cuisineType}</span>
                            </div>
                            <p class="restaurant-address">📍 ${restaurant.address}</p>
                            ${restaurant.rating ? `<div class="restaurant-rating">${ratingStars} ${restaurant.rating}/5</div>` : ''}
                            ${item.description ? `<p class="guide-restaurant-note">"${item.description}"</p>` : ''}
                            ${isOwner ? `<button class="btn btn-small btn-danger" onclick="removeRestaurantFromGuide(${guide.id}, ${restaurant.id})">Remove</button>` : ''}
                        </div>
                    </div>
                `;
            });
            html += '</div>';
        }

        html += '</div>';
        resultsSection.innerHTML = html;
    } catch (error) {
        resultsSection.innerHTML = '<div class="error-message">Failed to load guide</div>';
        console.error('Error loading guide:', error);
    }
}

function showCreateGuideModal() {
    if (!authService.isAuthenticated()) {
        showModal('loginModal');
        return;
    }

    const resultsSection = document.querySelector('.results-section');
    const html = `
        <div class="create-guide-modal">
            <h2>Create Neighborhood Guide</h2>
            <div class="form-group">
                <label>Guide Title</label>
                <input type="text" id="guideTitle" class="form-control" placeholder="e.g., Best of Little Italy">
            </div>
            <div class="form-group">
                <label>Neighborhood Name</label>
                <input type="text" id="guideNeighborhood" class="form-control" placeholder="e.g., Little Italy">
            </div>
            <div class="form-group">
                <label>Description</label>
                <textarea id="guideDescription" class="form-control" rows="4" placeholder="Describe what makes this guide special..."></textarea>
            </div>
            <div class="form-group">
                <label>Image URL (optional)</label>
                <input type="text" id="guideImageUrl" class="form-control" placeholder="https://...">
            </div>
            <div class="form-actions">
                <button class="btn btn-secondary" onclick="navigateTo('guides')">Cancel</button>
                <button class="btn btn-primary" onclick="createGuide()">Create Guide</button>
            </div>
        </div>
    `;
    resultsSection.innerHTML = html;
}

async function createGuide() {
    const title = document.getElementById('guideTitle').value.trim();
    const neighborhood = document.getElementById('guideNeighborhood').value.trim();
    const description = document.getElementById('guideDescription').value.trim();
    const imageUrl = document.getElementById('guideImageUrl').value.trim() || null;

    if (!title || !neighborhood || !description) {
        showError('Please fill in all required fields');
        return;
    }

    try {
        const guide = await guidesService.createGuide(title, description, neighborhood, imageUrl);
        showSuccess('Guide created successfully!');
        setTimeout(() => viewGuide(guide.id), 1000);
    } catch (error) {
        showError('Failed to create guide');
        console.error('Error creating guide:', error);
    }
}

async function deleteGuide(guideId) {
    if (!confirm('Are you sure you want to delete this guide?')) return;

    try {
        await guidesService.deleteGuide(guideId);
        showSuccess('Guide deleted successfully!');
        navigateTo('guides');
    } catch (error) {
        showError('Failed to delete guide');
        console.error('Error deleting guide:', error);
    }
}

async function showAddRestaurantToGuideModal(guideId) {
    const resultsSection = document.querySelector('.results-section');
    resultsSection.innerHTML = '<div class="page-loading">Loading restaurants...</div>';

    try {
        const restaurants = await fetch('/api/restaurants').then(r => r.json());

        let html = `
            <div class="add-restaurant-modal">
                <h2>Add Restaurant to Guide</h2>
                <p>Select a restaurant to add to your guide:</p>
                <div class="restaurant-list">
        `;

        restaurants.forEach(restaurant => {
            html += `
                <div class="restaurant-card" style="cursor: pointer;" onclick="addRestaurantToGuide(${guideId}, ${restaurant.id})">
                    <img src="${restaurant.imageUrl || '/images/placeholder.svg'}"
                         alt="${restaurant.name}"
                         class="restaurant-image"
                         onerror="this.onerror=null; this.src='/images/placeholder.svg'">
                    <div class="restaurant-info">
                        <h3 class="restaurant-name">${restaurant.name}</h3>
                        <span class="restaurant-category">${restaurant.category}</span>
                        <p class="restaurant-address">📍 ${restaurant.address}</p>
                    </div>
                </div>
            `;
        });

        html += `
                </div>
                <button class="btn btn-secondary" onclick="viewGuide(${guideId})">Cancel</button>
            </div>
        `;
        resultsSection.innerHTML = html;
    } catch (error) {
        showError('Failed to load restaurants');
        console.error('Error loading restaurants:', error);
    }
}

async function addRestaurantToGuide(guideId, restaurantId) {
    try {
        // Get current restaurants to determine next order number
        const existingRestaurants = await guidesService.getGuideRestaurants(guideId);
        const nextOrder = existingRestaurants.length + 1;

        await guidesService.addRestaurantToGuide(guideId, restaurantId, nextOrder);
        showSuccess('Restaurant added to guide!');
        setTimeout(() => viewGuide(guideId), 500);
    } catch (error) {
        showError(error.message || 'Failed to add restaurant. It may already be in the guide.');
        console.error('Error adding restaurant:', error);
    }
}

async function removeRestaurantFromGuide(guideId, restaurantId) {
    if (!confirm('Remove this restaurant from the guide?')) return;

    try {
        await guidesService.removeRestaurantFromGuide(guideId, restaurantId);
        showSuccess('Restaurant removed!');
        setTimeout(() => viewGuide(guideId), 500);
    } catch (error) {
        showError('Failed to remove restaurant');
        console.error('Error removing restaurant:', error);
    }
}

// =============================================================================
// Route Planning Page Functions
// =============================================================================

async function showRoutesPage() {
    const resultsSection = document.querySelector('.results-section');
    resultsSection.innerHTML = '<div class="page-loading">Loading routes...</div>';

    try {
        const routes = await routesService.getMyRoutes();

        let html = `
            <div class="routes-page">
                <div class="page-header">
                    <h2>🗺️ My Routes</h2>
                    <p class="subheader">Plan multi-restaurant food tours</p>
                </div>
                <button class="btn btn-primary" onclick="showCreateRouteModal()">Create New Route</button>
        `;

        if (routes.length === 0) {
            html += `
                <div class="empty-state">
                    <div class="empty-state-icon">🗺️</div>
                    <div class="empty-state-text">No routes yet</div>
                    <div class="empty-state-subtext">Create your first food tour route!</div>
                </div>
            `;
        } else {
            html += '<div class="routes-grid">';
            routes.forEach(route => {
                html += `
                    <div class="route-card" onclick="viewRoute(${route.id})">
                        <h3>${route.name}</h3>
                        <p class="route-meta">${route.stopCount} stop${route.stopCount !== 1 ? 's' : ''}</p>
                        ${route.isOptimized ? '<span class="badge badge-success">Optimized</span>' : '<span class="badge">Not optimized</span>'}
                        <p class="route-date">Created ${new Date(route.createdAt).toLocaleDateString()}</p>
                    </div>
                `;
            });
            html += '</div>';
        }

        html += '</div>';
        resultsSection.innerHTML = html;
    } catch (error) {
        resultsSection.innerHTML = '<div class="error-message">Failed to load routes</div>';
        console.error('Error loading routes:', error);
    }
}

async function viewRoute(routeId) {
    const resultsSection = document.querySelector('.results-section');
    resultsSection.innerHTML = '<div class="page-loading">Loading route...</div>';

    try {
        const [route, stops] = await Promise.all([
            routesService.getRoute(routeId),
            routesService.getRouteStops(routeId)
        ]);

        let html = `
            <div class="route-detail-page">
                <button class="btn btn-secondary" onclick="navigateTo('routes')">← Back to Routes</button>
                <div class="route-detail-header">
                    <h2>${route.name}</h2>
                    <div class="route-actions">
                        ${stops.length >= 2 ? `<button class="btn btn-primary" onclick="optimizeRoute(${route.id})">Optimize Route</button>` : ''}
                        <button class="btn btn-secondary" onclick="showAddStopModal(${route.id})">Add Stop</button>
                        <button class="btn btn-danger" onclick="deleteRoute(${route.id})">Delete Route</button>
                    </div>
                    ${route.isOptimized ? '<span class="badge badge-success">Route Optimized</span>' : ''}
                </div>
                <h3>Stops (${stops.length})</h3>
        `;

        if (stops.length === 0) {
            html += `
                <div class="empty-state">
                    <div class="empty-state-text">No stops in this route yet</div>
                    <button class="btn btn-primary" onclick="showAddStopModal(${route.id})">Add First Stop</button>
                </div>
            `;
        } else {
            html += '<div class="route-stops">';
            stops.forEach(stop => {
                const restaurant = stop.restaurant;
                const ratingStars = restaurant.rating ? '⭐'.repeat(Math.round(restaurant.rating)) : '';

                html += `
                    <div class="restaurant-card">
                        <div class="order-badge">Stop #${stop.order}</div>
                        <img src="${restaurant.imageUrl || '/images/placeholder.svg'}"
                             alt="${restaurant.name}"
                             class="restaurant-image"
                             onerror="this.onerror=null; this.src='/images/placeholder.svg'">
                        <div class="restaurant-info">
                            <h3 class="restaurant-name">${restaurant.name}</h3>
                            <div>
                                <span class="restaurant-category">${restaurant.category}</span>
                                <span class="restaurant-cuisine">${restaurant.cuisineType}</span>
                            </div>
                            <p class="restaurant-address">📍 ${restaurant.address}</p>
                            ${restaurant.rating ? `<div class="restaurant-rating">${ratingStars} ${restaurant.rating}/5</div>` : ''}
                            ${stop.notes ? `<p class="route-stop-note">📝 ${stop.notes}</p>` : ''}
                            <button class="btn btn-small btn-danger" onclick="removeStop(${route.id}, ${stop.id})">Remove</button>
                        </div>
                    </div>
                `;
            });
            html += '</div>';
        }

        html += '</div>';
        resultsSection.innerHTML = html;
    } catch (error) {
        resultsSection.innerHTML = '<div class="error-message">Failed to load route</div>';
        console.error('Error loading route:', error);
    }
}

function showCreateRouteModal() {
    const resultsSection = document.querySelector('.results-section');
    const html = `
        <div class="create-route-modal">
            <h2>Create New Route</h2>
            <div class="form-group">
                <label>Route Name</label>
                <input type="text" id="routeName" class="form-control" placeholder="e.g., Downtown Food Tour">
            </div>
            <div class="form-actions">
                <button class="btn btn-secondary" onclick="navigateTo('routes')">Cancel</button>
                <button class="btn btn-primary" onclick="createRoute()">Create Route</button>
            </div>
        </div>
    `;
    resultsSection.innerHTML = html;
}

async function createRoute() {
    const name = document.getElementById('routeName').value.trim();

    if (!name) {
        showError('Please enter a route name');
        return;
    }

    try {
        const route = await routesService.createRoute(name);
        showSuccess('Route created successfully!');
        setTimeout(() => viewRoute(route.id), 1000);
    } catch (error) {
        showError('Failed to create route');
        console.error('Error creating route:', error);
    }
}

async function deleteRoute(routeId) {
    if (!confirm('Are you sure you want to delete this route?')) return;

    try {
        await routesService.deleteRoute(routeId);
        showSuccess('Route deleted successfully!');
        navigateTo('routes');
    } catch (error) {
        showError('Failed to delete route');
        console.error('Error deleting route:', error);
    }
}

async function optimizeRoute(routeId) {
    try {
        await routesService.optimizeRoute(routeId);
        showSuccess('Route optimized!');
        setTimeout(() => viewRoute(routeId), 500);
    } catch (error) {
        showError(error.message || 'Failed to optimize route');
        console.error('Error optimizing route:', error);
    }
}

async function showAddStopModal(routeId) {
    const resultsSection = document.querySelector('.results-section');
    resultsSection.innerHTML = '<div class="page-loading">Loading restaurants...</div>';

    try {
        const restaurants = await fetch('/api/restaurants').then(r => r.json());

        let html = `
            <div class="add-stop-modal">
                <h2>Add Stop to Route</h2>
                <p>Select a restaurant to add to your route:</p>
                <div class="restaurant-list">
        `;

        restaurants.forEach(restaurant => {
            html += `
                <div class="restaurant-card" style="cursor: pointer;" onclick="addStopToRoute(${routeId}, ${restaurant.id})">
                    <img src="${restaurant.imageUrl || '/images/placeholder.svg'}"
                         alt="${restaurant.name}"
                         class="restaurant-image"
                         onerror="this.onerror=null; this.src='/images/placeholder.svg'">
                    <div class="restaurant-info">
                        <h3 class="restaurant-name">${restaurant.name}</h3>
                        <span class="restaurant-category">${restaurant.category}</span>
                        <p class="restaurant-address">📍 ${restaurant.address}</p>
                    </div>
                </div>
            `;
        });

        html += `
                </div>
                <button class="btn btn-secondary" onclick="viewRoute(${routeId})">Cancel</button>
            </div>
        `;
        resultsSection.innerHTML = html;
    } catch (error) {
        showError('Failed to load restaurants');
        console.error('Error loading restaurants:', error);
    }
}

async function addStopToRoute(routeId, restaurantId) {
    try {
        await routesService.addStop(routeId, restaurantId);
        showSuccess('Stop added to route!');
        setTimeout(() => viewRoute(routeId), 500);
    } catch (error) {
        showError(error.message || 'Failed to add stop. It may already be in the route.');
        console.error('Error adding stop:', error);
    }
}

async function removeStop(routeId, stopId) {
    if (!confirm('Remove this stop from the route?')) return;

    try {
        await routesService.removeStop(routeId, stopId);
        showSuccess('Stop removed!');
        setTimeout(() => viewRoute(routeId), 500);
    } catch (error) {
        showError('Failed to remove stop');
        console.error('Error removing stop:', error);
    }
}

async function viewList(listId) {
    const resultsSection = document.querySelector('.results-section');
    resultsSection.innerHTML = '<div class="page-loading">Loading list...</div>';

    try {
        const [list, items] = await Promise.all([
            favoritesService.getList(listId),
            favoritesService.getListItems(listId)
        ]);

        const backPage = currentPage === 'following' ? 'following' : currentPage === 'discover' ? 'discover' : 'myLists';

        const user = authService.getUser();
        const isOwner = user && list.userId === user.userId;

        let html = `
            <div class="list-detail-page">
                <div class="list-header">
                    <button class="btn btn-small" onclick="navigateTo('${backPage}')">← Back</button>
                    <h2>${list.name}</h2>
                    <p>By ${list.userDisplayName} • ${list.itemCount} restaurants • ${list.followerCount} followers</p>
                    ${renderTags(list.tags, isOwner, list.id, 'List')}
        `;

        // Show follow/unfollow button if viewing from discover page and authenticated
        if (currentPage === 'discover' && authService.isAuthenticated()) {
            if (user.userId !== list.userId) {
                if (list.isFollowing) {
                    html += `<button class="btn btn-primary" onclick="unfollowListFromDiscover(${list.id})">Unfollow</button>`;
                } else {
                    html += `<button class="btn btn-primary" onclick="followListFromDiscover(${list.id})">Follow</button>`;
                }
            }
        }

        html += '</div>';

        if (items.length === 0) {
            html += `
                <div class="empty-state">
                    <div class="empty-state-icon">🍽️</div>
                    <div class="empty-state-text">No restaurants in this list yet</div>
                </div>
            `;
        } else {
            html += '<div class="restaurant-list">';
            items.forEach(item => {
                const restaurant = item.restaurant;
                const ratingStars = restaurant.rating ? '⭐'.repeat(Math.round(restaurant.rating)) : '';
                const escapedName = restaurant.name.replace(/'/g, "\\'");

                html += `
                    <div class="restaurant-card">
                        <img src="${restaurant.imageUrl || '/images/placeholder.svg'}"
                             alt="${restaurant.name}"
                             class="restaurant-image"
                             loading="lazy"
                             onerror="this.onerror=null; this.src='/images/placeholder.svg'">
                        <div class="restaurant-info">
                            <h3 class="restaurant-name">${restaurant.name}</h3>
                            <div>
                                <span class="restaurant-category">${restaurant.category}</span>
                                <span class="restaurant-cuisine">${restaurant.cuisineType}</span>
                            </div>
                            <p class="restaurant-address">📍 ${restaurant.address}</p>
                            ${restaurant.rating ? `<div class="restaurant-rating">${ratingStars} ${restaurant.rating}/5</div>` : ''}
                            ${restaurant.description ? `<p class="restaurant-description">${restaurant.description}</p>` : ''}
                            ${item.notes ? `<p class="list-item-notes"><strong>Notes:</strong> ${item.notes}</p>` : ''}
                            <div class="restaurant-actions">
                                <button class="btn btn-small btn-directions" onclick="openDirections(${restaurant.latitude}, ${restaurant.longitude}, '${escapedName}')">
                                    🧭 Get Directions
                                </button>
                `;

                if (isOwner) {
                    html += `<button class="btn btn-small btn-danger" onclick="removeFromList(${listId}, ${item.id})">Remove</button>`;
                }

                html += `
                            </div>
                        </div>
                    </div>
                `;
            });
            html += '</div>';
        }

        html += '</div>';
        resultsSection.innerHTML = html;
    } catch (error) {
        // If the error is due to authentication and we're viewing from discover, show a more helpful message
        if (!authService.isAuthenticated() && currentPage === 'discover') {
            resultsSection.innerHTML = `
                <div class="error-message">
                    <h3>Please log in to view this list</h3>
                    <button class="btn btn-primary" onclick="showModal('loginModal')">Log In</button>
                    <button class="btn btn-secondary" onclick="navigateTo('discover')">← Back to Discover</button>
                </div>
            `;
        } else {
            resultsSection.innerHTML = '<div class="error-message">Failed to load list</div>';
        }
        console.error('Error loading list:', error);
    }
}

async function createNewList() {
    const name = prompt('Enter list name:');
    if (!name) return;

    const isPublic = confirm('Make this list public?');

    try {
        await favoritesService.createList(name, isPublic);
        await showMyListsPage();
    } catch (error) {
        alert('Failed to create list: ' + error.message);
    }
}

async function toggleListVisibility(listId, makePublic) {
    try {
        await favoritesService.updateList(listId, undefined, makePublic);
        await showMyListsPage();
    } catch (error) {
        alert('Failed to update list: ' + error.message);
    }
}

async function deleteList(listId) {
    if (!confirm('Are you sure you want to delete this list?')) return;

    try {
        await favoritesService.deleteList(listId);
        await showMyListsPage();
    } catch (error) {
        alert('Failed to delete list: ' + error.message);
    }
}

async function removeFromList(listId, itemId) {
    if (!confirm('Remove this restaurant from the list?')) return;

    try {
        await favoritesService.removeRestaurant(listId, itemId);
        await viewList(listId);
    } catch (error) {
        alert('Failed to remove restaurant: ' + error.message);
    }
}

async function unfollowList(listId) {
    if (!confirm('Unfollow this list?')) return;

    try {
        await favoritesService.unfollowList(listId);
        await showFollowingPage();
    } catch (error) {
        alert('Failed to unfollow list: ' + error.message);
    }
}

async function followListFromDiscover(listId) {
    if (!authService.isAuthenticated()) {
        showModal('loginModal');
        return;
    }

    try {
        await favoritesService.followList(listId);
        await showDiscoverPage();
    } catch (error) {
        alert('Failed to follow list: ' + error.message);
    }
}

async function unfollowListFromDiscover(listId) {
    if (!confirm('Unfollow this list?')) return;

    try {
        await favoritesService.unfollowList(listId);
        await showDiscoverPage();
    } catch (error) {
        alert('Failed to unfollow list: ' + error.message);
    }
}

async function viewListFromDiscover(listId) {
    await viewList(listId);
}

async function applyDiscoverFilters() {
    await showDiscoverPage();
}

async function clearDiscoverFilters() {
    // Clear the filter inputs by reloading the page without filters
    const discoverSearchInput = document.getElementById('discoverSearchInput');
    const discoverSortSelect = document.getElementById('discoverSortSelect');

    if (discoverSearchInput) discoverSearchInput.value = '';
    if (discoverSortSelect) discoverSortSelect.value = '';

    await showDiscoverPage();
}

function copyShareUrl(listId) {
    const input = document.getElementById(`share-${listId}`);
    input.select();
    document.execCommand('copy');
    alert('Share link copied to clipboard!');
}

async function showSharedListPage(shareUrl) {
    const resultsSection = document.querySelector('.results-section');
    resultsSection.innerHTML = '<div class="page-loading">Loading shared list...</div>';

    try {
        // Fetch list metadata and items
        const list = await favoritesService.getListByShareUrl(shareUrl);
        const items = await favoritesService.getListItems(list.id);

        let html = `
            <div class="list-detail-page">
                <div class="list-header">
                    <button class="btn btn-small" onclick="navigateTo('home')">← Home</button>
                    <h2>${list.name}</h2>
                    <p>By ${list.userDisplayName} • ${list.itemCount} restaurants • ${list.followerCount} followers</p>
        `;

        // Show follow/unfollow button if authenticated and not the owner
        if (authService.isAuthenticated()) {
            const user = authService.getUser();
            if (user.userId !== list.userId) {
                if (list.isFollowing) {
                    html += `<button class="btn btn-primary" onclick="unfollowSharedList(${list.id})">Unfollow</button>`;
                } else {
                    html += `<button class="btn btn-primary" onclick="followSharedList(${list.id})">Follow</button>`;
                }
            }
        } else {
            html += `<p><em>Login to follow this list</em></p>`;
        }

        html += '</div>';

        if (items.length === 0) {
            html += `
                <div class="empty-state">
                    <div class="empty-state-icon">🍽️</div>
                    <div class="empty-state-text">No restaurants in this list yet</div>
                </div>
            `;
        } else {
            html += '<div class="restaurant-list">';
            items.forEach(item => {
                const restaurant = item.restaurant;
                const ratingStars = restaurant.rating ? '⭐'.repeat(Math.round(restaurant.rating)) : '';
                const escapedName = restaurant.name.replace(/'/g, "\\'");

                html += `
                    <div class="restaurant-card">
                        <img src="${restaurant.imageUrl || '/images/placeholder.svg'}"
                             alt="${restaurant.name}"
                             class="restaurant-image"
                             loading="lazy"
                             onerror="this.onerror=null; this.src='/images/placeholder.svg'">
                        <div class="restaurant-info">
                            <h3 class="restaurant-name">${restaurant.name}</h3>
                            <div>
                                <span class="restaurant-category">${restaurant.category}</span>
                                <span class="restaurant-cuisine">${restaurant.cuisineType}</span>
                            </div>
                            <p class="restaurant-address">📍 ${restaurant.address}</p>
                            ${restaurant.rating ? `<div class="restaurant-rating">${ratingStars} ${restaurant.rating}/5</div>` : ''}
                            ${restaurant.description ? `<p class="restaurant-description">${restaurant.description}</p>` : ''}
                            ${item.notes ? `<p class="list-item-notes"><strong>Notes:</strong> ${item.notes}</p>` : ''}
                            <div class="restaurant-actions">
                                <button class="btn btn-small btn-directions" onclick="openDirections(${restaurant.latitude}, ${restaurant.longitude}, '${escapedName}')">
                                    🧭 Get Directions
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            });
            html += '</div>';
        }

        html += '</div>';
        resultsSection.innerHTML = html;
    } catch (error) {
        resultsSection.innerHTML = `
            <div class="error-message">
                <h3>Failed to load shared list</h3>
                <p>This list may not exist or is no longer public.</p>
                <button class="btn btn-primary" onclick="navigateTo('home')">Go to Home</button>
            </div>
        `;
        console.error('Error loading shared list:', error);
    }
}

async function followSharedList(listId) {
    try {
        await favoritesService.followList(listId);
        // Reload the current shared list
        handleHashChange();
    } catch (error) {
        alert('Failed to follow list: ' + error.message);
    }
}

async function unfollowSharedList(listId) {
    if (!confirm('Unfollow this list?')) return;

    try {
        await favoritesService.unfollowList(listId);
        // Reload the current shared list
        handleHashChange();
    } catch (error) {
        alert('Failed to unfollow list: ' + error.message);
    }
}

// ============= HASHTAG FUNCTIONS =============

function renderTags(tags, isOwner, entityId, entityType) {
    if (!tags || tags.length === 0) {
        return isOwner ? `
            <div class="tags-container">
                <div class="tag-input-section">
                    <input type="text" id="${entityType}TagInput${entityId}"
                           placeholder="Add tags (e.g., italian, cozy)"
                           class="tag-input">
                    <button class="btn btn-small" onclick="addTag${entityType}(${entityId})">Add Tag</button>
                </div>
            </div>
        ` : '';
    }

    let html = '<div class="tags-container"><div class="tags-list">';
    tags.forEach(tag => {
        html += `
            <span class="tag">
                #${tag.name}
                ${isOwner ? `<button class="tag-remove" onclick="removeTag${entityType}(${entityId}, ${tag.id})" title="Remove tag">&times;</button>` : ''}
            </span>
        `;
    });
    html += '</div>';

    if (isOwner) {
        html += `
            <div class="tag-input-section">
                <input type="text" id="${entityType}TagInput${entityId}"
                       placeholder="Add tags (e.g., italian, cozy)"
                       class="tag-input">
                <button class="btn btn-small" onclick="addTag${entityType}(${entityId})">Add Tag</button>
            </div>
        `;
    }

    html += '</div>';
    return html;
}

async function addTagList(listId) {
    const input = document.getElementById(`ListTagInput${listId}`);
    const tagName = input.value.trim();

    if (!tagName) {
        alert('Please enter a tag name');
        return;
    }

    try {
        await favoritesService.addTag(listId, tagName);
        input.value = '';
        await viewList(listId);
    } catch (error) {
        alert('Failed to add tag: ' + error.message);
    }
}

async function removeTagList(listId, tagId) {
    if (!confirm('Remove this tag?')) return;

    try {
        await favoritesService.removeTag(listId, tagId);
        await viewList(listId);
    } catch (error) {
        alert('Failed to remove tag: ' + error.message);
    }
}

async function addTagGuide(guideId) {
    const input = document.getElementById(`GuideTagInput${guideId}`);
    const tagName = input.value.trim();

    if (!tagName) {
        alert('Please enter a tag name');
        return;
    }

    try {
        await guidesService.addTag(guideId, tagName);
        input.value = '';
        await viewGuide(guideId);
    } catch (error) {
        alert('Failed to add tag: ' + error.message);
    }
}

async function removeTagGuide(guideId, tagId) {
    if (!confirm('Remove this tag?')) return;

    try {
        await guidesService.removeTag(guideId, tagId);
        await viewGuide(guideId);
    } catch (error) {
        alert('Failed to remove tag: ' + error.message);
    }
}
