import { useEffect, useMemo, useState } from 'react';
import './Ranking.css';

import Header from '../../components/Header/Header';
import Podium from './Podium';
import RankingItem from './RankingItem';
import UserRanking from './UserRanking';

const DEMO_RANKING = [
    {
        id: 1,
        position: 1,
        nome: 'ELORIA',
        pontos: 19000,
        isCurrentUser: false,
    },
    {
        id: 2,
        position: 2,
        nome: 'MARIA',
        pontos: 16000,
        isCurrentUser: false,
    },
    {
        id: 3,
        position: 3,
        nome: 'EDMUND',
        pontos: 14000,
        isCurrentUser: false,
    },
    {
        id: 4,
        position: 4,
        nome: 'MARIA',
        pontos: 9000,
        isCurrentUser: false,
    },
];

const DEMO_CURRENT_USER = {
    position: 34,
    nome: 'GABRIEL B.',
    pontos: 2000,
};

export default function Ranking({ currentUser, logout, perfilPontos }) {
    const [ranking] = useState(DEMO_RANKING);
    const [loading] = useState(false);

    useEffect(() => {
        localStorage.setItem('ranking_demo_active', 'true');
    }, []);

    const podiumUsers = useMemo(() => ranking.slice(0, 3), [ranking]);
    const currentUserRanking = useMemo(() => {
        return ranking.find((usuario) => usuario?.isCurrentUser)
            || ranking.find((usuario) => usuario?.userId === currentUser?.id)
            || DEMO_CURRENT_USER;
    }, [ranking, currentUser?.id]);

    const topList = useMemo(() => ranking.slice(0, 4), [ranking]);

    return (
        <div className="ranking-page">
            <div className="ranking-page__label pixel-text">Ranking</div>

            <Header
                currentUser={currentUser}
                logout={logout}
                perfilPontos={perfilPontos}
            />

            <main className="ranking-shell">
                <section className="ranking-hero">
                    {loading ? (
                        <div className="ranking-loading">Carregando ranking...</div>
                    ) : (
                        <Podium users={podiumUsers} />
                    )}
                </section>

                <section className="ranking-content">
                    <div className="ranking-list">
                        {loading ? (
                            <div className="ranking-empty">Carregando colocados...</div>
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