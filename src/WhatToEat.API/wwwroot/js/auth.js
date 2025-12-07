// Authentication Module
const AUTH_TOKEN_KEY = 'authToken';
const USER_DATA_KEY = 'userData';

class AuthService {
    constructor() {
        this.token = localStorage.getItem(AUTH_TOKEN_KEY);
        this.user = JSON.parse(localStorage.getItem(USER_DATA_KEY) || 'null');
    }

    isAuthenticated() {
        return !!this.token;
    }

    getToken() {
        return this.token;
    }

    getUser() {
        return this.user;
    }

    async register(username, email, password, displayName) {
        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username,
                    email,
                    password,
                    displayName
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.errors ? error.errors.join(', ') : 'Registration failed');
            }

            const data = await response.json();
            this.setAuth(data);
            return data;
        } catch (error) {
            throw error;
        }
    }

    async login(usernameOrEmail, password) {
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    usernameOrEmail,
                    password
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Login failed');
            }

            const data = await response.json();
            this.setAuth(data);
            return data;
        } catch (error) {
            throw error;
        }
    }

    logout() {
        this.token = null;
        this.user = null;
        localStorage.removeItem(AUTH_TOKEN_KEY);
        localStorage.removeItem(USER_DATA_KEY);
        window.location.reload();
    }

    setAuth(data) {
        this.token = data.token;
        this.user = {
            userId: data.userId,
            username: data.username,
            email: data.email,
            displayName: data.displayName
        };
        localStorage.setItem(AUTH_TOKEN_KEY, this.token);
        localStorage.setItem(USER_DATA_KEY, JSON.stringify(this.user));
    }

    getAuthHeaders() {
        if (!this.token) {
            return {};
        }
        return {
            'Authorization': `Bearer ${this.token}`
        };
    }
}

// Create singleton instance
const authService = new AuthService();
