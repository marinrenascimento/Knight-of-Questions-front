import Header from '../../components/Header/Header';
import knightImg from '../../assets/home-knight.png';
import './User.css';

export default function User({
    currentUser,
    logout,
    perfilPontos,
}) {
    const nome =
        currentUser?.nome ||
        currentUser?.name ||
        currentUser?.email ||
        'Visitante';

    return (
        <div className="user-page">
            <Header
                currentUser={currentUser}
                logout={logout}
                perfilPontos={perfilPontos}
            />

            <div className="user-content">
                <div className="user-profile-card">
                    <div className="user-avatar">
                        <img src={knightImg} alt="Knight of Questions" />
                    </div>

                    <div className="user-info">
                        <h1>{nome}</h1>
                        <p>Aventureiro do Reino das Questões</p>
                    </div>
                </div>

                <div className="user-stats">
                    <div className="user-stat-card">
                        <h3>Pontos</h3>
                        <span>
                            {(perfilPontos?.pontos ?? 0).toLocaleString('pt-BR')}
                        </span>
                    </div>

                    <div className="user-stat-card">
                        <h3>Nível</h3>
                        <span>{perfilPontos?.nivel ?? 0}</span>
                    </div>

                    <div className="user-stat-card">
                        <h3>Rank</h3>
                        <span>{perfilPontos?.rank ?? '—'}</span>
                    </div>
                </div>

                <div className="user-placeholder">
                    <h2>🏰 Salão do Herói</h2>

                    <p>
                        Esta área será expandida em futuras versões do sistema.
                    </p>

                    <div className="user-features">
                        <div className="feature-card">
                            🏆 Conquistas
                        </div>

                        <div className="feature-card">
                            🎖️ Medalhas
                        </div>

                        <div className="feature-card">
                            📈 Estatísticas
                        </div>

                        <div className="feature-card">
                            📚 Histórico de Estudos
                        </div>

                        <div className="feature-card">
                            ⚔️ Progressão
                        </div>

                        <div className="feature-card">
                            🎨 Customização
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}