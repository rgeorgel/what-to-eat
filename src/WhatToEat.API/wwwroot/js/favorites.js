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

    async createList(name, isPublic = false, listType = 0) {
        const response = await fetch(this.baseUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...authService.getAuthHeaders()
            },
            body: JSON.stringify({ name, isPublic, listType })
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

    async getPublicLists(searchTerm = null, sortBy = null, tags = null) {
        const params = new URLSearchParams();
        if (searchTerm) params.append('searchTerm', searchTerm);
        if (sortBy) params.append('sortBy', sortBy);
        if (tags) params.append('tags', tags);

        const queryString = params.toString();
        const url = queryString ? `${this.baseUrl}/public?${queryString}` : `${this.baseUrl}/public`;

        const response = await fetch(url, {
            headers: {
                ...authService.getAuthHeaders()
            }
        });

        if (!response.ok) throw new Error('Failed to fetch public lists');
        return await response.json();
    }

    async getListsByType(listType) {
        const response = await fetch(`${this.baseUrl}/by-type/${listType}`, {
            headers: {
                ...authService.getAuthHeaders()
            }
        });

        if (!response.ok) throw new Error('Failed to fetch lists by type');
        return await response.json();
    }

    async changeListType(listId, newType) {
        const response = await fetch(`${this.baseUrl}/${listId}/change-type?newType=${newType}`, {
            method: 'POST',
            headers: {
                ...authService.getAuthHeaders()
            }
        });

        if (!response.ok) throw new Error('Failed to change list type');
        return await response.json();
    }

    async addTag(listId, tagName) {
        const response = await fetch(`${this.baseUrl}/${listId}/tags`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...authService.getAuthHeaders()
            },
            body: JSON.stringify({ name: tagName })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to add tag');
        }
        return await response.json();
    }

    async removeTag(listId, tagId) {
        const response = await fetch(`${this.baseUrl}/${listId}/tags/${tagId}`, {
            method: 'DELETE',
            headers: {
                ...authService.getAuthHeaders()
            }
        });

        if (!response.ok) throw new Error('Failed to remove tag');
    }

    async getPopularTags(limit = 20) {
        const response = await fetch(`${this.baseUrl}/tags/popular?limit=${limit}`, {
            headers: {
                ...authService.getAuthHeaders()
            }
        });

        if (!response.ok) throw new Error('Failed to fetch popular tags');
        return await response.json();
    }
}

// ListType enum (matching backend)
const ListType = {
    Favorites: 0,
    Watchlist: 1,
    Visited: 2
};

// Create singleton instance
const favoritesService = new FavoritesService();
