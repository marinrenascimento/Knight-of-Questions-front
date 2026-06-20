import React from 'react';
import './Help.css';
import Header from './Header/Header.jsx';
import { ArrowLeftIcon, BookIcon, MessageCircleIcon } from './HelpIcons.jsx';

export default function HelpEstudos({ onBack, currentUser, logout, perfilPontos, onOpenSupport }) {
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
            <BookIcon size={48} />
          </div>
          <h1 className="pixel-text">ESTUDOS</h1>
          <p>Tudo sobre flashcards, questões e suas ferramentas de revisão.</p>
        </section>

        <section className="help-cards-list">
          <div className="help-card-item">
            <h2>CRIANDO E GERENCIANDO DECKS</h2>
            <p>Para criar um deck, vá em Cards &gt; + Novo Deck. Nomeie seu deck, selecione a matéria e adicione cards com frente e verso.</p>
          </div>

          <div className="help-card-item">
            <h2>BANCO DE QUESTÕES E FILTROS</h2>
            <p>Na seção Questões, filtre por vestibular, matéria ou dificuldade para encontrar os conteúdos que deseja estudar.</p>
          </div>

          <div className="help-card-item">
            <h2>JOGOS EDUCATIVOS</h2>
            <p>Os jogos ajudam a reforçar o aprendizado de forma divertida e podem contribuir para o ranking.</p>
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