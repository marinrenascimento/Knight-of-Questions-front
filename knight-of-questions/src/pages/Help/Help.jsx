import { useState } from 'react';
import './Help.css';
import Header from '../../components/Header/Header.jsx';
import HelpEstudos from './HelpEstudos.jsx';
import HelpConta from './HelpConta.jsx';
import HelpPrivacidade from './HelpPrivacidade.jsx';
import HelpFeedback from './HelpFeedback.jsx';
import SupportModal from '../../components/SupportModal.jsx';
import {
  BookIcon,
  UserIcon,
  ShieldIcon,
  MessageSquareIcon,
  MessageCircleIcon
} from './HelpIcons.jsx';

export default function Help({ currentUser, logout, perfilPontos }) {
  const [tela, setTela] = useState('principal');
  const [showSupportModal, setShowSupportModal] = useState(false);

  const sharedProps = {
    currentUser,
    logout,
    perfilPontos,
    onBack: () => setTela('principal'),
    onOpenSupport: () => setShowSupportModal(true),
  };

  if (tela === 'estudos') {
    return (
      <>
        <HelpEstudos {...sharedProps} />
        {showSupportModal && <SupportModal onClose={() => setShowSupportModal(false)} />}
      </>
    );
  }

  if (tela === 'conta') {
    return (
      <>
        <HelpConta {...sharedProps} />
        {showSupportModal && <SupportModal onClose={() => setShowSupportModal(false)} />}
      </>
    );
  }

  if (tela === 'privacidade') {
    return (
      <>
        <HelpPrivacidade {...sharedProps} />
        {showSupportModal && <SupportModal onClose={() => setShowSupportModal(false)} />}
      </>
    );
  }

  if (tela === 'feedback') {
    return (
      <>
        <HelpFeedback {...sharedProps} />
        {showSupportModal && <SupportModal onClose={() => setShowSupportModal(false)} />}
      </>
    );
  }

  return (
    <div className="help-page-layout">
      <Header currentUser={currentUser} logout={logout} perfilPontos={perfilPontos} />

      <main className="help-content-container">
        <section className="help-options">
          <button className="help-option-btn" onClick={() => setTela('estudos')}>
            <span className="help-option-icon">
              <BookIcon size={36} />
            </span>
            <span className="help-option-text">ESTUDOS</span>
          </button>

          <button className="help-option-btn" onClick={() => setTela('conta')}>
            <span className="help-option-icon">
              <UserIcon size={36} />
            </span>
            <span className="help-option-text">CONTA</span>
          </button>

          <button className="help-option-btn" onClick={() => setTela('privacidade')}>
            <span className="help-option-icon">
              <ShieldIcon size={36} />
            </span>
            <span className="help-option-text">PRIVACIDADE</span>
          </button>

          <button className="help-option-btn" onClick={() => setTela('feedback')}>
            <span className="help-option-icon">
              <MessageSquareIcon size={36} />
            </span>
            <span className="help-option-text">FEEDBACK</span>
          </button>
        </section>

        <section className="help-faq">
          <h2 className="help-faq-title">PERGUNTAS FREQUENTES</h2>

          <div className="help-faq-item">
            <h3 className="help-faq-question">COMO CRIAR UM NOVO DECK DE FLASHCARDS?</h3>
            <p className="help-faq-answer">
              Acesse a seção "Cards" no menu principal e clique no botão "+ Novo Deck". Dê um nome ao deck, escolha a matéria e comece a adicionar seus cards com frente e verso.
            </p>
          </div>

          <div className="help-faq-item">
            <h3 className="help-faq-question">POSSO FILTRAR QUESTÕES POR VESTIBULAR OU MATÉRIA?</h3>
            <p className="help-faq-answer">
              Sim! Na seção "Questões", use os filtros de prova (ENEM, ITA, FUVEST, etc.), matéria e nível de dificuldade para encontrar exatamente o que precisa.
            </p>
          </div>

          <div className="help-faq-item">
            <h3 className="help-faq-question">COMO FUNCIONA O RANKING?</h3>
            <p className="help-faq-answer">
              O ranking é atualizado com base na quantidade de moedas acumuladas por todos os jogadores. Mantenha uma rotina de estudos para subir de posição.
            </p>
          </div>

          <div className="help-faq-item">
            <h3 className="help-faq-question">OS RELATÓRIOS MOSTRAM QUAIS INFORMAÇÕES?</h3>
            <p className="help-faq-answer">
              Os relatórios exibem horas de estudo por dia, taxa de acerto por matéria, sequência de dias estudados e evolução semanal/mensal do seu desempenho.
            </p>
          </div>
        </section>

        <section className="help-support">
          <p className="help-support-text">Não encontrou o que procurava?</p>
          <button className="help-support-btn" onClick={() => setShowSupportModal(true)}>
            <MessageCircleIcon size={18} style={{ marginRight: '6px' }} /> Falar com o suporte
          </button>
        </section>
      </main>

      {showSupportModal && <SupportModal onClose={() => setShowSupportModal(false)} />}
    </div>
  );
}