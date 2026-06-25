import Header from '../../components/Header/Header';
import knightImg from '../../assets/icon-user.png';
import cavloImg from '../../assets/cavlo.png';
import './User.css';

const AVATAR_LIST = [
    { id: 1, name: 'Cavaleiro', image: cavloImg  },
    { id: 2, name: 'Bruxa', image: null },
    { id: 3, name: 'Guerreira', image: null },
    { id: 4, name: 'Mago', image: null },
    { id: 5, name: 'Elfo', image: null },
];

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

                <div className="user-avatars-section">
                    <h2>Meus Avatares</h2>
                    <div className="avatars-container">
                        {AVATAR_LIST.map((avatar, index) => {
                            const isFirst = index === 0;
                            return (
                                <div
                                    key={avatar.id}
                                    className={`avatar-card ${isFirst ? 'active' : 'locked'}`}
                                    title={avatar.name}
                                >
                                    {avatar.image ? (
                                        <img src={avatar.image} alt={avatar.name} className="avatar-img" />
                                    ) : (
                                        <div className="avatar-placeholder">
                                            <span className="avatar-placeholder-initial">
                                                {avatar.name ? avatar.name[0] : '?'}
                                            </span>
                                            <span className="avatar-placeholder-name">
                                                {avatar.name}
                                            </span>
                                        </div>
                                    )}
                                    {!isFirst && (
                                        <div className="avatar-lock-overlay" title="Bloqueado">
                                            🔒
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}