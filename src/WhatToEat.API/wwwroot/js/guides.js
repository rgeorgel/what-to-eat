// Neighborhood Guides Service
class GuidesService {
    constructor() {
        this.baseUrl = '/api/neighborhoodguides';
    }

    async getAllGuides(neighborhood = null, officialOnly = null) {
        const params = new URLSearchParams();
        if (neighborhood) params.append('neighborhood', neighborhood);
        if (officialOnly !== null) params.append('officialOnly', officialOnly);

        const queryString = params.toString();
        const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;

        const response = await fetch(url, {
            headers: {
                ...authService.getAuthHeaders()
            }
        });

        if (!response.ok) throw new Error('Failed to fetch guides');
        return await response.json();
    }

    async getGuide(id) {
        const response = await fetch(`${this.baseUrl}/${id}`, {
            headers: {
                ...authService.getAuthHeaders()
            }
        });

        if (!response.ok) throw new Error('Failed to fetch guide');
        return await response.json();
    }

    async getGuideRestaurants(id) {
        const response = await fetch(`${this.baseUrl}/${id}/restaurants`, {
            headers: {
                ...authService.getAuthHeaders()
            }
        });

        if (!response.ok) throw new Error('Failed to fetch guide restaurants');
        return await response.json();
    }

    async createGuide(title, description, neighborhoodName, imageUrl = null) {
        const response = await fetch(this.baseUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...authService.getAuthHeaders()
            },
            body: JSON.stringify({ title, description, neighborhoodName, imageUrl })
        });

        if (!response.ok) throw new Error('Failed to create guide');
        return await response.json();
    }

    async updateGuide(id, title, description, neighborhoodName, imageUrl = null) {
        const response = await fetch(`${this.baseUrl}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                ...authService.getAuthHeaders()
            },
            body: JSON.stringify({ title, description, neighborhoodName, imageUrl })
        });

        if (!response.ok) throw new Error('Failed to update guide');
    }

    async deleteGuide(id) {
        const response = await fetch(`${this.baseUrl}/${id}`, {
            method: 'DELETE',
            headers: {
                ...authService.getAuthHeaders()
            }
        });

        if (!response.ok) throw new Error('Failed to delete guide');
    }

    async addRestaurantToGuide(guideId, restaurantId, order, description = null) {
        const response = await fetch(`${this.baseUrl}/${guideId}/restaurants`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...authService.getAuthHeaders()
            },
            body: JSON.stringify({ restaurantId, order, description })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to add restaurant to guide');
        }
        return await response.json();
    }

    async removeRestaurantFromGuide(guideId, restaurantId) {
        const response = await fetch(`${this.baseUrl}/${guideId}/restaurants/${restaurantId}`, {
            method: 'DELETE',
            headers: {
                ...authService.getAuthHeaders()
            }
        });

        if (!response.ok) throw new Error('Failed to remove restaurant from guide');
    }

    async getNeighborhoods() {
        const response = await fetch(`${this.baseUrl}/neighborhoods`, {
            headers: {
                ...authService.getAuthHeaders()
            }
        });

        if (!response.ok) throw new Error('Failed to fetch neighborhoods');
        return await response.json();
    }
}

// Create singleton instance
const guidesService = new GuidesService();
