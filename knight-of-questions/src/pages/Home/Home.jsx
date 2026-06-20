import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

import bannerImg from '../../assets/home-banner-completo.png';
import knightImg from '../../assets/home-knight.png';
import questoesImg from '../../assets/card-questoes.png';
import decksImg from '../../assets/card-decks.png';
import jogosImg from '../../assets/card-jogos.png';
import relatoriosImg from '../../assets/card-relatorios.png';
import Header from '../../components/Header/Header';
import { getDadosMensal } from '../../services/relatorioService';
import { getAcessosRecentes } from '../../services/api';

const STORAGE_KEY = 'aulafront_auth';

function getAuth() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return {};
        return JSON.parse(raw);
    } catch {
        return {};
    }
}

export default function Home({ currentUser, logout, perfilPontos }) {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dados, setDados] = useState(null);
    const [acessosRecentes, setAcessosRecentes] = useState(null);

    useEffect(() => {
        async function loadUser() {
            setLoading(true);
            setError(null);

            try {
                const { token, user } = getAuth();
                const userId = user?.id || currentUser?.id;
                const resultado = await getDadosMensal(token, userId);
                setDados(resultado);
            } catch (e) {
                setError('Não foi possível carregar os dados. Tente novamente.');
            }

            try {
                const raw = localStorage.getItem(STORAGE_KEY);
                const stored = raw ? JSON.parse(raw) : null;

                if (!stored?.token || !stored?.user?.id) {
                    throw new Error('Usuário não encontrado. Faça login novamente.');
                }

                const recentes = await getAcessosRecentes(
                    stored.user.id,
                    stored.token
                );

                setAcessosRecentes(recentes);

                const response = await fetch(`http://localhost:3000/users/view/${stored.user.id}`, {
                    headers: {
                        Authorization: `Bearer ${stored.token}`,
                    },
                });

                const data = await response.json();
                setUser(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        loadUser();
    }, []);

    const menuCards = [
        { key: 'questoes', label: 'Questões', img: questoesImg, route: null },
        { key: 'jogos', label: 'Jogos', img: jogosImg, route: null },
        { key: 'decks', label: 'Decks', img: decksImg, route: null },
        { key: 'relatorios', label: 'Relatórios', img: relatoriosImg, route: '/mensal' },
    ];

    const acessos = [];

    if (acessosRecentes?.deck_recente) {
        acessos.push({
            id: acessosRecentes.deck_recente.id,
            titulo: acessosRecentes.deck_recente.deck_nome,
            descricao: acessosRecentes.deck_recente.deck_descricao,
            tipo: 'Deck',
        });
    }

    if (acessosRecentes?.avaliacao_recente) {
        acessos.push({
            id: acessosRecentes.avaliacao_recente.id,
            titulo: acessosRecentes.avaliacao_recente.nome,
            descricao: 'Avaliação',
            tipo: 'Avaliação',
        });
    }

    return (
        <div className="home-page">
            <Header currentUser={currentUser} logout={logout} perfilPontos={perfilPontos} />
            <div className="home-top">
                <div className="home-banner">
                    <img src={bannerImg} alt="Knight of Questions" className="home-banner__img" />
                </div>
                <img src={knightImg} alt="Imagem de cavalheiro" className="home-knight" />
            </div>

            {error && <p className="home-error">{error}</p>}

            <div className="home-content">
                <aside className="home-recent">
                    <h3 className="home-recent__title">Acessos Recentes</h3>
                    <div className="home-recent__grid">

                        {acessos.length === 0 ? (
                            <div className="home-recent__empty">
                                <div className="home-recent__empty-icon">🎒</div>
                                <p>O diário de aventuras está vazio.</p>
                                <span>
                                    Que tal começar uma jornada?
                                </span>
                            </div>
                        ) : (
                            acessos.map((item) => (
                                <button
                                    key={item.id}
                                    className="home-recent__card"
                                >
                                    <div className="home-recent__card-icon">
                                        {item.tipo === 'deck' ? '📚' : '📜'}
                                    </div>

                                    <div className="home-recent__card-content">
                                        <h4 className="home-recent__title">{item.tipo === 'deck' ? 'Último Deck' : 'Última Avaliação'}</h4>
                                        <h2 className="pixel-text section-title">
                                            {item.titulo}
                                        </h2>
                                    </div>
                                </button>
                            ))
                        )}

                    </div>
                </aside>

                <main className="home-menu">
                    {menuCards.map((card) => (
                        <button
                            key={card.key}
                            className="home-menu__card"
                            onClick={() => card.route && navigate(card.route)}
                        >
                            <img src={card.img} alt={card.label} className="home-menu__img" />
                        </button>
                    ))}
                </main>
            </div>
        </div>
    );
}