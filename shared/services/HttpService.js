// shared/services/HttpService.js

import { BASE_URL } from './config.js';

export default class HttpService {
    #baseURL;
    #defaultHeaders;

    constructor() {
        // BASE_URL debe ser 'https://localhost:7081' (sin /api)
        this.#baseURL = BASE_URL;
        this.#defaultHeaders = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };
    }

    #getAuthToken() {
        return localStorage.getItem('token_mimi') || localStorage.getItem('authToken') || '';
    }

    #buildHeaders(additionalHeaders = {}) {
        const token = this.#getAuthToken();
        const headers = { ...this.#defaultHeaders, ...additionalHeaders };
        
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        return headers;
    }

    async get(endpoint, queryParams = null) {
        let url = `${this.#baseURL}${endpoint}`;
        
        if (queryParams) {
            const params = new URLSearchParams(queryParams);
            url += `?${params.toString()}`;
        }

        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: this.#buildHeaders()
            });

            return await this.#handleResponse(response);
        } catch (error) {
            return this.#handleError(error);
        }
    }

    async post(endpoint, body = null) {
        try {
            const response = await fetch(`${this.#baseURL}${endpoint}`, {
                method: 'POST',
                headers: this.#buildHeaders(),
                body: body ? JSON.stringify(body) : null
            });

            return await this.#handleResponse(response);
        } catch (error) {
            return this.#handleError(error);
        }
    }

    async put(endpoint, body = null) {
        try {
            const response = await fetch(`${this.#baseURL}${endpoint}`, {
                method: 'PUT',
                headers: this.#buildHeaders(),
                body: body ? JSON.stringify(body) : null
            });

            return await this.#handleResponse(response);
        } catch (error) {
            return this.#handleError(error);
        }
    }

    async patch(endpoint, body = null) {
        try {
            const response = await fetch(`${this.#baseURL}${endpoint}`, {
                method: 'PATCH',
                headers: this.#buildHeaders(),
                body: body ? JSON.stringify(body) : null
            });

            return await this.#handleResponse(response);
        } catch (error) {
            return this.#handleError(error);
        }
    }

    async delete(endpoint) {
        try {
            const response = await fetch(`${this.#baseURL}${endpoint}`, {
                method: 'DELETE',
                headers: this.#buildHeaders()
            });

            return await this.#handleResponse(response);
        } catch (error) {
            return this.#handleError(error);
        }
    }

    async #handleResponse(response) {
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw {
                status: response.status,
                statusText: response.statusText,
                message: errorData.message || errorData.title || 'Error en la petición',
                data: errorData
            };
        }

        if (response.status === 204) {
            return { success: true };
        }

        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            return await response.json();
        }

        return { success: true };
    }

    #handleError(error) {
        console.error('❌ Error en petición HTTP:', error);
        
        return {
            success: false,
            status: error.status || 500,
            message: error.message || 'Error de conexión con el servidor',
            originalError: error
        };
    }
}