import { Link, useLocation } from 'react-router-dom';
import './Header.css';
import knightImg from '../../assets/icon-user.png';

export default function Header({ currentUser, logout, perfilPontos }) {
  const location = useLocation();

  const userName = currentUser?.nome || currentUser?.name || currentUser?.email || 'Visitante';
  const pontos = perfilPontos?.pontos ?? '—';
  const rank = perfilPontos?.rank ?? '—';

  return (
    <header className="kq-header">
      <div className="header-logo">
        <div className="logo-placeholder pixel-text">
          <span className="logo-knight">KNIGHT OF</span>
          <br />
          <span className="logo-questions">QUESTIONS</span>
        </div>
      </div>

      <nav className="header-nav">
        <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>Home</Link>
        <span className="nav-separator">|</span>
        <Link to="/rank" className={`nav-link ${location.pathname === '/rank' ? 'active' : ''}`}>Rank</Link>
        <span className="nav-separator">|</span>
        <Link to="/help" className={`nav-link ${location.pathname === '/help' ? 'active' : ''}`}>Help</Link>
      </nav>

      <div className="header-profile">
        <div className="profile-coins">
          <div className="coin-icon" aria-hidden="true">💰</div>
          <div className="coin-info">
            <span className="coin-amount">{userName}</span>
            <span className="user-rank">{rank} • {pontos.toLocaleString('pt-BR')}</span>
          </div>
        </div>
        <Link to="/user" className="profile-avatar">
          <div className="icon-avatar">
            <img src={knightImg} alt="Knight of Questions" />
          </div>
        </Link>
        <button className="logout-button" onClick={logout} title="Sair" aria-label="Sair">
          Sair
        </button>
      </div>
    </header>
  );
}
