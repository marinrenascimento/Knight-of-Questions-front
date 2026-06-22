import { useEffect, useMemo, useState } from 'react';
import './Ranking.css';

import Header from '../../components/Header/Header';
import Podium from './Podium';
import RankingItem from './RankingItem';
import UserRanking from './UserRanking';

import { getRanking } from '../../services/api.js';

function normalizeRankingPayload(payload) {
    if (Array.isArray(payload)) {
        return payload;
    }

    if (Array.isArray(payload?.rankings)) {
        return payload.rankings;
    }

    if (Array.isArray(payload?.data?.rankings)) {
        return payload.data.rankings;
    }

    return [];
}

function normalizeRankingItem(usuario, fallbackIndex = 0) {
    return {
        id: usuario?.id ?? usuario?.userId ?? fallbackIndex,
        userId: usuario?.userId ?? usuario?.id ?? fallbackIndex,
        nome: usuario?.nome || usuario?.name || usuario?.username || 'Jogador',
        name: usuario?.name || usuario?.nome || usuario?.username || 'Jogador',
        username: usuario?.username || '',
        email: usuario?.email || '',
        role: usuario?.role || '',
        criadoEm: usuario?.criado_em || usuario?.criadoEm || '',
        pontos: Number(usuario?.pontos ?? 0),
        nivel: usuario?.nivel ?? 0,
        idAvatar: usuario?.id_avatar ?? usuario?.idAvatar ?? null,
        position: Number(usuario?.position ?? fallbackIndex + 1),
        isCurrentUser: Boolean(usuario?.isCurrentUser),
    };
}

function sortRanking(a, b) {
    const positionA = Number(a?.position ?? Number.POSITIVE_INFINITY);
    const positionB = Number(b?.position ?? Number.POSITIVE_INFINITY);

    if (positionA !== positionB) {
        return positionA - positionB;
    }

    return Number(b?.pontos ?? 0) - Number(a?.pontos ?? 0);
}

export default function Ranking({ currentUser, logout, perfilPontos, token }) {
    const [ranking, setRanking] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let active = true;

        async function carregarRanking() {
            setLoading(true);
            setError('');

            try {
                const response = await getRanking(token);
                if (!active) return;

                const lista = normalizeRankingPayload(response)
                    .map((usuario, index) => normalizeRankingItem(usuario, index + 1))
                    .sort(sortRanking);

                setRanking(lista);
            } catch (error) {
                if (!active) return;

                console.error('Erro ao carregar ranking:', error);
                setRanking([]);
                setError('Não foi possível carregar o ranking no momento.');
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        }

        carregarRanking();

        return () => {
            active = false;
        };
    }, [token]);

    const podiumUsers = useMemo(() => ranking.slice(0, 3), [ranking]);
    const currentUserRanking = useMemo(() => {
        const rankedUser = ranking.find((usuario) => usuario?.isCurrentUser)
            || ranking.find((usuario) => usuario?.userId === currentUser?.id);

        if (rankedUser) {
            return rankedUser;
        }

        return currentUser
            ? {
                id: currentUser.id,
                userId: currentUser.id,
                nome: currentUser.nome || currentUser.name || 'Você',
                username: currentUser.username,
                email: currentUser.email,
                role: currentUser.role,
                criadoEm: currentUser.criado_em || currentUser.criadoEm,
                pontos: perfilPontos?.pontos ?? 0,
                nivel: perfilPontos?.nivel ?? 0,
                idAvatar: currentUser.id_avatar || currentUser.idAvatar,
                position: perfilPontos?.rank ?? '—',
                isCurrentUser: true,
            }
            : null;
    }, [ranking, currentUser, perfilPontos?.pontos, perfilPontos?.rank, perfilPontos?.nivel]);

    const topList = useMemo(() => ranking.slice(0, 4), [ranking]);

    return (
        <div className="ranking-page">

            <Header
                currentUser={currentUser}
                logout={logout}
                perfilPontos={perfilPontos}
            />

            <main className="ranking-shell">
                <section className="ranking-hero">
                    {loading ? (
                        <div className="ranking-loading">Carregando ranking...</div>
                    ) : error ? (
                        <div className="ranking-empty">{error}</div>
                    ) : (
                        <Podium users={podiumUsers} />
                    )}
                </section>

                <section className="ranking-content">
                    <div className="ranking-list">
                        {loading ? (
                            <div className="ranking-empty">Carregando colocados...</div>
                        ) : error ? (
                            <div className="ranking-empty">{error}</div>
                        ) : topList.length > 0 ? (
                            topList.map((usuario) => (
                                <RankingItem key={usuario.id || `${usuario.position}-${usuario.nome}`} user={usuario} />
                            ))
                        ) : (
                            <div className="ranking-empty">Nenhum participante encontrado.</div>
                        )}
                    </div>

                    <aside className="ranking-side">
                        <UserRanking user={currentUserRanking} perfilPontos={perfilPontos} />
                    </aside>
                </section>
            </main>
        </div>
    );
}