// API Base URL
const API_BASE_URL = '/api';

// Global variables
let map = null;
let markers = [];
let userLocation = null;
let allRestaurants = [];

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

async function initializeApp() {
    // Set up event listeners
    setupEventListeners();

    // Load filter options
    await loadFilterOptions();

    // Load all restaurants initially
    await loadRestaurants();

    // Initialize map
    initializeMap();
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
        </div>
    `;

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

        const popupContent = `
            <div class="popup-name">${restaurant.name}</div>
            <div class="popup-category">${restaurant.category} - ${restaurant.cuisineType}</div>
            <div class="popup-address">${restaurant.address}</div>
            ${restaurant.rating ? `<div class="popup-rating">⭐ ${restaurant.rating}/5</div>` : ''}
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
