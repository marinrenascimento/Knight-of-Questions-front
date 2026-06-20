import './Help.css';
import Header from './Header/Header.jsx';
import { ArrowLeftIcon, MessageSquareIcon, MessageCircleIcon } from './HelpIcons.jsx';

export default function HelpFeedback({ onBack, currentUser, logout, perfilPontos, onOpenSupport }) {
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
            <MessageSquareIcon size={48} />
          </div>
          <h1 className="pixel-text">FEEDBACK</h1>
          <p>Envie sugestões, reporte bugs ou compartilhe ideias.</p>
        </section>

        <section className="help-cards-list">
          <div className="help-card-item">
            <h2>REPORTAR UM BUG</h2>
            <p>Descreva o problema encontrado, a página onde aconteceu e o dispositivo usado.</p>
          </div>

          <div className="help-card-item">
            <h2>ENVIAR SUGESTÃO DE FUNCIONALIDADE</h2>
            <p>Envie sua ideia para melhorar a plataforma e ajudar outros estudantes.</p>
          </div>

          <div className="help-card-item">
            <h2>FEEDBACK GERAL</h2>
            <p>Sua opinião é importante para melhorar a experiência dentro do Knight of Questions.</p>
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