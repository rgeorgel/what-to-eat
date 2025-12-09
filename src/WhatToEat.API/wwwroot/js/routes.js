// Route Planning Service
class RoutesService {
    constructor() {
        this.baseUrl = '/api/routes';
    }

    async getMyRoutes() {
        const response = await fetch(this.baseUrl, {
            headers: {
                ...authService.getAuthHeaders()
            }
        });

        if (!response.ok) throw new Error('Failed to fetch routes');
        return await response.json();
    }

    async getRoute(id) {
        const response = await fetch(`${this.baseUrl}/${id}`, {
            headers: {
                ...authService.getAuthHeaders()
            }
        });

        if (!response.ok) throw new Error('Failed to fetch route');
        return await response.json();
    }

    async getRouteStops(id) {
        const response = await fetch(`${this.baseUrl}/${id}/stops`, {
            headers: {
                ...authService.getAuthHeaders()
            }
        });

        if (!response.ok) throw new Error('Failed to fetch route stops');
        return await response.json();
    }

    async createRoute(name, startLat = null, startLon = null, endLat = null, endLon = null) {
        const response = await fetch(this.baseUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...authService.getAuthHeaders()
            },
            body: JSON.stringify({
                name,
                startLatitude: startLat,
                startLongitude: startLon,
                endLatitude: endLat,
                endLongitude: endLon
            })
        });

        if (!response.ok) throw new Error('Failed to create route');
        return await response.json();
    }

    async updateRoute(id, name, startLat = null, startLon = null, endLat = null, endLon = null) {
        const response = await fetch(`${this.baseUrl}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                ...authService.getAuthHeaders()
            },
            body: JSON.stringify({
                name,
                startLatitude: startLat,
                startLongitude: startLon,
                endLatitude: endLat,
                endLongitude: endLon
            })
        });

        if (!response.ok) throw new Error('Failed to update route');
    }

    async deleteRoute(id) {
        const response = await fetch(`${this.baseUrl}/${id}`, {
            method: 'DELETE',
            headers: {
                ...authService.getAuthHeaders()
            }
        });

        if (!response.ok) throw new Error('Failed to delete route');
    }

    async addStop(routeId, restaurantId, order = null, notes = null) {
        const response = await fetch(`${this.baseUrl}/${routeId}/stops`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...authService.getAuthHeaders()
            },
            body: JSON.stringify({ restaurantId, order, notes })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to add stop to route');
        }
        return await response.json();
    }

    async removeStop(routeId, stopId) {
        const response = await fetch(`${this.baseUrl}/${routeId}/stops/${stopId}`, {
            method: 'DELETE',
            headers: {
                ...authService.getAuthHeaders()
            }
        });

        if (!response.ok) throw new Error('Failed to remove stop from route');
    }

    async optimizeRoute(routeId) {
        const response = await fetch(`${this.baseUrl}/${routeId}/optimize`, {
            method: 'POST',
            headers: {
                ...authService.getAuthHeaders()
            }
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to optimize route');
        }
        return await response.json();
    }

    async reorderStops(routeId, stopOrders) {
        const response = await fetch(`${this.baseUrl}/${routeId}/reorder`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                ...authService.getAuthHeaders()
            },
            body: JSON.stringify(stopOrders)
        });

        if (!response.ok) throw new Error('Failed to reorder stops');
    }
}

// Create singleton instance
const routesService = new RoutesService();
