import './Help.css';
import Header from './Header/Header.jsx';
import { ArrowLeftIcon, UserIcon, MessageCircleIcon } from './HelpIcons.jsx';

export default function HelpConta({ onBack, currentUser, logout, perfilPontos, onOpenSupport }) {
  return (
    <div className="help-page-layout">
      <Header currentUser={currentUser} logout={logout} perfilPontos={perfilPontos} />

      <main className="help-content-container">
        <div className="help-back-area">
          <button className="help-back-btn" onClick={onBack} title="Voltar">
            <ArrowLeftIcon size={16} />
          </button>
        </div>

        <section className="help-section-title">
          <div className="help-section-icon">
            <UserIcon size={48} />
          </div>
          <h1 className="pixel-text">CONTA</h1>
          <p>Gerencie seu perfil, avatar e configurações pessoais.</p>
        </section>

        <section className="help-cards-list">
          <div className="help-card-item">
            <h2>EDITANDO SEU PERFIL</h2>
            <p>Acesse seu perfil clicando no ícone do avatar no canto superior direito.</p>
          </div>

          <div className="help-card-item">
            <h2>ESCOLHENDO SEU AVATAR</h2>
            <p>Escolha entre os avatares disponíveis na área de configurações da conta.</p>
          </div>

          <div className="help-card-item">
            <h2>ALTERANDO SENHA</h2>
            <p>Vá em Configurações, depois em Segurança, para alterar sua senha.</p>
          </div>
        </section>

        <section className="help-support">
          <p className="help-support-text">Não encontrou o que procurava?</p>
          <button className="help-support-btn" onClick={onOpenSupport}>
            <MessageCircleIcon size={18} style={{ marginRight: '6px' }} /> Falar com o suporte
          </button>
        </section>
      </main>
    </div>
  );
}