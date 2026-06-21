    const API_BASE_URL = 'http://localhost:3000';

    async function request(path, { method = 'GET', body, token } = {}) {
        const headers = {
            'Content-Type': 'application/json',
        };

        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE_URL}${path}`, {
            method,
            headers,
            body: body ? JSON.stringify(body) : undefined,
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            const message = data.message || `Erro na requisição (${response.status})`;
            throw new Error(message);
        }

        return data;
    }

    export async function login(payload) {
        return request('/auth/login', { method: 'POST', body: payload });
    }

    export async function getUsers(token) {
        return request('/users', { token });
    }

    export async function getPostsByUserId(userId, token) {
        return request(`/users/${userId}/posts`, { token });
    }

    export async function createUser(payload, token) {
        return request('/auth/register', {
            method: 'POST',
            body: { ...payload, password: payload.password || '123456' },
            token,
        });
    }

    export async function register(payload) {
        return request('/auth/register', {
            method: 'POST',
            body: payload,
        });
    }

    export async function getPontos(token) {
        return request('/pontos', { token });
    }

    export async function getHistoricoPontos(token) {
        return request('/pontos/historico', { token });
    }

    export async function getOfensiva(token) {
        return request('/ofensiva', { token });
    }

    export async function getTempoSessao(userId, token) {
        return request(`/sessao/tempo/${userId}`, { token });
    }

    export async function getAcessosRecentes(userId, token) {
        return request(`/acessos-recentes/${userId}`, { token });
    }

    export async function getRanking(token) {
        return request('/rankings', { token });
    }