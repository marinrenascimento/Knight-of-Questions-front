import { useState } from 'react';
import './Help.css';

import HelpEstudos from './HelpEstudos.jsx';
import HelpConta from './HelpConta.jsx';
import HelpPrivacidade from './HelpPrivacidade.jsx';
import HelpFeedback from './HelpFeedback.jsx';

export default function Help() {
    const [tela, setTela] = useState('principal');

    if (tela === 'estudos') {
        return <HelpEstudos onBack={() => setTela('principal')} />;
    }

    if (tela === 'conta') {
        return <HelpConta onBack={() => setTela('principal')} />;
    }

    if (tela === 'privacidade') {
        return <HelpPrivacidade onBack={() => setTela('principal')} />;
    }

    if (tela === 'feedback') {
        return <HelpFeedback onBack={() => setTela('principal')} />;
    }

    return (
        <main className="help-container">
            <header className="help-topbar">
                <div className="help-logo">KNIGHT OF<br />QUESTIONS</div>

                <nav className="help-nav">
                    <span>Casa</span>
                    <span>Patente</span>
                    <strong>Ajuda</strong>
                </nav>

                <div className="help-user">
                    <span>10.000</span>
                    <small>Sr. Cavaleiro...</small>
                </div>
            </header>

            <section className="help-options">
                <button onClick={() => setTela('estudos')}>📖<span>ESTUDOS</span></button>
                <button onClick={() => setTela('conta')}>👤<span>CONTA</span></button>
                <button onClick={() => setTela('privacidade')}>🛡️<span>PRIVACIDADE</span></button>
                <button onClick={() => setTela('feedback')}>💬<span>FEEDBACK</span></button>
            </section>

            <section className="help-faq">
                <h2>PERGUNTAS FREQUENTES</h2>

                <h3>COMO CRIAR UM NOVO DECK DE FLASHCARDS?</h3>
                <p>Acesse a seção Cards no menu principal e clique em Novo Deck.</p>

                <h3>POSSO FILTRAR QUESTÕES POR VESTIBULAR OU MATÉRIA?</h3>
                <p>Sim, use os filtros disponíveis na área de questões.</p>

                <h3>COMO FUNCIONA O RANKING?</h3>
                <p>O ranking é atualizado conforme seu desempenho na plataforma.</p>

                <h3>OS RELATÓRIOS MOSTRAM QUAIS INFORMAÇÕES?</h3>
                <p>Mostram dados sobre seus estudos, acertos e evolução.</p>
            </section>

            <section className="help-support">
                <p>Não encontrou o que procurava?</p>
                <button>▣ Falar com o suporte</button>
            </section>
        </main>
    );
}