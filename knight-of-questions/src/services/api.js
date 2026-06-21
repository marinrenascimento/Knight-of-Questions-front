    const API_BASE_URL = 'http://localhost:3000';

    export class ApiError extends Error {
    	constructor(message, status) {
    		super(message);
    		this.status = status;
    	}
    }

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
    		if (response.status === 401) {
    			window.dispatchEvent(new Event('auth:expired'));
    		}

    		const message = data.message || `Erro na requisição (${response.status})`;
    		throw new ApiError(message, response.status);
    	}

    	return data;
    }

    export async function login(payload) {
    	return request('/auth/login', { method: 'POST', body: payload });
    }

    export async function register(payload) {
    	return request('/auth/register', {
    		method: 'POST',
    		body: payload,
    	});
    }

    export async function getUsers(token) {
    	return request('/users', { token });
    }

    export async function getUserById(userId, token) {
    	return request(`/users/view/${userId}`, { token });
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

    export async function startSessao(userId, token) {
    	return request('/sessao/start', { method: 'POST', body: { user_id: userId }, token });
    }

    export async function endSessao(sessaoId, token) {
    	return request(`/sessao/end/${sessaoId}`, { method: 'PUT', token });
    }

    export async function updateOfensiva(acao, token) {
    	return request('/ofensiva/update', {
    		method: 'POST',
    		body: acao ? { acao } : {},
    		token,
    	});
    }

    export async function getRanking(token) {
    	return request('/rankings', { token });
    }
