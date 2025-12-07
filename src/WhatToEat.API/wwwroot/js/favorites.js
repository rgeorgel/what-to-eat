// Favorites Module
class FavoritesService {
    constructor() {
        this.baseUrl = '/api/favoritelists';
    }

    async getMyLists() {
        const response = await fetch(this.baseUrl, {
            headers: {
                ...authService.getAuthHeaders()
            }
        });

        if (!response.ok) throw new Error('Failed to fetch lists');
        return await response.json();
    }

    async getList(id) {
        const response = await fetch(`${this.baseUrl}/${id}`, {
            headers: {
                ...authService.getAuthHeaders()
            }
        });

        if (!response.ok) throw new Error('Failed to fetch list');
        return await response.json();
    }

    async getListByShareUrl(shareUrl) {
        const response = await fetch(`${this.baseUrl}/share/${shareUrl}`, {
            headers: {
                ...authService.getAuthHeaders()
            }
        });

        if (!response.ok) throw new Error('Failed to fetch shared list');
        return await response.json();
    }

    async createList(name, isPublic = false) {
        const response = await fetch(this.baseUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...authService.getAuthHeaders()
            },
            body: JSON.stringify({ name, isPublic })
        });

        if (!response.ok) throw new Error('Failed to create list');
        return await response.json();
    }

    async updateList(id, name, isPublic) {
        const body = {};
        if (name !== undefined) body.name = name;
        if (isPublic !== undefined) body.isPublic = isPublic;

        const response = await fetch(`${this.baseUrl}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                ...authService.getAuthHeaders()
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) throw new Error('Failed to update list');
    }

    async deleteList(id) {
        const response = await fetch(`${this.baseUrl}/${id}`, {
            method: 'DELETE',
            headers: {
                ...authService.getAuthHeaders()
            }
        });

        if (!response.ok) throw new Error('Failed to delete list');
    }

    async getListItems(id) {
        const response = await fetch(`${this.baseUrl}/${id}/items`, {
            headers: {
                ...authService.getAuthHeaders()
            }
        });

        if (!response.ok) throw new Error('Failed to fetch list items');
        return await response.json();
    }

    async addRestaurant(listId, restaurantId, notes = null) {
        const response = await fetch(`${this.baseUrl}/${listId}/items`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...authService.getAuthHeaders()
            },
            body: JSON.stringify({ restaurantId, notes })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to add restaurant');
        }
        return await response.json();
    }

    async removeRestaurant(listId, itemId) {
        const response = await fetch(`${this.baseUrl}/${listId}/items/${itemId}`, {
            method: 'DELETE',
            headers: {
                ...authService.getAuthHeaders()
            }
        });

        if (!response.ok) throw new Error('Failed to remove restaurant');
    }

    async followList(id) {
        const response = await fetch(`${this.baseUrl}/${id}/follow`, {
            method: 'POST',
            headers: {
                ...authService.getAuthHeaders()
            }
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to follow list');
        }
        return await response.json();
    }

    async unfollowList(id) {
        const response = await fetch(`${this.baseUrl}/${id}/follow`, {
            method: 'DELETE',
            headers: {
                ...authService.getAuthHeaders()
            }
        });

        if (!response.ok) throw new Error('Failed to unfollow list');
    }

    async getFollowingLists() {
        const response = await fetch(`${this.baseUrl}/following`, {
            headers: {
                ...authService.getAuthHeaders()
            }
        });

        if (!response.ok) throw new Error('Failed to fetch following lists');
        return await response.json();
    }

    async getPublicLists() {
        const response = await fetch(`${this.baseUrl}/public`, {
            headers: {
                ...authService.getAuthHeaders()
            }
        });

        if (!response.ok) throw new Error('Failed to fetch public lists');
        return await response.json();
    }
}

// Create singleton instance
const favoritesService = new FavoritesService();
