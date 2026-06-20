import './HelpEstudos.css';

export default function HelpEstudos({ onBack }) {
    return (
        <main className="help-estudos-container">
            <header className="help-estudos-topbar">
                <div className="help-estudos-logo">KNIGHT OF<br />QUESTIONS</div>

                <nav className="help-estudos-nav">
                    <span>Casa</span>
                    <span>Patente</span>
                    <strong>Ajuda</strong>
                </nav>

                <div className="help-estudos-user">
                    <span>10.000</span>
                    <small>Sr. Cavaleiro...</small>
                </div>
            </header>

            <button className="help-estudos-back" onClick={onBack}>◀</button>

            <section className="help-estudos-title">
                <div className="help-estudos-icon">📖</div>
                <h1>ESTUDOS</h1>
                <p>Tudo sobre flashcards, questões e suas ferramentas de revisão.</p>
            </section>

            <section className="help-estudos-cards">
                <div className="help-estudos-card">
                    <h2>CRIANDO E GERENCIANDO DECKS</h2>
                    <p>Para criar um deck, vá em Cards &gt; + Novo Deck. Nomeie seu deck, selecione a matéria e adicione cards com frente e verso.</p>
                </div>

                <div className="help-estudos-card">
                    <h2>BANCO DE QUESTÕES E FILTROS</h2>
                    <p>Na seção Questões, filtre por vestibular, matéria ou dificuldade para encontrar os conteúdos que deseja estudar.</p>
                </div>

                <div className="help-estudos-card">
                    <h2>JOGOS EDUCATIVOS</h2>
                    <p>Os jogos ajudam a reforçar o aprendizado de forma divertida e podem contribuir para o ranking.</p>
                </div>
            </section>

            <section className="help-estudos-support">
                <p>Não encontrou o que procurava?</p>
                <button>▣ Falar com o suporte</button>
            </section>
        </main>
    );
}