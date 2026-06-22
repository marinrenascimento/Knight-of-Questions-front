    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '';

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
        return request(`/pontos?t=${Date.now()}`, { token });
    }

    export async function getHistoricoPontos(token) {
        return request('/pontos/historico', { token });
    }

    export async function addPontos(data, token) {
    const body =
        typeof data === 'number'
            ? { acao: 'cards', pontosGanhos: data }
            : data;

    return request('/pontos/add', {
        method: 'POST',
        body,
        token,
    });
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

export async function getDisciplinas(token) {
    return request('/disciplinas/getAll', { token });
}

export async function getConteudosByDisciplina(disciplinaId, token) {
    return request(`/conteudos/disciplina/${disciplinaId}`, { token });
}

export async function getAvaliacoesByUser(userId, token) {
    return request(`/avaliacoes/user/${userId}`, { token });
}

export async function getAvaliacoesVestibulares(token) {
    return request('/avaliacoes/vestibular/all', { token });
}

export async function getAvaliacaoById(id, token) {
    return request(`/avaliacoes/${id}`, { token });
}

export async function createAvaliacao(payload, token) {
    return request('/avaliacoes/create', { method: 'POST', body: payload, token });
}

export async function createAvaliacaoPorDisciplina(payload, token) {
    return request('/avaliacoes/por-disciplina', { method: 'POST', body: payload, token });
}

export async function deleteAvaliacao(id, token) {
    return request(`/avaliacoes/delete/${id}`, { method: 'DELETE', token });
}

export async function createPergunta(payload, token) {
    return request('/perguntas/create', { method: 'POST', body: payload, token });
}

export async function updatePergunta(id, payload, token) {
    return request(`/perguntas/update/${id}`, { method: 'PATCH', body: payload, token });
}

export async function deletePergunta(id, token) {
    return request(`/perguntas/delete/${id}`, { method: 'DELETE', token });
}

    export async function getRanking(token) {
        return request('/rankings', { token });
    }

    export async function startSessao(userId, token) {
        return request('/sessao/start', {
            method: 'POST',
            body: { user_id: userId },
            token,
        });
    }

    export async function endSessao(sessaoId, token) {
        return request(`/sessao/end/${sessaoId}`, {
            method: 'PUT',
            token,
        });
    }

    export async function updateOfensiva(acao, token) {
        return request('/ofensiva/update', {
            method: 'POST',
            body: acao ? { acao } : {},
            token,
        });
    }

    export async function getDecks(userId, token) {
        return request(`/deck/user/${userId}`, { token });
    }

    export async function createDeck(userId, payload, token) {
        return request(`/deck/create/${userId}`, {
            method: 'POST',
            body: payload,
            token,
        });
    }

    export async function updateDeck(userId, deckId, payload, token) {
        return request(`/deck/update/${userId}/${deckId}`, {
            method: 'PUT',
            body: payload,
            token,
        });
    }

    export async function deleteDeck(userId, deckId, token) {
        return request(`/deck/delete/${userId}/${deckId}`, {
            method: 'DELETE',
            token,
        });
    }

    export async function getCards(deckId, token) {
        return request(`/flashcards/deck/${deckId}`, { token });
    }

    export async function reviewCard(cardId, payload, token) {
        return request(`/flashcards/review/${cardId}`, {
            method: 'PUT',
            body: payload,
            token,
        });
    }

    export async function createCard(payload, token) {
        return request('/flashcards/create', {
            method: 'POST',
            body: payload,
            token,
        });
    }

    export async function editCard(cardId, payload, token) {
        return request(`/flashcards/update/${cardId}`, {
            method: 'PATCH',
            body: payload,
            token,
        });
    }

    export async function deleteCard(cardId, token) {
        return request(`/flashcards/delete/${cardId}`, {
            method: 'DELETE',
            token,
        });
    }

    export async function startDeckReview(deckId, token) {
        return request('/deck-reviews/start', {
            method: 'POST',
            body: { id_deck: deckId },
            token,
        });
    }

    export async function finishDeckReview(reviewId, qtdFlashcardsRevisados, token) {
        return request(`/deck-reviews/finish/${reviewId}`, {
            method: 'PUT',
            body: { qtd_flashcards_revisados: qtdFlashcardsRevisados },
            token,
        });
    }