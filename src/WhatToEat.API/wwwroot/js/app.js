// API Base URL
const API_BASE_URL = '/api';

// Global variables
let map = null;
let markers = [];
let userLocation = null;
let allRestaurants = [];
let currentPage = 'home';
let selectedRestaurantForFavorite = null;

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

    // Load all restaurants initially - only if not on a share page
    if (!window.location.hash.startsWith('#/share/')) {
        await loadRestaurants();
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

    // View toggle buttons
    document.getElementById('listViewBtn').addEventListener('click', () => toggleView('list'));
    document.getElementById('mapViewBtn').addEventListener('click', () => toggleView('map'));

    // Filters
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
    document.getElementById('myListsLink').addEventListener('click', (e) => {
        e.preventDefault();
        navigateTo('myLists');
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

    // Hash change for routing
    window.addEventListener('hashchange', handleHashChange);
}

async function loadFilterOptions() {
    try {
        // Load categories
        const categoriesResponse = await fetch(`${API_BASE_URL}/restaurants/categories`);
        const categories = await categoriesResponse.json();

        const categorySelect = document.getElementById('categoryFilter');
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categorySelect.appendChild(option);
        });

        // Load cuisine types
        const cuisinesResponse = await fetch(`${API_BASE_URL}/restaurants/cuisine-types`);
        const cuisines = await cuisinesResponse.json();

        const cuisineSelect = document.getElementById('cuisineFilter');
        cuisines.forEach(cuisine => {
            const option = document.createElement('option');
            option.value = cuisine;
            option.textContent = cuisine;
            cuisineSelect.appendChild(option);
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

async function loadNearbyRestaurants(latitude, longitude, radius, category = '') {
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

    const searchParams = {};
    if (query) searchParams.query = query;
    if (category) searchParams.category = category;
    if (cuisineType) searchParams.cuisineType = cuisineType;

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

            loadNearbyRestaurants(
                userLocation.lat,
                userLocation.lng,
                radius,
                category
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

    // Escape single quotes in restaurant name for onclick handler
    const escapedName = restaurant.name.replace(/'/g, "\\'");

    card.innerHTML = `
        <img src="${restaurant.imageUrl || 'https://via.placeholder.com/300x200?text=No+Image'}"
             alt="${restaurant.name}"
             class="restaurant-image"
             onerror="this.src='https://via.placeholder.com/300x200?text=No+Image'">
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
                <button class="btn btn-small btn-directions" onclick="openDirections(${restaurant.latitude}, ${restaurant.longitude}, '${escapedName}')">
                    🧭 Get Directions
                </button>
                ${favoriteButtonHtml}
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
    // Encode the restaurant name for URL
    const encodedName = encodeURIComponent(name);

    // Use Google Maps universal URL that works on both iOS and Android
    // This will open in the Google Maps app if installed, otherwise in browser
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${encodedName}`;

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

async function viewList(listId) {
    const resultsSection = document.querySelector('.results-section');
    resultsSection.innerHTML = '<div class="page-loading">Loading list...</div>';

    try {
        const [list, items] = await Promise.all([
            favoritesService.getList(listId),
            favoritesService.getListItems(listId)
        ]);

        const backPage = currentPage === 'following' ? 'following' : currentPage === 'discover' ? 'discover' : 'myLists';

        let html = `
            <div class="list-detail-page">
                <div class="list-header">
                    <button class="btn btn-small" onclick="navigateTo('${backPage}')">← Back</button>
                    <h2>${list.name}</h2>
                    <p>By ${list.userDisplayName} • ${list.itemCount} restaurants • ${list.followerCount} followers</p>
        `;

        // Show follow/unfollow button if viewing from discover page and authenticated
        if (currentPage === 'discover' && authService.isAuthenticated()) {
            const user = authService.getUser();
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
                        <img src="${restaurant.imageUrl || 'https://via.placeholder.com/300x200?text=No+Image'}"
                             alt="${restaurant.name}"
                             class="restaurant-image"
                             onerror="this.src='https://via.placeholder.com/300x200?text=No+Image'">
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

                const user = authService.getUser();
                if (user && list.userId === user.userId) {
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
                        <img src="${restaurant.imageUrl || 'https://via.placeholder.com/300x200?text=No+Image'}"
                             alt="${restaurant.name}"
                             class="restaurant-image"
                             onerror="this.src='https://via.placeholder.com/300x200?text=No+Image'">
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
